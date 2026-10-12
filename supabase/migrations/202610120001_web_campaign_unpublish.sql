-- Rincón Colombiano: retirada transaccional y auditada de una campaña publicada.
-- El CMS sigue conservando el borrador y su historial para futuras campañas.
--
-- Defensa en profundidad: sólo home_campaign, idiomas soportados, rol
-- owner/publisher ACTIVO y sesión válida (web_private.has_role).
create or replace function public.web_campaign_unpublish(
  p_locale text,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_publication public.web_cms_published%rowtype;
begin
  if auth.uid() is null
    or not web_private.has_role(array['owner', 'publisher'])
  then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  if p_locale not in ('pl', 'es', 'en')
    or p_expected_revision is null
    or p_expected_revision < 1
  then
    raise exception 'Invalid campaign' using errcode = '22023';
  end if;

  select *
    into v_publication
    from public.web_cms_published
   where content_key = 'home_campaign'
     and locale = p_locale
   for update;

  if not found then
    return false;
  end if;

  if v_publication.kind <> 'promotion' then
    raise exception 'Unexpected content type' using errcode = '22023';
  end if;

  if v_publication.source_revision is distinct from p_expected_revision then
    raise exception 'Publication changed; reload' using errcode = '40001';
  end if;

  delete from public.web_cms_published
   where content_key = 'home_campaign'
     and locale = p_locale
     and source_revision = p_expected_revision;

  insert into web_private.cms_audit(
    actor_id, action, content_key, locale, revision
  ) values (
    auth.uid(), 'unpublished', 'home_campaign', p_locale, p_expected_revision
  );

  return true;
end;
$function$;

revoke all on function public.web_campaign_unpublish(text, bigint) from public;
revoke all on function public.web_campaign_unpublish(text, bigint) from anon;
grant execute on function public.web_campaign_unpublish(text, bigint) to authenticated;

comment on function public.web_campaign_unpublish(text, bigint) is
'Removes only a published home_campaign after active role verification and revision match; stores a private audit event.';
