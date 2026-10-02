begin;


-- ============================================================
-- RINCÓN COLOMBIANO
-- BRAND ASSETS
-- ============================================================
--
-- Objetivos:
--
-- 1. Guardar archivos de identidad visual fuera del código.
-- 2. Permitir administración futura desde /admin/brand.
-- 3. Separar archivos subidos de archivos publicados.
-- 4. Mantener historial y auditoría.
-- 5. Impedir escrituras directas desde el navegador.
-- 6. Mantener lectura pública únicamente de la selección
--    actualmente publicada.
--
-- Los uploads se realizarán posteriormente desde Server Actions
-- protegidas mediante requireAdminIdentity() y service_role.
--
-- Nunca se expondrá SUPABASE_SERVICE_ROLE_KEY al navegador.
-- ============================================================


-- ============================================================
-- 1. STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'web-brand-assets',
  'web-brand-assets',
  true,
  8388608,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]
)
on conflict (id)
do update set
  public =
    excluded.public,

  file_size_limit =
    excluded.file_size_limit,

  allowed_mime_types =
    excluded.allowed_mime_types;


-- ============================================================
-- 2. BRAND ASSETS
-- ============================================================
--
-- Contiene todos los recursos cargados.
--
-- NO significa que estén publicados.
--
-- Un administrador puede cargar:
--
-- logo_primary
-- logo_compact
-- logo_light
-- logo_dark
-- favicon
-- open_graph
-- social_square
--
-- La web pública utiliza únicamente web_brand_published.
-- ============================================================

create table if not exists public.web_brand_assets (
  id
    uuid
    primary key
    default gen_random_uuid(),

  slot
    text
    not null
    check (
      slot in (
        'logo_primary',
        'logo_compact',
        'logo_light',
        'logo_dark',
        'favicon',
        'open_graph',
        'social_square'
      )
    ),

  object_path
    text
    not null
    unique
    check (
      char_length(object_path)
        between 1 and 500
    ),

  original_name
    text
    not null
    check (
      char_length(original_name)
        between 1 and 255
    ),

  mime_type
    text
    not null
    check (
      mime_type in (
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/avif',
        'image/x-icon',
        'image/vnd.microsoft.icon'
      )
    ),

  size_bytes
    bigint
    not null
    check (
      size_bytes > 0
      and
      size_bytes <= 8388608
    ),

  width
    integer
    check (
      width is null
      or
      width between 1 and 12000
    ),

  height
    integer
    check (
      height is null
      or
      height between 1 and 12000
    ),

  alt_text
    text
    not null
    default ''
    check (
      char_length(alt_text)
        <= 300
    ),

  sha256
    text
    check (
      sha256 is null
      or
      sha256 ~ '^[a-f0-9]{64}$'
    ),

  uploaded_by
    uuid
    references auth.users(id)
    on delete set null,

  created_at
    timestamptz
    not null
    default now(),

  retired_at
    timestamptz
);


-- ============================================================
-- 3. SECURITY — ASSET REGISTRY
-- ============================================================
--
-- El navegador no administra esta tabla directamente.
--
-- Las futuras Server Actions:
--
-- requireAdminIdentity()
--        ↓
-- server only
--        ↓
-- service_role
--        ↓
-- Storage + metadata
--
-- Esto evita que una sesión pública manipule identidad visual.
-- ============================================================

alter table
  public.web_brand_assets
enable row level security;


revoke all
on public.web_brand_assets
from anon, authenticated;


grant all
on public.web_brand_assets
to service_role;


-- ============================================================
-- 4. PUBLISHED BRAND
-- ============================================================
--
-- Esta tabla representa solamente la identidad actualmente
-- publicada.
--
-- Una fila por slot.
--
-- Al cambiar el logo:
--
-- archivo nuevo
--      ↓
-- asset nuevo
--      ↓
-- publicación
--      ↓
-- esta tabla cambia
--
-- El archivo anterior permanece disponible para rollback.
-- ============================================================

create table if not exists public.web_brand_published (
  slot
    text
    primary key
    check (
      slot in (
        'logo_primary',
        'logo_compact',
        'logo_light',
        'logo_dark',
        'favicon',
        'open_graph',
        'social_square'
      )
    ),

  source_asset_id
    uuid
    not null
    references public.web_brand_assets(id)
    on delete restrict,

  object_path
    text
    not null
    check (
      char_length(object_path)
        between 1 and 500
    ),

  mime_type
    text
    not null,

  alt_text
    text
    not null
    default ''
    check (
      char_length(alt_text)
        <= 300
    ),

  published_by
    uuid
    references auth.users(id)
    on delete set null,

  published_at
    timestamptz
    not null
    default now()
);


-- ============================================================
-- 5. SECURITY — PUBLISHED BRAND
-- ============================================================
--
-- Público:
-- lectura únicamente.
--
-- Escritura:
-- solamente backend privilegiado.
-- ============================================================

alter table
  public.web_brand_published
enable row level security;


revoke all
on public.web_brand_published
from anon, authenticated;


grant select
on public.web_brand_published
to anon, authenticated;


grant all
on public.web_brand_published
to service_role;


drop policy if exists
  web_brand_published_read
on public.web_brand_published;


create policy
  web_brand_published_read
on public.web_brand_published
for select
to anon, authenticated
using (
  true
);


-- ============================================================
-- 6. PRIVATE BRAND AUDIT
-- ============================================================

create table if not exists web_private.brand_audit (
  id
    bigint
    generated always as identity
    primary key,

  actor_id
    uuid
    references auth.users(id)
    on delete set null,

  action
    text
    not null
    check (
      action in (
        'uploaded',
        'published',
        'replaced',
        'retired'
      )
    ),

  slot
    text
    not null,

  asset_id
    uuid,

  occurred_at
    timestamptz
    not null
    default now()
);


alter table
  web_private.brand_audit
enable row level security;


revoke all
on web_private.brand_audit
from anon, authenticated;


grant select, insert
on web_private.brand_audit
to service_role;


-- ============================================================
-- 7. STORAGE SECURITY
-- ============================================================
--
-- IMPORTANTE:
--
-- El bucket es público solamente para LECTURA directa de los
-- archivos que la web publica.
--
-- No concedemos INSERT / UPDATE / DELETE a anon ni a
-- authenticated.
--
-- Las cargas administrativas se harán únicamente desde el
-- servidor usando service_role después de:
--
-- requireAdminIdentity()
--
-- Así un visitante o usuario autenticado normal no puede
-- reemplazar el logo del restaurante.
-- ============================================================

drop policy if exists
  web_brand_assets_authenticated_insert
on storage.objects;

drop policy if exists
  web_brand_assets_authenticated_update
on storage.objects;

drop policy if exists
  web_brand_assets_authenticated_delete
on storage.objects;


-- ============================================================
-- 8. INDEXES
-- ============================================================

create index if not exists
  web_brand_assets_slot_created_idx
on public.web_brand_assets (
  slot,
  created_at desc
);


create index if not exists
  web_brand_assets_active_idx
on public.web_brand_assets (
  retired_at
)
where retired_at is null;


create index if not exists
  web_brand_audit_slot_time_idx
on web_private.brand_audit (
  slot,
  occurred_at desc
);


-- ============================================================
-- 9. COMMENTS
-- ============================================================

comment on table
  public.web_brand_assets
is
  'Registro privado de recursos visuales cargados para Rincón Colombiano. Un asset cargado no implica publicación.';


comment on table
  public.web_brand_published
is
  'Identidad visual actualmente publicada y visible para la web pública.';


comment on table
  web_private.brand_audit
is
  'Auditoría interna de cambios realizados sobre la identidad visual de Rincón Colombiano.';


commit;
