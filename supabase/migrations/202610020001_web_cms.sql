begin;

-- Esquema interno. No añadir a los esquemas expuestos de la Data API.
create schema web_private;

revoke all on schema web_private from public;
grant usage on schema web_private to authenticated;

-- Los permisos se asignan desde el backend/SQL, nunca desde el cliente.
create table web_private.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'publisher')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table web_private.admin_members enable row level security;
revoke all on web_private.admin_members from anon, authenticated;

-- Verifica identidad, correo confirmado y membresía activa.
create function web_private.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from web_private.admin_members m
    join auth.users u on u.id = m.user_id
    where m.user_id = (select auth.uid())
      and m.enabled
      and m.role = any(allowed_roles)
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function web_private.has_role(text[]) from public;
grant execute on function web_private.has_role(text[]) to authenticated;

-- Borradores: nunca se leen desde la superficie pública.
create table public.web_cms_drafts (
  id uuid primary key default gen_random_uuid(),
  content_key text not null
    check (
      char_length(content_key) between 1 and 120
      and content_key ~ '^[a-z0-9][a-z0-9_-]*$'
    ),
  locale text not null check (locale in ('pl', 'es', 'en')),
  kind text not null check (
    kind in (
      'page', 'service', 'story', 'promotion',
      'testimonial', 'article'
    )
  ),
  document jsonb not null default '{}'::jsonb
    check (
      jsonb_typeof(document) = 'object'
      and octet_length(document::text) <= 262144
    ),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  unique (content_key, locale)
);

alter table public.web_cms_drafts enable row level security;
revoke all on public.web_cms_drafts from anon, authenticated;
grant select, insert on public.web_cms_drafts to authenticated;
grant update (document) on public.web_cms_drafts to authenticated;

create policy cms_drafts_read
on public.web_cms_drafts
for select to authenticated
using (
  web_private.has_role(array['owner', 'editor', 'publisher'])
);

create policy cms_drafts_create
on public.web_cms_drafts
for insert to authenticated
with check (
  revision = 1
  and web_private.has_role(array['owner', 'editor'])
);

create policy cms_drafts_edit
on public.web_cms_drafts
for update to authenticated
using (
  web_private.has_role(array['owner', 'editor'])
)
with check (
  web_private.has_role(array['owner', 'editor'])
);

-- Copia publicada independiente: editar un borrador no cambia la web.
create table public.web_cms_published (
  content_key text not null,
  locale text not null check (locale in ('pl', 'es', 'en')),
  kind text not null,
  document jsonb not null
    check (jsonb_typeof(document) = 'object'),
  source_revision bigint not null,
  published_at timestamptz not null default now(),
  primary key (content_key, locale)
);

alter table public.web_cms_published enable row level security;
revoke all on public.web_cms_published from anon, authenticated;
grant select on public.web_cms_published to anon, authenticated;

create policy cms_published_read
on public.web_cms_published
for select to anon, authenticated
using (true);

-- Auditoría interna: no guarda textos ni datos de clientes.
create table web_private.cms_audit (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  content_key text not null,
  locale text not null,
  revision bigint not null,
  occurred_at timestamptz not null default now()
);

alter table web_private.cms_audit enable row level security;
revoke all on web_private.cms_audit from anon, authenticated;

-- Historial privado de borradores para recuperación.
create table web_private.cms_versions (
  draft_id uuid not null,
  revision bigint not null,
  document jsonb not null,
  actor_id uuid,
  created_at timestamptz not null default now(),
  primary key (draft_id, revision)
);

alter table web_private.cms_versions enable row level security;
revoke all on web_private.cms_versions from anon, authenticated;

create function web_private.prepare_draft()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
  else
    new.revision := 1;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function web_private.prepare_draft() from public;

create trigger cms_draft_revision
before insert or update on public.web_cms_drafts
for each row execute function web_private.prepare_draft();

create function web_private.record_draft()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into web_private.cms_versions (
    draft_id, revision, document, actor_id
  )
  values (
    new.id, new.revision, new.document, auth.uid()
  );

  insert into web_private.cms_audit (
    actor_id, action, content_key, locale, revision
  )
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'draft_created' else 'draft_updated' end,
    new.content_key,
    new.locale,
    new.revision
  );

  return new;
end;
$$;

revoke all on function web_private.record_draft() from public;

create trigger cms_draft_history
after insert or update on public.web_cms_drafts
for each row execute function web_private.record_draft();

-- Publicación transaccional con control de versión.
-- El navegador no puede escribir directamente en la tabla publicada.
create function public.web_cms_publish(
  p_draft_id uuid,
  p_expected_revision bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  draft public.web_cms_drafts%rowtype;
begin
  if not web_private.has_role(array['owner', 'publisher']) then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  select *
  into draft
  from public.web_cms_drafts
  where id = p_draft_id
  for update;

  if not found then
    raise exception 'Draft not found' using errcode = 'P0002';
  end if;

  if draft.revision is distinct from p_expected_revision then
    raise exception 'Draft changed; reload before publishing'
      using errcode = '40001';
  end if;

  if coalesce(jsonb_typeof(draft.document -> 'title'), '') <> 'string'
     or char_length(btrim(draft.document ->> 'title')) not between 1 and 200
     or coalesce(jsonb_typeof(draft.document -> 'body'), '') <> 'string'
     or char_length(btrim(draft.document ->> 'body')) < 1 then
    raise exception 'A title and body are required'
      using errcode = '22023';
  end if;

  insert into public.web_cms_published (
    content_key, locale, kind, document,
    source_revision, published_at
  )
  values (
    draft.content_key, draft.locale, draft.kind,
    draft.document, draft.revision, now()
  )
  on conflict (content_key, locale)
  do update set
    kind = excluded.kind,
    document = excluded.document,
    source_revision = excluded.source_revision,
    published_at = excluded.published_at;

  insert into web_private.cms_audit (
    actor_id, action, content_key, locale, revision
  )
  values (
    auth.uid(), 'published',
    draft.content_key, draft.locale, draft.revision
  );
end;
$$;

revoke all on function public.web_cms_publish(uuid, bigint)
from public, anon;

grant execute on function public.web_cms_publish(uuid, bigint)
to authenticated;

commit;
