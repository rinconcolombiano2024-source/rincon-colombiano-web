begin;


-- ============================================================
-- RINCÓN COLOMBIANO
-- BRAND ASSET OPERATIONS
-- ============================================================
--
-- Capa transaccional para la administración de identidad.
--
-- PRINCIPIOS:
--
-- 1. El navegador nunca escribe directamente en estas tablas.
-- 2. Solamente service_role puede ejecutar estas funciones.
-- 3. La identidad del administrador se obtiene previamente
--    mediante requireAdminIdentity() en Next.js.
-- 4. Registro + auditoría ocurren en una sola transacción.
-- 5. Publicación + auditoría ocurren en una sola transacción.
-- 6. Un asset cargado NO queda publicado automáticamente.
-- 7. Una publicación anterior permanece disponible para
--    futuras operaciones de rollback.
--
-- IMPORTANTE:
--
-- El archivo físico se almacena en Supabase Storage.
-- Estas funciones gobiernan el registro y la publicación
-- dentro de PostgreSQL.
-- ============================================================


-- ============================================================
-- 1. HARDEN EXISTING BRAND SCHEMA
-- ============================================================

do $migration$
begin

  -- ----------------------------------------------------------
  -- AUDIT → ASSET FOREIGN KEY
  -- ----------------------------------------------------------

  if not exists (
    select
      1
    from pg_constraint
    where conname =
      'brand_audit_asset_id_fkey'
  ) then

    alter table
      web_private.brand_audit

    add constraint
      brand_audit_asset_id_fkey

    foreign key (
      asset_id
    )

    references
      public.web_brand_assets(id)

    on delete
      set null;

  end if;


  -- ----------------------------------------------------------
  -- AUDIT SLOT VALIDATION
  -- ----------------------------------------------------------

  if not exists (
    select
      1
    from pg_constraint
    where conname =
      'brand_audit_slot_check'
  ) then

    alter table
      web_private.brand_audit

    add constraint
      brand_audit_slot_check

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
    );

  end if;


  -- ----------------------------------------------------------
  -- PUBLISHED MIME VALIDATION
  -- ----------------------------------------------------------

  if not exists (
    select
      1
    from pg_constraint
    where conname =
      'web_brand_published_mime_type_check'
  ) then

    alter table
      public.web_brand_published

    add constraint
      web_brand_published_mime_type_check

    check (
      mime_type in (
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/avif',
        'image/x-icon',
        'image/vnd.microsoft.icon'
      )
    );

  end if;

end;
$migration$;


/* ============================================================
   2. REGISTER BRAND ASSET
   ============================================================ */

/**
 * Registra un archivo que YA fue almacenado correctamente
 * en Supabase Storage.
 *
 * Esta función:
 *
 * - valida parámetros;
 * - crea el registro web_brand_assets;
 * - registra auditoría;
 * - devuelve el UUID creado.
 *
 * Ambas escrituras son transaccionales.
 */
create or replace function
  public.web_brand_register_asset(
    p_slot
      text,

    p_object_path
      text,

    p_original_name
      text,

    p_mime_type
      text,

    p_size_bytes
      bigint,

    p_alt_text
      text,

    p_sha256
      text,

    p_uploaded_by
      uuid
  )
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset_id
    uuid;

begin

  -- ==========================================================
  -- SLOT
  -- ==========================================================

  if
    p_slot is null
    or p_slot not in (
      'logo_primary',
      'logo_compact',
      'logo_light',
      'logo_dark',
      'favicon',
      'open_graph',
      'social_square'
    )
  then
    raise exception
      'Invalid brand slot'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- OBJECT PATH
  -- ==========================================================

  if
    p_object_path is null
    or char_length(
      btrim(
        p_object_path
      )
    ) not between 1 and 500
  then
    raise exception
      'Invalid object path'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- ORIGINAL FILE NAME
  -- ==========================================================

  if
    p_original_name is null
    or char_length(
      btrim(
        p_original_name
      )
    ) not between 1 and 255
  then
    raise exception
      'Invalid original file name'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- MIME
  -- ==========================================================

  if
    p_mime_type is null
    or p_mime_type not in (
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    )
  then
    raise exception
      'Unsupported brand asset MIME type'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- SIZE
  -- ==========================================================

  if
    p_size_bytes is null
    or p_size_bytes < 1
    or p_size_bytes > 8388608
  then
    raise exception
      'Invalid brand asset size'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- ALT TEXT
  -- ==========================================================

  if
    p_alt_text is null
    or char_length(
      p_alt_text
    ) > 300
  then
    raise exception
      'Invalid alt text'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- SHA-256
  -- ==========================================================

  if
    p_sha256 is null
    or p_sha256 !~
      '^[a-f0-9]{64}$'
  then
    raise exception
      'Invalid SHA-256'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- ACTOR
  -- ==========================================================

  if
    p_uploaded_by is null
  then
    raise exception
      'Administrator identity is required'
      using errcode = '22023';
  end if;


  if not exists (
    select
      1
    from auth.users
    where id =
      p_uploaded_by
  ) then
    raise exception
      'Administrator identity does not exist'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- INSERT ASSET
  -- ==========================================================

  insert into
    public.web_brand_assets (
      slot,
      object_path,
      original_name,
      mime_type,
      size_bytes,
      alt_text,
      sha256,
      uploaded_by
    )

  values (
    p_slot,
    btrim(
      p_object_path
    ),
    btrim(
      p_original_name
    ),
    p_mime_type,
    p_size_bytes,
    btrim(
      p_alt_text
    ),
    p_sha256,
    p_uploaded_by
  )

  returning
    id

  into
    v_asset_id;


  -- ==========================================================
  -- AUDIT
  -- ==========================================================

  insert into
    web_private.brand_audit (
      actor_id,
      action,
      slot,
      asset_id
    )

  values (
    p_uploaded_by,
    'uploaded',
    p_slot,
    v_asset_id
  );


  return
    v_asset_id;

end;
$function$;


/* ============================================================
   3. PUBLISH BRAND ASSET
   ============================================================ */

/**
 * Publica un asset ya registrado.
 *
 * Flujo:
 *
 * SELECT asset FOR UPDATE
 *      ↓
 * comprobar que existe y está activo
 *      ↓
 * determinar si reemplaza otro asset
 *      ↓
 * UPSERT web_brand_published
 *      ↓
 * auditoría
 *      ↓
 * devolver snapshot publicado
 *
 * Todo ocurre en la misma transacción PostgreSQL.
 */
create or replace function
  public.web_brand_publish_asset(
    p_asset_id
      uuid,

    p_published_by
      uuid
  )
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_brand_assets%rowtype;

  v_previous_asset_id
    uuid;

  v_action
    text;

  v_published_at
    timestamptz;

begin

  -- ==========================================================
  -- INPUT
  -- ==========================================================

  if
    p_asset_id is null
  then
    raise exception
      'Asset ID is required'
      using errcode = '22023';
  end if;


  if
    p_published_by is null
  then
    raise exception
      'Administrator identity is required'
      using errcode = '22023';
  end if;


  if not exists (
    select
      1
    from auth.users
    where id =
      p_published_by
  ) then
    raise exception
      'Administrator identity does not exist'
      using errcode = '22023';
  end if;


  -- ==========================================================
  -- LOCK ASSET
  -- ==========================================================

  select
    *

  into
    v_asset

  from
    public.web_brand_assets

  where
    id =
      p_asset_id

  for update;


  if not found then
    raise exception
      'Brand asset not found'
      using errcode = 'P0002';
  end if;


  -- ==========================================================
  -- RETIRED ASSET
  -- ==========================================================

  if
    v_asset.retired_at
      is not null
  then
    raise exception
      'Retired brand asset cannot be published'
      using errcode = '55000';
  end if;


  -- ==========================================================
  -- LOCK CURRENT PUBLICATION
  -- ==========================================================

  select
    source_asset_id

  into
    v_previous_asset_id

  from
    public.web_brand_published

  where
    slot =
      v_asset.slot

  for update;


  -- ==========================================================
  -- ACTION TYPE
  -- ==========================================================

  if
    v_previous_asset_id
      is null
  then

    v_action :=
      'published';

  elsif
    v_previous_asset_id =
      v_asset.id
  then

    v_action :=
      'published';

  else

    v_action :=
      'replaced';

  end if;


  -- ==========================================================
  -- PUBLICATION
  -- ==========================================================

  v_published_at :=
    now();


  insert into
    public.web_brand_published (
      slot,
      source_asset_id,
      object_path,
      mime_type,
      alt_text,
      published_by,
      published_at
    )

  values (
    v_asset.slot,
    v_asset.id,
    v_asset.object_path,
    v_asset.mime_type,
    v_asset.alt_text,
    p_published_by,
    v_published_at
  )

  on conflict (
    slot
  )

  do update set

    source_asset_id =
      excluded.source_asset_id,

    object_path =
      excluded.object_path,

    mime_type =
      excluded.mime_type,

    alt_text =
      excluded.alt_text,

    published_by =
      excluded.published_by,

    published_at =
      excluded.published_at;


  -- ==========================================================
  -- AUDIT
  -- ==========================================================

  insert into
    web_private.brand_audit (
      actor_id,
      action,
      slot,
      asset_id
    )

  values (
    p_published_by,
    v_action,
    v_asset.slot,
    v_asset.id
  );


  -- ==========================================================
  -- RESPONSE
  -- ==========================================================

  return jsonb_build_object(
    'slot',
      v_asset.slot,

    'asset_id',
      v_asset.id,

    'object_path',
      v_asset.object_path,

    'mime_type',
      v_asset.mime_type,

    'alt_text',
      v_asset.alt_text,

    'published_at',
      v_published_at,

    'replaced_asset_id',
      v_previous_asset_id
  );

end;
$function$;


/* ============================================================
   4. RETIRE BRAND ASSET
   ============================================================ */

/**
 * Retira un recurso del inventario administrativo.
 *
 * REGLA:
 *
 * No permitimos retirar el recurso actualmente publicado.
 *
 * Primero debe publicarse otro asset para ese slot.
 */
create or replace function
  public.web_brand_retire_asset(
    p_asset_id
      uuid,

    p_retired_by
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_brand_assets%rowtype;

begin

  if
    p_asset_id is null
    or p_retired_by is null
  then
    raise exception
      'Asset and administrator are required'
      using errcode = '22023';
  end if;


  if not exists (
    select
      1
    from auth.users
    where id =
      p_retired_by
  ) then
    raise exception
      'Administrator identity does not exist'
      using errcode = '22023';
  end if;


  select
    *

  into
    v_asset

  from
    public.web_brand_assets

  where
    id =
      p_asset_id

  for update;


  if not found then
    raise exception
      'Brand asset not found'
      using errcode = 'P0002';
  end if;


  if exists (
    select
      1
    from public.web_brand_published
    where source_asset_id =
      v_asset.id
  ) then
    raise exception
      'Published brand asset cannot be retired'
      using errcode = '55000';
  end if;


  if
    v_asset.retired_at
      is not null
  then
    return;
  end if;


  update
    public.web_brand_assets

  set
    retired_at =
      now()

  where
    id =
      v_asset.id;


  insert into
    web_private.brand_audit (
      actor_id,
      action,
      slot,
      asset_id
    )

  values (
    p_retired_by,
    'retired',
    v_asset.slot,
    v_asset.id
  );

end;
$function$;


/* ============================================================
   5. FUNCTION SECURITY
   ============================================================ */

revoke all
on function
  public.web_brand_register_asset(
    text,
    text,
    text,
    text,
    bigint,
    text,
    text,
    uuid
  )
from public, anon, authenticated;


revoke all
on function
  public.web_brand_publish_asset(
    uuid,
    uuid
  )
from public, anon, authenticated;


revoke all
on function
  public.web_brand_retire_asset(
    uuid,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_brand_register_asset(
    text,
    text,
    text,
    text,
    bigint,
    text,
    text,
    uuid
  )
to service_role;


grant execute
on function
  public.web_brand_publish_asset(
    uuid,
    uuid
  )
to service_role;


grant execute
on function
  public.web_brand_retire_asset(
    uuid,
    uuid
  )
to service_role;


/* ============================================================
   6. COMMENTS
   ============================================================ */

comment on function
  public.web_brand_register_asset(
    text,
    text,
    text,
    text,
    bigint,
    text,
    text,
    uuid
  )
is
  'Registra de forma transaccional un recurso visual previamente cargado en Storage y genera auditoría. Solo service_role.';


comment on function
  public.web_brand_publish_asset(
    uuid,
    uuid
  )
is
  'Publica o reemplaza transaccionalmente un recurso de identidad visual y genera auditoría. Solo service_role.';


comment on function
  public.web_brand_retire_asset(
    uuid,
    uuid
  )
is
  'Retira un recurso visual no publicado y genera auditoría. Solo service_role.';


commit;
