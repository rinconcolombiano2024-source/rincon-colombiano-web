-- ============================================================
-- RINCÓN COLOMBIANO WEB
-- BRAND HERO SLOT
-- Migration: 202610030001
-- ============================================================
--
-- Objetivo:
--
-- Añadir el slot:
--
--   hero_primary
--
-- a la infraestructura de identidad visual existente.
--
-- Esta migración es:
--
-- - incremental;
-- - repetible de forma segura;
-- - compatible con datos existentes;
-- - sin borrar assets;
-- - sin borrar publicaciones;
-- - sin alterar historial;
-- - sin abrir permisos adicionales.
--
-- IMPORTANTE:
--
-- NO modifica migraciones históricas.
-- NO elimina contenido.
-- NO publica automáticamente ningún recurso.
-- ============================================================

begin;


-- ============================================================
-- 1. PREFLIGHT
-- ============================================================

do $preflight$
begin

  if to_regclass(
    'public.web_brand_assets'
  ) is null then
    raise exception
      'Falta public.web_brand_assets';
  end if;


  if to_regclass(
    'public.web_brand_published'
  ) is null then
    raise exception
      'Falta public.web_brand_published';
  end if;


  if to_regclass(
    'web_private.brand_audit'
  ) is null then
    raise exception
      'Falta web_private.brand_audit';
  end if;


  if to_regprocedure(
    'public.web_brand_register_asset(text,text,text,text,bigint,text,text,uuid)'
  ) is null then
    raise exception
      'Falta public.web_brand_register_asset(text,text,text,text,bigint,text,text,uuid)';
  end if;

end;
$preflight$;


-- ============================================================
-- 2. WEB_BRAND_ASSETS SLOT CONSTRAINT
-- ============================================================
--
-- Constraint original creada automáticamente por PostgreSQL:
--
--   web_brand_assets_slot_check
--
-- Se reemplaza por una whitelist equivalente que añade:
--
--   hero_primary
--
-- No se amplían formatos, permisos ni otras reglas.
-- ============================================================

alter table
  public.web_brand_assets

drop constraint if exists
  web_brand_assets_slot_check;


alter table
  public.web_brand_assets

add constraint
  web_brand_assets_slot_check

check (
  slot in (
    'logo_primary',
    'logo_compact',
    'logo_light',
    'logo_dark',
    'favicon',
    'open_graph',
    'social_square',
    'hero_primary'
  )
)

not valid;


alter table
  public.web_brand_assets

validate constraint
  web_brand_assets_slot_check;


-- ============================================================
-- 3. WEB_BRAND_PUBLISHED SLOT CONSTRAINT
-- ============================================================

alter table
  public.web_brand_published

drop constraint if exists
  web_brand_published_slot_check;


alter table
  public.web_brand_published

add constraint
  web_brand_published_slot_check

check (
  slot in (
    'logo_primary',
    'logo_compact',
    'logo_light',
    'logo_dark',
    'favicon',
    'open_graph',
    'social_square',
    'hero_primary'
  )
)

not valid;


alter table
  public.web_brand_published

validate constraint
  web_brand_published_slot_check;


-- ============================================================
-- 4. BRAND AUDIT SLOT CONSTRAINT
-- ============================================================

alter table
  web_private.brand_audit

drop constraint if exists
  brand_audit_slot_check;


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
    'social_square',
    'hero_primary'
  )
)

not valid;


alter table
  web_private.brand_audit

validate constraint
  brand_audit_slot_check;


-- ============================================================
-- 5. REGISTER BRAND ASSET
-- ============================================================
--
-- Se conserva el comportamiento existente:
--
-- - SECURITY DEFINER;
-- - search_path vacío;
-- - validación de slot;
-- - validación de path;
-- - validación del nombre;
-- - validación MIME;
-- - validación tamaño;
-- - ALT;
-- - SHA-256;
-- - identidad administrativa;
-- - asset;
-- - auditoría;
-- - respuesta UUID.
--
-- ÚNICO cambio funcional:
--
--   hero_primary
--
-- pasa a ser un slot permitido.
-- ============================================================

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
      'social_square',
      'hero_primary'
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
  -- ADMINISTRATOR
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

    from
      auth.users

    where
      id =
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


  -- ==========================================================
  -- RESULT
  -- ==========================================================

  return
    v_asset_id;

end;
$function$;


-- ============================================================
-- 6. FUNCTION SECURITY
-- ============================================================
--
-- La función continúa siendo exclusivamente para service_role.
-- ============================================================

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
  'Registra de forma transaccional un recurso visual previamente cargado en Storage, incluyendo hero_primary, y genera auditoría. Solo service_role.';


-- ============================================================
-- 7. POSTFLIGHT — CONSTRAINTS
-- ============================================================
--
-- La migración falla explícitamente si por cualquier motivo
-- PostgreSQL termina sin hero_primary en una de las reglas.
-- ============================================================

do $postflight_constraints$
declare

  v_definition
    text;

begin

  select
    pg_get_constraintdef(
      oid
    )

  into
    v_definition

  from
    pg_constraint

  where
    conrelid =
      'public.web_brand_assets'::regclass

    and conname =
      'web_brand_assets_slot_check';


  if
    v_definition is null
    or position(
      'hero_primary'
      in v_definition
    ) = 0
  then
    raise exception
      'web_brand_assets_slot_check no contiene hero_primary';
  end if;


  select
    pg_get_constraintdef(
      oid
    )

  into
    v_definition

  from
    pg_constraint

  where
    conrelid =
      'public.web_brand_published'::regclass

    and conname =
      'web_brand_published_slot_check';


  if
    v_definition is null
    or position(
      'hero_primary'
      in v_definition
    ) = 0
  then
    raise exception
      'web_brand_published_slot_check no contiene hero_primary';
  end if;


  select
    pg_get_constraintdef(
      oid
    )

  into
    v_definition

  from
    pg_constraint

  where
    conrelid =
      'web_private.brand_audit'::regclass

    and conname =
      'brand_audit_slot_check';


  if
    v_definition is null
    or position(
      'hero_primary'
      in v_definition
    ) = 0
  then
    raise exception
      'brand_audit_slot_check no contiene hero_primary';
  end if;

end;
$postflight_constraints$;


-- ============================================================
-- 8. POSTFLIGHT — FUNCTION
-- ============================================================

do $postflight_function$
declare

  v_definition
    text;

  v_function
    regprocedure;

begin

  v_function :=
    to_regprocedure(
      'public.web_brand_register_asset(text,text,text,text,bigint,text,text,uuid)'
    );


  if
    v_function is null
  then
    raise exception
      'web_brand_register_asset no existe después de la migración';
  end if;


  select
    pg_get_functiondef(
      v_function
    )

  into
    v_definition;


  if
    v_definition is null
    or position(
      'hero_primary'
      in v_definition
    ) = 0
  then
    raise exception
      'web_brand_register_asset no contiene hero_primary';
  end if;

end;
$postflight_function$;


-- ============================================================
-- 9. FINAL
-- ============================================================

commit;
