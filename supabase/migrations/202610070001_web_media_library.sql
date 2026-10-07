begin;


-- ============================================================
-- RINCÓN COLOMBIANO
-- ENTERPRISE MEDIA LIBRARY
-- ============================================================
--
-- Infraestructura base para:
--
-- - fotografías;
-- - vídeos;
-- - historias;
-- - galerías;
-- - eventos;
-- - productos;
-- - restaurantes;
-- - contenido de clientes;
-- - comunidad;
-- - SEO;
-- - redes sociales.
--
-- PRINCIPIO DE SEGURIDAD:
--
-- ORIGINAL PRIVADO
--      ↓
-- VALIDACIÓN
--      ↓
-- CUARENTENA / SCAN
--      ↓
-- MODERACIÓN
--      ↓
-- DERECHOS / CONSENTIMIENTO
--      ↓
-- PROCESAMIENTO
--      ↓
-- PUBLICACIÓN
--      ↓
-- BUCKET PÚBLICO
--
-- Un archivo subido NO queda publicado automáticamente.
--
-- El navegador nunca recibe service_role.
--
-- No se permiten SVG ni HTML.
--
-- Los uploads públicos/clientes se implementarán después
-- mediante URLs firmadas temporales emitidas por backend.
-- ============================================================


-- ============================================================
-- 1. PRIVATE ORIGINALS BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'web-media-originals',
  'web-media-originals',
  false,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
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
-- 2. PUBLIC DELIVERY BUCKET
-- ============================================================
--
-- IMPORTANTE:
--
-- Solamente backend privilegiado podrá escribir aquí.
--
-- Un visitante nunca sube directamente contenido al bucket
-- público.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'web-media-public',
  'web-media-public',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm'
  ]::text[]
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
-- 3. MEDIA ASSET REGISTRY
-- ============================================================

create table if not exists public.web_media_assets (

  id
    uuid
    primary key
    default gen_random_uuid(),


  -- ----------------------------------------------------------
  -- SOURCE
  -- ----------------------------------------------------------

  source
    text
    not null
    check (
      source in (
        'admin_upload',
        'community_upload',
        'restaurant_upload',
        'import',
        'external',
        'generated'
      )
    ),


  -- ----------------------------------------------------------
  -- TYPE
  -- ----------------------------------------------------------
  --
  -- Primera versión:
  --
  -- imágenes + vídeo.
  --
  -- Audio/documentos se incorporarán mediante migración
  -- independiente para no ampliar innecesariamente
  -- la superficie de ataque inicial.
  -- ----------------------------------------------------------

  asset_type
    text
    not null
    check (
      asset_type in (
        'image',
        'video'
      )
    ),


  -- ----------------------------------------------------------
  -- LIFECYCLE
  -- ----------------------------------------------------------

  status
    text
    not null
    default 'uploading'
    check (
      status in (
        'uploading',
        'processing',
        'ready',
        'failed',
        'quarantined',
        'archived',
        'deleted'
      )
    ),


  visibility
    text
    not null
    default 'private'
    check (
      visibility in (
        'public',
        'private',
        'unlisted'
      )
    ),


  moderation_status
    text
    not null
    default 'pending'
    check (
      moderation_status in (
        'not_required',
        'pending',
        'approved',
        'rejected',
        'restricted'
      )
    ),


  -- ----------------------------------------------------------
  -- ORIGINAL STORAGE
  -- ----------------------------------------------------------

  original_bucket
    text
    not null
    default 'web-media-originals'
    check (
      original_bucket =
        'web-media-originals'
    ),


  object_path
    text
    not null
    unique
    check (
      char_length(
        object_path
      ) between 1 and 500
    )
    check (
      object_path ~
        '^[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    check (
      object_path !~
        '(^|/)\.\.?(/|$)'
    )
    check (
      object_path not like
        '%//%'
    ),


  original_name
    text
    not null
    check (
      char_length(
        btrim(
          original_name
        )
      ) between 1 and 255
    ),


  extension
    text
    check (
      extension is null
      or extension ~
        '^[a-z0-9]{1,10}$'
    ),


  -- ----------------------------------------------------------
  -- MIME
  -- ----------------------------------------------------------

  mime_type
    text
    not null
    check (
      mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      )
    ),


  check (
    (
      asset_type =
        'image'
      and
      mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif'
      )
    )
    or
    (
      asset_type =
        'video'
      and
      mime_type in (
        'video/mp4',
        'video/webm',
        'video/quicktime'
      )
    )
  ),


  -- ----------------------------------------------------------
  -- SIZE
  -- ----------------------------------------------------------

  size_bytes
    bigint
    not null
    check (
      size_bytes >
        0
      and
      size_bytes <=
        104857600
    ),


  -- ----------------------------------------------------------
  -- INTEGRITY
  -- ----------------------------------------------------------

  sha256
    text
    check (
      sha256 is null
      or
      sha256 ~
        '^[a-f0-9]{64}$'
    ),


  -- ----------------------------------------------------------
  -- DIMENSIONS
  -- ----------------------------------------------------------

  width
    integer
    check (
      width is null
      or width between
        1 and 16384
    ),


  height
    integer
    check (
      height is null
      or height between
        1 and 16384
    ),


  check (
    (
      width is null
      and
      height is null
    )
    or
    (
      width is not null
      and
      height is not null
    )
  ),


  aspect_ratio
    numeric(12, 6)
    check (
      aspect_ratio is null
      or
      aspect_ratio >
        0
    ),


  animated
    boolean
    not null
    default false,


  has_alpha
    boolean
    not null
    default false,


  has_audio
    boolean
    not null
    default false,


  duration_seconds
    numeric(12, 3)
    check (
      duration_seconds is null
      or (
        duration_seconds >
          0
        and
        duration_seconds <=
          86400
      )
    ),


  -- ----------------------------------------------------------
  -- ACCESSIBILITY
  -- ----------------------------------------------------------
  --
  -- Ejemplo:
  --
  -- {
  --   "pl": "...",
  --   "es": "...",
  --   "en": "..."
  -- }
  -- ----------------------------------------------------------

  alt_text
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        alt_text
      ) =
        'object'
    )
    check (
      octet_length(
        alt_text::text
      ) <=
        8192
    ),


  -- ----------------------------------------------------------
  -- SEO
  -- ----------------------------------------------------------

  seo_title
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        seo_title
      ) =
        'object'
    )
    check (
      octet_length(
        seo_title::text
      ) <=
        8192
    ),


  seo_caption
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        seo_caption
      ) =
        'object'
    )
    check (
      octet_length(
        seo_caption::text
      ) <=
        16384
    ),


  seo_description
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        seo_description
      ) =
        'object'
    )
    check (
      octet_length(
        seo_description::text
      ) <=
        32768
    ),


  credit
    text
    check (
      credit is null
      or
      char_length(
        credit
      ) <=
        500
    ),


  seo_indexable
    boolean
    not null
    default false,


  eligible_for_social_preview
    boolean
    not null
    default false,


  -- ----------------------------------------------------------
  -- RIGHTS
  -- ----------------------------------------------------------

  rights_type
    text
    not null
    default 'unknown'
    check (
      rights_type in (
        'owned',
        'licensed',
        'customer_permission',
        'staff_permission',
        'public_domain',
        'external_permission',
        'unknown'
      )
    ),


  copyright_owner
    text
    check (
      copyright_owner is null
      or
      char_length(
        copyright_owner
      ) <=
        500
    ),


  license_name
    text
    check (
      license_name is null
      or
      char_length(
        license_name
      ) <=
        500
    ),


  license_url
    text
    check (
      license_url is null
      or
      char_length(
        license_url
      ) <=
        2048
    ),


  permission_reference
    text
    check (
      permission_reference is null
      or
      char_length(
        permission_reference
      ) <=
        1000
    ),


  commercial_use_allowed
    boolean
    not null
    default false,


  -- ----------------------------------------------------------
  -- PRIVACY
  -- ----------------------------------------------------------

  contains_people
    boolean
    not null
    default false,


  contains_children
    boolean
    not null
    default false,


  contains_sensitive_information
    boolean
    not null
    default false,


  consent_required
    boolean
    not null
    default false,


  consent_confirmed
    boolean
    not null
    default false,


  consent_reference
    text
    check (
      consent_reference is null
      or
      char_length(
        consent_reference
      ) <=
        1000
    ),


  check (
    not consent_confirmed
    or consent_required
  ),


  -- ----------------------------------------------------------
  -- SECURITY
  -- ----------------------------------------------------------

  malware_scan_status
    text
    not null
    default 'pending'
    check (
      malware_scan_status in (
        'pending',
        'clean',
        'infected',
        'failed'
      )
    ),


  metadata_sanitized
    boolean
    not null
    default false,


  quarantined
    boolean
    not null
    default true,


  check (
    malware_scan_status <>
      'infected'
    or
    quarantined
  ),


  /**
   * Ningún asset puede alcanzar READY mientras:
   *
   * - no haya sido declarado limpio;
   * - conserve metadatos potencialmente sensibles;
   * - permanezca en cuarentena.
   */
  check (
    status <>
      'ready'
    or
    (
      malware_scan_status =
        'clean'
      and
      metadata_sanitized
      and
      not quarantined
    )
  ),


  -- ----------------------------------------------------------
  -- RELATIONSHIPS
  -- ----------------------------------------------------------

  restaurant_id
    text
    check (
      restaurant_id is null
      or
      char_length(
        restaurant_id
      ) between
        1 and 120
    ),


  uploaded_by
    uuid
    references auth.users(id)
    on delete set null,


  -- ----------------------------------------------------------
  -- TIME
  -- ----------------------------------------------------------

  created_at
    timestamptz
    not null
    default now(),


  updated_at
    timestamptz
    not null
    default now(),


  processed_at
    timestamptz,


  archived_at
    timestamptz,


  deleted_at
    timestamptz,


  schema_version
    integer
    not null
    default 1
    check (
      schema_version >
        0
    )
);


-- ============================================================
-- 4. MEDIA ASSET SECURITY
-- ============================================================
--
-- Nadie desde navegador puede consultar o modificar
-- directamente el registro privado completo.
--
-- El backend autorizado utilizará service_role después de
-- comprobar identidad y permisos.
-- ============================================================

alter table
  public.web_media_assets
enable row level security;


revoke all
on public.web_media_assets
from anon, authenticated;


grant all
on public.web_media_assets
to service_role;


-- ============================================================
-- 5. PUBLISHED MEDIA SNAPSHOT
-- ============================================================
--
-- Esta tabla NO contiene:
--
-- - rutas originales privadas;
-- - datos de moderación;
-- - datos de seguridad;
-- - datos internos;
-- - referencias privadas de consentimiento.
--
-- Contiene solamente información segura para exposición
-- pública.
-- ============================================================

create table if not exists public.web_media_publications (

  id
    uuid
    primary key
    default gen_random_uuid(),


  source_asset_id
    uuid
    not null
    references
      public.web_media_assets(id)
    on delete restrict,


  public_bucket
    text
    not null
    default 'web-media-public'
    check (
      public_bucket =
        'web-media-public'
    ),


  object_path
    text
    not null
    unique
    check (
      char_length(
        object_path
      ) between 1 and 500
    )
    check (
      object_path ~
        '^[A-Za-z0-9][A-Za-z0-9._/-]*$'
    )
    check (
      object_path !~
        '(^|/)\.\.?(/|$)'
    )
    check (
      object_path not like
        '%//%'
    ),


  mime_type
    text
    not null
    check (
      mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'video/mp4',
        'video/webm'
      )
    ),


  size_bytes
    bigint
    not null
    check (
      size_bytes >
        0
      and
      size_bytes <=
        104857600
    ),


  width
    integer
    check (
      width is null
      or
      width between
        1 and 16384
    ),


  height
    integer
    check (
      height is null
      or
      height between
        1 and 16384
    ),


  duration_seconds
    numeric(12, 3)
    check (
      duration_seconds is null
      or (
        duration_seconds >
          0
        and
        duration_seconds <=
          86400
      )
    ),


  alt_text
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        alt_text
      ) =
        'object'
    )
    check (
      octet_length(
        alt_text::text
      ) <=
        8192
    ),


  seo_indexable
    boolean
    not null
    default false,


  published_by
    uuid
    references auth.users(id)
    on delete set null,


  published_at
    timestamptz
    not null
    default now(),


  retired_by
    uuid
    references auth.users(id)
    on delete set null,


  retired_at
    timestamptz
);


-- ============================================================
-- 6. PUBLISHED MEDIA SECURITY
-- ============================================================

alter table
  public.web_media_publications
enable row level security;


revoke all
on public.web_media_publications
from anon, authenticated;


grant select
on public.web_media_publications
to anon, authenticated;


grant all
on public.web_media_publications
to service_role;


drop policy if exists
  web_media_publications_read_active
on public.web_media_publications;


create policy
  web_media_publications_read_active
on public.web_media_publications
for select
to anon, authenticated
using (
  retired_at is null
);


-- ============================================================
-- 7. PRIVATE MEDIA AUDIT
-- ============================================================

create table if not exists web_private.media_audit (

  id
    bigint
    generated always as identity
    primary key,


  actor_id
    uuid
    references auth.users(id)
    on delete set null,


  asset_id
    uuid
    references public.web_media_assets(id)
    on delete set null,


  publication_id
    uuid
    references public.web_media_publications(id)
    on delete set null,


  action
    text
    not null
    check (
      action in (
        'uploaded',
        'processing_updated',
        'security_updated',
        'moderation_updated',
        'rights_updated',
        'published',
        'retired',
        'archived',
        'deleted',
        'restored'
      )
    ),


  details
    jsonb
    not null
    default '{}'::jsonb
    check (
      jsonb_typeof(
        details
      ) =
        'object'
    )
    check (
      octet_length(
        details::text
      ) <=
        16384
    ),


  occurred_at
    timestamptz
    not null
    default now()
);


alter table
  web_private.media_audit
enable row level security;


revoke all
on web_private.media_audit
from anon, authenticated;


grant select, insert
on web_private.media_audit
to service_role;


-- ============================================================
-- 8. AUTOMATIC UPDATED_AT
-- ============================================================

create or replace function
  web_private.touch_web_media_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$

begin

  new.updated_at :=
    now();

  return
    new;

end;
$function$;


revoke all
on function
  web_private.touch_web_media_updated_at()
from public;


drop trigger if exists
  web_media_assets_updated_at
on public.web_media_assets;


create trigger
  web_media_assets_updated_at

before update
on public.web_media_assets

for each row

execute function
  web_private.touch_web_media_updated_at();


-- ============================================================
-- 9. STORAGE WRITE SECURITY
-- ============================================================
--
-- No creamos ninguna policy INSERT/UPDATE/DELETE para:
--
-- - anon;
-- - authenticated.
--
-- Los uploads se realizarán posteriormente mediante:
--
-- Server Action
--      ↓
-- requireAdminIdentity() / usuario autorizado
--      ↓
-- validación
--      ↓
-- URL firmada temporal
--      ↓
-- bucket privado
--
-- La publicación al bucket público se realizará solamente
-- desde backend privilegiado.
--
-- Eliminamos únicamente policies con nombres reservados
-- por este sistema si existieran de una instalación previa.
-- ============================================================

drop policy if exists
  web_media_originals_authenticated_insert
on storage.objects;


drop policy if exists
  web_media_originals_authenticated_update
on storage.objects;


drop policy if exists
  web_media_originals_authenticated_delete
on storage.objects;


drop policy if exists
  web_media_public_authenticated_insert
on storage.objects;


drop policy if exists
  web_media_public_authenticated_update
on storage.objects;


drop policy if exists
  web_media_public_authenticated_delete
on storage.objects;


-- ============================================================
-- 10. INDEXES
-- ============================================================

create index if not exists
  web_media_assets_created_idx
on public.web_media_assets (
  created_at desc
);


create index if not exists
  web_media_assets_status_idx
on public.web_media_assets (
  status,
  moderation_status,
  created_at desc
);


create index if not exists
  web_media_assets_source_idx
on public.web_media_assets (
  source,
  created_at desc
);


create index if not exists
  web_media_assets_restaurant_idx
on public.web_media_assets (
  restaurant_id,
  created_at desc
)
where
  restaurant_id is not null;


create index if not exists
  web_media_assets_sha256_idx
on public.web_media_assets (
  sha256
)
where
  sha256 is not null;


create index if not exists
  web_media_assets_security_idx
on public.web_media_assets (
  malware_scan_status,
  quarantined,
  created_at desc
);


create unique index if not exists
  web_media_publications_one_active_per_asset_idx
on public.web_media_publications (
  source_asset_id
)
where
  retired_at is null;


create index if not exists
  web_media_publications_active_time_idx
on public.web_media_publications (
  published_at desc
)
where
  retired_at is null;


create index if not exists
  web_media_audit_asset_time_idx
on web_private.media_audit (
  asset_id,
  occurred_at desc
);


create index if not exists
  web_media_audit_actor_time_idx
on web_private.media_audit (
  actor_id,
  occurred_at desc
)
where
  actor_id is not null;


-- ============================================================
-- 11. COMMENTS
-- ============================================================

comment on table
  public.web_media_assets
is
  'Registro privado de originales multimedia de Rincón Colombiano. Los archivos permanecen privados y no se publican automáticamente.';


comment on table
  public.web_media_publications
is
  'Snapshot público de recursos multimedia aprobados y publicados por Rincón Colombiano.';


comment on table
  web_private.media_audit
is
  'Auditoría interna de operaciones realizadas sobre la biblioteca multimedia.';


comment on column
  public.web_media_assets.object_path
is
  'Ruta interna del original privado dentro del bucket web-media-originals. Nunca debe utilizarse como URL pública.';


comment on column
  public.web_media_assets.quarantined
is
  'Bloquea el uso/publicación de un archivo hasta completar controles de seguridad.';


comment on column
  public.web_media_assets.malware_scan_status
is
  'Estado del análisis de seguridad. Un asset READY debe estar marcado como clean.';


comment on column
  public.web_media_assets.metadata_sanitized
is
  'Indica que metadatos potencialmente sensibles, como EXIF/GPS, han sido tratados antes de publicación.';


comment on column
  public.web_media_publications.object_path
is
  'Ruta del archivo aprobado dentro del bucket público web-media-public.';


commit;
