begin;


-- ============================================================
-- RINCÓN COLOMBIANO
-- ENTERPRISE MEDIA OPERATIONS
-- ============================================================
--
-- Capa transaccional para la biblioteca multimedia.
--
-- DEPENDE DE:
--
-- 202610070001_web_media_library.sql
--
-- OBJETIVO:
--
-- original privado
--      ↓
-- registro
--      ↓
-- análisis / procesamiento
--      ↓
-- metadata
--      ↓
-- derechos / privacidad
--      ↓
-- moderación
--      ↓
-- publicación
--      ↓
-- retirada / archivo
--
-- REGLAS DE SEGURIDAD:
--
-- - anon no ejecuta estas operaciones.
-- - authenticated no ejecuta estas operaciones directamente.
-- - solamente service_role puede invocar estas RPC.
-- - service_role permanece exclusivamente en servidor.
-- - las operaciones humanas validan además actor y rol admin.
-- - ninguna publicación salta cuarentena.
-- - ninguna publicación salta malware scan.
-- - ninguna publicación salta sanitización de metadata.
-- - ninguna publicación salta moderación.
-- - ninguna publicación salta derechos.
-- - ninguna publicación salta consentimiento cuando aplica.
-- - los originales permanecen en bucket privado.
-- - el objeto público debe existir antes de registrar publicación.
--
-- IMPORTANTE:
--
-- Esta migración NO crea uploads públicos de comunidad.
-- Los uploads de clientes tendrán un flujo de intake específico
-- y separado para no rebajar la seguridad administrativa.
-- ============================================================


-- ============================================================
-- 1. SAFE STORAGE OBJECT PATH
-- ============================================================

create or replace function
  web_private.media_safe_object_path(
    p_path
      text
  )
returns boolean
language sql
immutable
set search_path = ''
as $function$

  select
    p_path is not null

    and char_length(
      p_path
    ) between 1 and 500

    and p_path ~
      '^[A-Za-z0-9][A-Za-z0-9._/-]*$'

    and p_path !~
      '(^|/)\.\.?(/|$)'

    and p_path not like
      '%//%';

$function$;


revoke execute
on function
  web_private.media_safe_object_path(text)
from public, anon, authenticated;


grant execute
on function
  web_private.media_safe_object_path(text)
to service_role;


-- ============================================================
-- 2. LOCALIZED TEXT VALIDATOR
-- ============================================================
--
-- Solo permitimos claves:
--
-- pl
-- es
-- en
--
-- No aceptamos objetos arbitrarios que puedan terminar
-- propagándose hacia UI, SEO o contenido público.
-- ============================================================

create or replace function
  web_private.media_valid_localized_text(
    p_value
      jsonb,

    p_max_characters
      integer,

    p_allow_empty
      boolean
  )
returns boolean
language plpgsql
immutable
set search_path = ''
as $function$

declare

  v_key
    text;

  v_value
    jsonb;

  v_text
    text;

begin

  if
    p_value is null

    or jsonb_typeof(
      p_value
    ) <>
      'object'
  then

    return false;

  end if;


  if
    p_max_characters is null

    or p_max_characters <
      1
  then

    return false;

  end if;


  for
    v_key,
    v_value

  in

    select
      key,
      value

    from
      jsonb_each(
        p_value
      )

  loop

    if
      v_key not in (
        'pl',
        'es',
        'en'
      )
    then

      return false;

    end if;


    if
      jsonb_typeof(
        v_value
      ) <>
        'string'
    then

      return false;

    end if;


    v_text :=
      v_value #>> '{}';


    if
      char_length(
        v_text
      ) >
        p_max_characters
    then

      return false;

    end if;


    if
      not p_allow_empty

      and char_length(
        btrim(
          v_text
        )
      ) =
        0
    then

      return false;

    end if;

  end loop;


  return true;

end;
$function$;


revoke execute
on function
  web_private.media_valid_localized_text(
    jsonb,
    integer,
    boolean
  )
from public, anon, authenticated;


grant execute
on function
  web_private.media_valid_localized_text(
    jsonb,
    integer,
    boolean
  )
to service_role;


-- ============================================================
-- 3. ADMIN AUTHORIZATION
-- ============================================================

create or replace function
  web_private.require_media_admin(
    p_actor_id
      uuid,

    p_allowed_roles
      text[]
  )
returns text
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_role
    text;

begin

  if
    p_actor_id is null
  then

    raise exception
      'Administrator identity is required'
      using errcode =
        '42501';

  end if;


  if
    p_allowed_roles is null

    or coalesce(
      array_length(
        p_allowed_roles,
        1
      ),
      0
    ) =
      0
  then

    raise exception
      'Allowed administrator roles are required'
      using errcode =
        '22023';

  end if;


  if exists (

    select
      1

    from
      unnest(
        p_allowed_roles
      ) as allowed_roles(role_name)

    where
      allowed_roles.role_name not in (
        'owner',
        'editor',
        'publisher'
      )

  )
  then

    raise exception
      'Invalid administrator role'
      using errcode =
        '22023';

  end if;


  select
    member.role

  into
    v_role

  from
    web_private.admin_members
      as member

  inner join
    auth.users
      as auth_user

    on
      auth_user.id =
        member.user_id

  where
    member.user_id =
      p_actor_id

    and member.enabled

    and member.role =
      any(
        p_allowed_roles
      )

    and auth_user.email_confirmed_at
      is not null

  limit 1;


  if
    v_role is null
  then

    raise exception
      'Administrator is not authorized for this media operation'
      using errcode =
        '42501';

  end if;


  return
    v_role;

end;
$function$;


revoke execute
on function
  web_private.require_media_admin(
    uuid,
    text[]
  )
from public, anon, authenticated;


grant execute
on function
  web_private.require_media_admin(
    uuid,
    text[]
  )
to service_role;


-- ============================================================
-- 4. REGISTER PRIVATE ORIGINAL
-- ============================================================
--
-- Esta operación se utiliza para administración.
--
-- community_upload queda deliberadamente excluido.
-- Ese flujo tendrá posteriormente:
--
-- usuario
--   ↓
-- sesión de upload temporal
--   ↓
-- cuarentena
--   ↓
-- moderación
--
-- sin reutilizar una RPC administrativa.
-- ============================================================

create or replace function
  public.web_media_register_asset(
    p_source
      text,

    p_asset_type
      text,

    p_object_path
      text,

    p_original_name
      text,

    p_mime_type
      text,

    p_size_bytes
      bigint,

    p_sha256
      text,

    p_actor_id
      uuid,

    p_uploaded_by
      uuid,

    p_restaurant_id
      text
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

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'editor'
      ]
    );


  -- ----------------------------------------------------------
  -- SOURCE
  -- ----------------------------------------------------------

  if
    p_source is null

    or p_source not in (
      'admin_upload',
      'restaurant_upload',
      'import',
      'external',
      'generated'
    )
  then

    raise exception
      'Invalid administrative media source'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- TYPE
  -- ----------------------------------------------------------

  if
    p_asset_type is null

    or p_asset_type not in (
      'image',
      'video'
    )
  then

    raise exception
      'Invalid media type'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- STORAGE PATH
  -- ----------------------------------------------------------

  if
    not coalesce(
      web_private.media_safe_object_path(
        p_object_path
      ),
      false
    )
  then

    raise exception
      'Invalid media object path'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- ORIGINAL NAME
  -- ----------------------------------------------------------

  if
    p_original_name is null

    or char_length(
      btrim(
        p_original_name
      )
    ) not between
      1 and 255
  then

    raise exception
      'Invalid original file name'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- MIME
  -- ----------------------------------------------------------

  if
    p_mime_type is null

    or p_mime_type not in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    )
  then

    raise exception
      'Unsupported media MIME type'
      using errcode =
        '22023';

  end if;


  if
    (
      p_asset_type =
        'image'

      and p_mime_type not in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif'
      )
    )

    or

    (
      p_asset_type =
        'video'

      and p_mime_type not in (
        'video/mp4',
        'video/webm',
        'video/quicktime'
      )
    )
  then

    raise exception
      'Media type and MIME type do not match'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- SIZE
  -- ----------------------------------------------------------

  if
    p_size_bytes is null

    or p_size_bytes <
      1

    or p_size_bytes >
      104857600
  then

    raise exception
      'Invalid media file size'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- CHECKSUM
  -- ----------------------------------------------------------

  if
    p_sha256 is null

    or p_sha256 !~
      '^[a-f0-9]{64}$'
  then

    raise exception
      'A valid SHA-256 checksum is required'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- UPLOADER
  -- ----------------------------------------------------------

  if
    p_uploaded_by is not null

    and not exists (

      select
        1

      from
        auth.users

      where
        id =
          p_uploaded_by

    )
  then

    raise exception
      'Uploader identity does not exist'
      using errcode =
        '22023';

  end if;


  if
    p_source =
      'admin_upload'

    and p_uploaded_by is distinct from
      p_actor_id
  then

    raise exception
      'Admin upload must reference the administrator as uploader'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- RESTAURANT
  -- ----------------------------------------------------------

  if
    p_restaurant_id is not null

    and char_length(
      btrim(
        p_restaurant_id
      )
    ) not between
      1 and 120
  then

    raise exception
      'Invalid restaurant identifier'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- STORAGE OBJECT MUST EXIST
  -- ----------------------------------------------------------

  if not exists (

    select
      1

    from
      storage.objects

    where
      bucket_id =
        'web-media-originals'

      and name =
        p_object_path

  )
  then

    raise exception
      'Private media object does not exist in Storage'
      using errcode =
        'P0002';

  end if;


  -- ----------------------------------------------------------
  -- DUPLICATE PATH
  -- ----------------------------------------------------------

  if exists (

    select
      1

    from
      public.web_media_assets

    where
      object_path =
        p_object_path

  )
  then

    raise exception
      'Media object path is already registered'
      using errcode =
        '23505';

  end if;


  -- ----------------------------------------------------------
  -- INSERT
  -- ----------------------------------------------------------

  insert into
    public.web_media_assets (
      source,
      asset_type,
      status,
      visibility,
      moderation_status,
      original_bucket,
      object_path,
      original_name,
      mime_type,
      size_bytes,
      sha256,
      malware_scan_status,
      metadata_sanitized,
      quarantined,
      restaurant_id,
      uploaded_by
    )

  values (
    p_source,
    p_asset_type,
    'processing',
    'private',
    'pending',
    'web-media-originals',
    p_object_path,
    btrim(
      p_original_name
    ),
    p_mime_type,
    p_size_bytes,
    p_sha256,
    'pending',
    false,
    true,
    nullif(
      btrim(
        p_restaurant_id
      ),
      ''
    ),
    p_uploaded_by
  )

  returning
    id

  into
    v_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    v_asset_id,
    'uploaded',
    jsonb_build_object(
      'source',
        p_source,

      'asset_type',
        p_asset_type,

      'mime_type',
        p_mime_type,

      'size_bytes',
        p_size_bytes,

      'restaurant_id',
        p_restaurant_id
    )
  );


  return
    v_asset_id;

end;
$function$;


revoke execute
on function
  public.web_media_register_asset(
    text,
    text,
    text,
    text,
    text,
    bigint,
    text,
    uuid,
    uuid,
    text
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_register_asset(
    text,
    text,
    text,
    text,
    text,
    bigint,
    text,
    uuid,
    uuid,
    text
  )
to service_role;


-- ============================================================
-- 5. APPLY PROCESSING / SECURITY RESULT
-- ============================================================
--
-- Esta operación puede ejecutarla:
--
-- - worker técnico mediante service_role;
-- - administrador identificado mediante service_role.
--
-- p_actor_id puede ser NULL únicamente para worker técnico.
-- ============================================================

create or replace function
  public.web_media_apply_processing_result(
    p_asset_id
      uuid,

    p_actor_id
      uuid,

    p_malware_scan_status
      text,

    p_metadata_sanitized
      boolean,

    p_width
      integer,

    p_height
      integer,

    p_duration_seconds
      numeric,

    p_animated
      boolean,

    p_has_alpha
      boolean,

    p_has_audio
      boolean
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_media_assets%rowtype;

  v_new_status
    text;

  v_quarantined
    boolean;

  v_aspect_ratio
    numeric(12, 6);

begin

  if
    p_actor_id is not null
  then

    perform
      web_private.require_media_admin(
        p_actor_id,
        array[
          'owner',
          'editor',
          'publisher'
        ]
      );

  end if;


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  if
    p_malware_scan_status is null

    or p_malware_scan_status not in (
      'clean',
      'infected',
      'failed'
    )
  then

    raise exception
      'Invalid final malware scan status'
      using errcode =
        '22023';

  end if;


  if
    p_metadata_sanitized is null

    or p_animated is null

    or p_has_alpha is null

    or p_has_audio is null
  then

    raise exception
      'Processing result contains null security metadata'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_asset

  from
    public.web_media_assets

  where
    id =
      p_asset_id

  for update;


  if not found
  then

    raise exception
      'Media asset not found'
      using errcode =
        'P0002';

  end if;


  if
    v_asset.status in (
      'archived',
      'deleted'
    )
  then

    raise exception
      'Archived or deleted media cannot be processed'
      using errcode =
        '55000';

  end if;


  if
    p_width is null

    or p_width not between
      1 and 16384

    or p_height is null

    or p_height not between
      1 and 16384
  then

    raise exception
      'Valid media dimensions are required'
      using errcode =
        '22023';

  end if;


  if
    v_asset.asset_type =
      'image'

    and p_duration_seconds
      is not null
  then

    raise exception
      'Image assets cannot have video duration'
      using errcode =
        '22023';

  end if;


  if
    v_asset.asset_type =
      'video'

    and (
      p_duration_seconds is null

      or p_duration_seconds <=
        0

      or p_duration_seconds >
        86400
    )
  then

    raise exception
      'Valid video duration is required'
      using errcode =
        '22023';

  end if;


  v_aspect_ratio :=
    round(
      (
        p_width::numeric /
        p_height::numeric
      ),
      6
    );


  if
    p_malware_scan_status =
      'infected'
  then

    v_new_status :=
      'quarantined';

    v_quarantined :=
      true;


  elsif
    p_malware_scan_status =
      'failed'
  then

    v_new_status :=
      'failed';

    v_quarantined :=
      true;


  elsif
    p_metadata_sanitized
  then

    v_new_status :=
      'ready';

    v_quarantined :=
      false;


  else

    v_new_status :=
      'processing';

    v_quarantined :=
      true;

  end if;


  update
    public.web_media_assets

  set
    malware_scan_status =
      p_malware_scan_status,

    metadata_sanitized =
      p_metadata_sanitized,

    quarantined =
      v_quarantined,

    status =
      v_new_status,

    width =
      p_width,

    height =
      p_height,

    aspect_ratio =
      v_aspect_ratio,

    duration_seconds =
      p_duration_seconds,

    animated =
      p_animated,

    has_alpha =
      p_has_alpha,

    has_audio =
      p_has_audio,

    processed_at =
      case

        when
          v_new_status in (
            'ready',
            'failed',
            'quarantined'
          )
        then
          now()

        else
          null

      end

  where
    id =
      p_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'security_updated',
    jsonb_build_object(
      'malware_scan_status',
        p_malware_scan_status,

      'metadata_sanitized',
        p_metadata_sanitized,

      'status',
        v_new_status,

      'quarantined',
        v_quarantined,

      'technical_operation',
        p_actor_id is null
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_apply_processing_result(
    uuid,
    uuid,
    text,
    boolean,
    integer,
    integer,
    numeric,
    boolean,
    boolean,
    boolean
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_apply_processing_result(
    uuid,
    uuid,
    text,
    boolean,
    integer,
    integer,
    numeric,
    boolean,
    boolean,
    boolean
  )
to service_role;


-- ============================================================
-- 6. UPDATE ACCESSIBILITY / SEO METADATA
-- ============================================================

create or replace function
  public.web_media_set_metadata(
    p_asset_id
      uuid,

    p_alt_text
      jsonb,

    p_seo_title
      jsonb,

    p_seo_caption
      jsonb,

    p_seo_description
      jsonb,

    p_credit
      text,

    p_eligible_for_social_preview
      boolean,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'editor'
      ]
    );


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  if
    not web_private.media_valid_localized_text(
      p_alt_text,
      300,
      true
    )
  then

    raise exception
      'Invalid localized alt text'
      using errcode =
        '22023';

  end if;


  if
    not web_private.media_valid_localized_text(
      p_seo_title,
      200,
      true
    )
  then

    raise exception
      'Invalid localized SEO title'
      using errcode =
        '22023';

  end if;


  if
    not web_private.media_valid_localized_text(
      p_seo_caption,
      1000,
      true
    )
  then

    raise exception
      'Invalid localized SEO caption'
      using errcode =
        '22023';

  end if;


  if
    not web_private.media_valid_localized_text(
      p_seo_description,
      2000,
      true
    )
  then

    raise exception
      'Invalid localized SEO description'
      using errcode =
        '22023';

  end if;


  if
    p_credit is not null

    and char_length(
      p_credit
    ) >
      500
  then

    raise exception
      'Media credit is too long'
      using errcode =
        '22023';

  end if;


  if
    p_eligible_for_social_preview
      is null
  then

    raise exception
      'Social preview eligibility is required'
      using errcode =
        '22023';

  end if;


  if exists (

    select
      1

    from
      public.web_media_publications

    where
      source_asset_id =
        p_asset_id

      and retired_at
        is null

  )
  then

    raise exception
      'Retire active publication before changing public metadata'
      using errcode =
        '55000';

  end if;


  update
    public.web_media_assets

  set
    alt_text =
      p_alt_text,

    seo_title =
      p_seo_title,

    seo_caption =
      p_seo_caption,

    seo_description =
      p_seo_description,

    credit =
      nullif(
        btrim(
          p_credit
        ),
        ''
      ),

    eligible_for_social_preview =
      p_eligible_for_social_preview

  where
    id =
      p_asset_id

    and status not in (
      'archived',
      'deleted'
    );


  if not found
  then

    raise exception
      'Editable media asset not found'
      using errcode =
        'P0002';

  end if;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'processing_updated',
    jsonb_build_object(
      'metadata_updated',
        true,

      'social_preview',
        p_eligible_for_social_preview
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_set_metadata(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    jsonb,
    text,
    boolean,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_set_metadata(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    jsonb,
    text,
    boolean,
    uuid
  )
to service_role;


-- ============================================================
-- 7. RIGHTS AND PRIVACY
-- ============================================================

create or replace function
  public.web_media_set_rights_privacy(
    p_asset_id
      uuid,

    p_rights_type
      text,

    p_commercial_use_allowed
      boolean,

    p_copyright_owner
      text,

    p_license_name
      text,

    p_license_url
      text,

    p_permission_reference
      text,

    p_contains_people
      boolean,

    p_contains_children
      boolean,

    p_contains_sensitive_information
      boolean,

    p_consent_required
      boolean,

    p_consent_confirmed
      boolean,

    p_consent_reference
      text,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  if
    p_rights_type is null

    or p_rights_type not in (
      'owned',
      'licensed',
      'customer_permission',
      'staff_permission',
      'public_domain',
      'external_permission',
      'unknown'
    )
  then

    raise exception
      'Invalid media rights type'
      using errcode =
        '22023';

  end if;


  if
    p_commercial_use_allowed is null

    or p_contains_people is null

    or p_contains_children is null

    or p_contains_sensitive_information is null

    or p_consent_required is null

    or p_consent_confirmed is null
  then

    raise exception
      'Rights and privacy booleans are required'
      using errcode =
        '22023';

  end if;


  if
    p_contains_children

    and not p_contains_people
  then

    raise exception
      'Media containing children must also be marked as containing people'
      using errcode =
        '22023';

  end if;


  if
    p_contains_children

    and not p_consent_required
  then

    raise exception
      'Media containing children requires consent tracking'
      using errcode =
        '22023';

  end if;


  if
    p_consent_confirmed

    and not p_consent_required
  then

    raise exception
      'Consent cannot be confirmed when consent is not required'
      using errcode =
        '22023';

  end if;


  if
    p_consent_confirmed

    and (
      p_consent_reference is null

      or char_length(
        btrim(
          p_consent_reference
        )
      ) =
        0
    )
  then

    raise exception
      'Confirmed consent requires a reference'
      using errcode =
        '22023';

  end if;


  if
    p_rights_type in (
      'customer_permission',
      'staff_permission',
      'external_permission'
    )

    and (
      p_permission_reference is null

      or char_length(
        btrim(
          p_permission_reference
        )
      ) =
        0
    )
  then

    raise exception
      'Permission-based rights require a reference'
      using errcode =
        '22023';

  end if;


  if
    p_rights_type =
      'licensed'

    and (
      (
        p_license_name is null

        or char_length(
          btrim(
            p_license_name
          )
        ) =
          0
      )

      and

      (
        p_license_url is null

        or char_length(
          btrim(
            p_license_url
          )
        ) =
          0
      )
    )
  then

    raise exception
      'Licensed media requires license information'
      using errcode =
        '22023';

  end if;


  if
    p_license_url is not null

    and char_length(
      btrim(
        p_license_url
      )
    ) >
      0

    and btrim(
      p_license_url
    ) !~*
      '^https?://'
  then

    raise exception
      'License URL must use HTTP or HTTPS'
      using errcode =
        '22023';

  end if;


  if
    p_commercial_use_allowed

    and p_rights_type =
      'unknown'
  then

    raise exception
      'Unknown rights cannot authorize commercial use'
      using errcode =
        '22023';

  end if;


  if
    p_copyright_owner is not null

    and char_length(
      p_copyright_owner
    ) >
      500
  then

    raise exception
      'Copyright owner is too long'
      using errcode =
        '22023';

  end if;


  if
    p_license_name is not null

    and char_length(
      p_license_name
    ) >
      500
  then

    raise exception
      'License name is too long'
      using errcode =
        '22023';

  end if;


  if
    p_license_url is not null

    and char_length(
      p_license_url
    ) >
      2048
  then

    raise exception
      'License URL is too long'
      using errcode =
        '22023';

  end if;


  if
    p_permission_reference is not null

    and char_length(
      p_permission_reference
    ) >
      1000
  then

    raise exception
      'Permission reference is too long'
      using errcode =
        '22023';

  end if;


  if
    p_consent_reference is not null

    and char_length(
      p_consent_reference
    ) >
      1000
  then

    raise exception
      'Consent reference is too long'
      using errcode =
        '22023';

  end if;


  if exists (

    select
      1

    from
      public.web_media_publications

    where
      source_asset_id =
        p_asset_id

      and retired_at
        is null

  )
  then

    raise exception
      'Retire active publication before changing rights or privacy'
      using errcode =
        '55000';

  end if;


  update
    public.web_media_assets

  set
    rights_type =
      p_rights_type,

    commercial_use_allowed =
      p_commercial_use_allowed,

    copyright_owner =
      nullif(
        btrim(
          p_copyright_owner
        ),
        ''
      ),

    license_name =
      nullif(
        btrim(
          p_license_name
        ),
        ''
      ),

    license_url =
      nullif(
        btrim(
          p_license_url
        ),
        ''
      ),

    permission_reference =
      nullif(
        btrim(
          p_permission_reference
        ),
        ''
      ),

    contains_people =
      p_contains_people,

    contains_children =
      p_contains_children,

    contains_sensitive_information =
      p_contains_sensitive_information,

    consent_required =
      p_consent_required,

    consent_confirmed =
      p_consent_confirmed,

    consent_reference =
      nullif(
        btrim(
          p_consent_reference
        ),
        ''
      )

  where
    id =
      p_asset_id

    and status not in (
      'archived',
      'deleted'
    );


  if not found
  then

    raise exception
      'Editable media asset not found'
      using errcode =
        'P0002';

  end if;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'rights_updated',
    jsonb_build_object(
      'rights_type',
        p_rights_type,

      'commercial_use_allowed',
        p_commercial_use_allowed,

      'contains_people',
        p_contains_people,

      'contains_children',
        p_contains_children,

      'contains_sensitive_information',
        p_contains_sensitive_information,

      'consent_required',
        p_consent_required,

      'consent_confirmed',
        p_consent_confirmed
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_set_rights_privacy(
    uuid,
    text,
    boolean,
    text,
    text,
    text,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    text,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_set_rights_privacy(
    uuid,
    text,
    boolean,
    text,
    text,
    text,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    text,
    uuid
  )
to service_role;


-- ============================================================
-- 8. MODERATION
-- ============================================================

create or replace function
  public.web_media_set_moderation(
    p_asset_id
      uuid,

    p_status
      text,

    p_reason
      text,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_media_assets%rowtype;

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_status is null

    or p_status not in (
      'not_required',
      'pending',
      'approved',
      'rejected',
      'restricted'
    )
  then

    raise exception
      'Invalid moderation status'
      using errcode =
        '22023';

  end if;


  if
    p_reason is not null

    and char_length(
      p_reason
    ) >
      500
  then

    raise exception
      'Moderation reason is too long'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_asset

  from
    public.web_media_assets

  where
    id =
      p_asset_id

  for update;


  if not found
  then

    raise exception
      'Media asset not found'
      using errcode =
        'P0002';

  end if;


  if
    v_asset.status in (
      'archived',
      'deleted'
    )
  then

    raise exception
      'Archived or deleted media cannot be moderated'
      using errcode =
        '55000';

  end if;


  if
    p_status in (
      'approved',
      'not_required'
    )

    and (
      v_asset.status <>
        'ready'

      or v_asset.quarantined

      or v_asset.malware_scan_status <>
        'clean'

      or not v_asset.metadata_sanitized
    )
  then

    raise exception
      'Media must pass security processing before approval'
      using errcode =
        '55000';

  end if;


  if
    p_status not in (
      'approved',
      'not_required'
    )

    and exists (

      select
        1

      from
        public.web_media_publications

      where
        source_asset_id =
          p_asset_id

        and retired_at
          is null

    )
  then

    raise exception
      'Retire the active publication before reducing moderation status'
      using errcode =
        '55000';

  end if;


  update
    public.web_media_assets

  set
    moderation_status =
      p_status

  where
    id =
      p_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'moderation_updated',
    jsonb_build_object(
      'status',
        p_status,

      'reason',
        nullif(
          btrim(
            p_reason
          ),
          ''
        )
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_set_moderation(
    uuid,
    text,
    text,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_set_moderation(
    uuid,
    text,
    text,
    uuid
  )
to service_role;


-- ============================================================
-- 9. PUBLISH MEDIA
-- ============================================================
--
-- Esta función NO copia el archivo.
--
-- Orden obligatorio en backend:
--
-- 1. leer original privado;
-- 2. generar derivado seguro;
-- 3. escribir derivado en web-media-public;
-- 4. llamar web_media_publish_asset();
--
-- La RPC verifica que el objeto público ya exista.
-- ============================================================

create or replace function
  public.web_media_publish_asset(
    p_asset_id
      uuid,

    p_public_object_path
      text,

    p_public_mime_type
      text,

    p_public_size_bytes
      bigint,

    p_public_width
      integer,

    p_public_height
      integer,

    p_public_duration_seconds
      numeric,

    p_seo_indexable
      boolean,

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
    public.web_media_assets%rowtype;

  v_publication_id
    uuid;

  v_published_at
    timestamptz;

  v_has_pl_alt
    boolean;

  v_has_es_alt
    boolean;

  v_has_en_alt
    boolean;

begin

  perform
    web_private.require_media_admin(
      p_published_by,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  if
    not coalesce(
      web_private.media_safe_object_path(
        p_public_object_path
      ),
      false
    )
  then

    raise exception
      'Invalid public object path'
      using errcode =
        '22023';

  end if;


  if
    p_public_mime_type is null

    or p_public_mime_type not in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm'
    )
  then

    raise exception
      'Unsupported public MIME type'
      using errcode =
        '22023';

  end if;


  if
    p_public_size_bytes is null

    or p_public_size_bytes <
      1

    or p_public_size_bytes >
      104857600
  then

    raise exception
      'Invalid public media size'
      using errcode =
        '22023';

  end if;


  if
    p_seo_indexable is null
  then

    raise exception
      'SEO indexability decision is required'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_asset

  from
    public.web_media_assets

  where
    id =
      p_asset_id

  for update;


  if not found
  then

    raise exception
      'Media asset not found'
      using errcode =
        'P0002';

  end if;


  -- ----------------------------------------------------------
  -- SECURITY GATES
  -- ----------------------------------------------------------

  if
    v_asset.status <>
      'ready'
  then

    raise exception
      'Only ready media can be published'
      using errcode =
        '55000';

  end if;


  if
    v_asset.quarantined
  then

    raise exception
      'Quarantined media cannot be published'
      using errcode =
        '55000';

  end if;


  if
    v_asset.malware_scan_status <>
      'clean'
  then

    raise exception
      'Media must pass malware scanning before publication'
      using errcode =
        '55000';

  end if;


  if
    not v_asset.metadata_sanitized
  then

    raise exception
      'Media metadata must be sanitized before publication'
      using errcode =
        '55000';

  end if;


  if
    v_asset.moderation_status not in (
      'approved',
      'not_required'
    )
  then

    raise exception
      'Media must pass moderation before publication'
      using errcode =
        '55000';

  end if;


  -- ----------------------------------------------------------
  -- RIGHTS
  -- ----------------------------------------------------------

  if
    v_asset.rights_type =
      'unknown'
  then

    raise exception
      'Media rights must be established before publication'
      using errcode =
        '55000';

  end if;


  if
    not v_asset.commercial_use_allowed
  then

    raise exception
      'Media without commercial-use permission cannot be published'
      using errcode =
        '55000';

  end if;


  -- ----------------------------------------------------------
  -- PRIVACY
  -- ----------------------------------------------------------

  if
    v_asset.contains_sensitive_information
  then

    raise exception
      'Media containing sensitive information cannot be published'
      using errcode =
        '55000';

  end if;


  if
    v_asset.consent_required

    and not v_asset.consent_confirmed
  then

    raise exception
      'Required person consent has not been confirmed'
      using errcode =
        '55000';

  end if;


  if
    v_asset.contains_children

    and not v_asset.consent_confirmed
  then

    raise exception
      'Media containing children requires confirmed consent'
      using errcode =
        '55000';

  end if;


  -- ----------------------------------------------------------
  -- TYPE / PUBLIC MIME
  -- ----------------------------------------------------------

  if
    (
      v_asset.asset_type =
        'image'

      and p_public_mime_type not in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif'
      )
    )

    or

    (
      v_asset.asset_type =
        'video'

      and p_public_mime_type not in (
        'video/mp4',
        'video/webm'
      )
    )
  then

    raise exception
      'Public MIME type does not match media type'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- DIMENSIONS
  -- ----------------------------------------------------------

  if
    p_public_width is null

    or p_public_width not between
      1 and 16384

    or p_public_height is null

    or p_public_height not between
      1 and 16384
  then

    raise exception
      'Valid public media dimensions are required'
      using errcode =
        '22023';

  end if;


  if
    v_asset.asset_type =
      'image'

    and p_public_duration_seconds
      is not null
  then

    raise exception
      'Published images cannot have video duration'
      using errcode =
        '22023';

  end if;


  if
    v_asset.asset_type =
      'video'

    and (
      p_public_duration_seconds is null

      or p_public_duration_seconds <=
        0

      or p_public_duration_seconds >
        86400
    )
  then

    raise exception
      'Published video requires a valid duration'
      using errcode =
        '22023';

  end if;


  -- ----------------------------------------------------------
  -- ACCESSIBILITY
  -- ----------------------------------------------------------
  --
  -- Las imágenes de la biblioteca multimedia son imágenes
  -- informativas.
  --
  -- Assets puramente decorativos deberán manejarse mediante
  -- un flujo/tipo específico en una futura migración.
  --
  -- Exigimos ALT para los tres idiomas públicos actuales.
  -- ----------------------------------------------------------

  v_has_pl_alt :=
    coalesce(
      char_length(
        btrim(
          v_asset.alt_text ->> 'pl'
        )
      ),
      0
    ) >
      0;


  v_has_es_alt :=
    coalesce(
      char_length(
        btrim(
          v_asset.alt_text ->> 'es'
        )
      ),
      0
    ) >
      0;


  v_has_en_alt :=
    coalesce(
      char_length(
        btrim(
          v_asset.alt_text ->> 'en'
        )
      ),
      0
    ) >
      0;


  if
    v_asset.asset_type =
      'image'

    and (
      not v_has_pl_alt

      or not v_has_es_alt

      or not v_has_en_alt
    )
  then

    raise exception
      'Published images require PL, ES and EN alt text'
      using errcode =
        '55000';

  end if;


  -- ----------------------------------------------------------
  -- ACTIVE PUBLICATION
  -- ----------------------------------------------------------

  if exists (

    select
      1

    from
      public.web_media_publications

    where
      source_asset_id =
        p_asset_id

      and retired_at
        is null

  )
  then

    raise exception
      'Asset already has an active publication'
      using errcode =
        '55000';

  end if;


  -- ----------------------------------------------------------
  -- PUBLIC OBJECT EXISTS
  -- ----------------------------------------------------------

  if not exists (

    select
      1

    from
      storage.objects

    where
      bucket_id =
        'web-media-public'

      and name =
        p_public_object_path

  )
  then

    raise exception
      'Public media object does not exist in Storage'
      using errcode =
        'P0002';

  end if;


  -- ----------------------------------------------------------
  -- CREATE PUBLICATION SNAPSHOT
  -- ----------------------------------------------------------

  insert into
    public.web_media_publications (
      source_asset_id,
      public_bucket,
      object_path,
      mime_type,
      size_bytes,
      width,
      height,
      duration_seconds,
      alt_text,
      seo_indexable,
      published_by
    )

  values (
    p_asset_id,
    'web-media-public',
    p_public_object_path,
    p_public_mime_type,
    p_public_size_bytes,
    p_public_width,
    p_public_height,
    p_public_duration_seconds,
    v_asset.alt_text,
    p_seo_indexable,
    p_published_by
  )

  returning
    id,
    published_at

  into
    v_publication_id,
    v_published_at;


  update
    public.web_media_assets

  set
    visibility =
      'public',

    seo_indexable =
      p_seo_indexable

  where
    id =
      p_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      publication_id,
      action,
      details
    )

  values (
    p_published_by,
    p_asset_id,
    v_publication_id,
    'published',
    jsonb_build_object(
      'public_object_path',
        p_public_object_path,

      'mime_type',
        p_public_mime_type,

      'size_bytes',
        p_public_size_bytes,

      'seo_indexable',
        p_seo_indexable
    )
  );


  return
    jsonb_build_object(
      'publication_id',
        v_publication_id,

      'asset_id',
        p_asset_id,

      'bucket',
        'web-media-public',

      'object_path',
        p_public_object_path,

      'mime_type',
        p_public_mime_type,

      'published_at',
        v_published_at,

      'seo_indexable',
        p_seo_indexable
    );

end;
$function$;


revoke execute
on function
  public.web_media_publish_asset(
    uuid,
    text,
    text,
    bigint,
    integer,
    integer,
    numeric,
    boolean,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_publish_asset(
    uuid,
    text,
    text,
    bigint,
    integer,
    integer,
    numeric,
    boolean,
    uuid
  )
to service_role;


-- ============================================================
-- 10. RETIRE PUBLICATION
-- ============================================================
--
-- Orden backend:
--
-- 1. eliminar objeto físico del bucket público;
-- 2. llamar esta RPC;
-- 3. RPC confirma que ya no existe;
-- 4. snapshot queda retirado.
--
-- Preferimos un posible snapshot temporalmente apuntando
-- a objeto inexistente antes que marcarlo retirado mientras
-- un archivo todavía continúa públicamente accesible.
-- ============================================================

create or replace function
  public.web_media_retire_publication(
    p_publication_id
      uuid,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_publication
    public.web_media_publications%rowtype;

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_publication_id is null
  then

    raise exception
      'Publication ID is required'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_publication

  from
    public.web_media_publications

  where
    id =
      p_publication_id

  for update;


  if not found
  then

    raise exception
      'Media publication not found'
      using errcode =
        'P0002';

  end if;


  if
    v_publication.retired_at
      is not null
  then

    return;

  end if;


  if exists (

    select
      1

    from
      storage.objects

    where
      bucket_id =
        v_publication.public_bucket

      and name =
        v_publication.object_path

  )
  then

    raise exception
      'Delete the public Storage object before retiring the publication'
      using errcode =
        '55000';

  end if;


  update
    public.web_media_publications

  set
    retired_by =
      p_actor_id,

    retired_at =
      now()

  where
    id =
      p_publication_id;


  if not exists (

    select
      1

    from
      public.web_media_publications

    where
      source_asset_id =
        v_publication.source_asset_id

      and retired_at
        is null

      and id <>
        p_publication_id

  )
  then

    update
      public.web_media_assets

    set
      visibility =
        'private',

      seo_indexable =
        false

    where
      id =
        v_publication.source_asset_id;

  end if;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      publication_id,
      action,
      details
    )

  values (
    p_actor_id,
    v_publication.source_asset_id,
    p_publication_id,
    'retired',
    jsonb_build_object(
      'object_path',
        v_publication.object_path
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_retire_publication(
    uuid,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_retire_publication(
    uuid,
    uuid
  )
to service_role;


-- ============================================================
-- 11. ARCHIVE ASSET
-- ============================================================

create or replace function
  public.web_media_archive_asset(
    p_asset_id
      uuid,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_media_assets%rowtype;

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_asset

  from
    public.web_media_assets

  where
    id =
      p_asset_id

  for update;


  if not found
  then

    raise exception
      'Media asset not found'
      using errcode =
        'P0002';

  end if;


  if
    v_asset.status =
      'deleted'
  then

    raise exception
      'Deleted media cannot be archived'
      using errcode =
        '55000';

  end if;


  if
    v_asset.status =
      'archived'
  then

    return;

  end if;


  if exists (

    select
      1

    from
      public.web_media_publications

    where
      source_asset_id =
        p_asset_id

      and retired_at
        is null

  )
  then

    raise exception
      'Retire active publication before archiving media'
      using errcode =
        '55000';

  end if;


  update
    public.web_media_assets

  set
    status =
      'archived',

    visibility =
      'private',

    seo_indexable =
      false,

    archived_at =
      now()

  where
    id =
      p_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'archived',
    '{}'::jsonb
  );

end;
$function$;


revoke execute
on function
  public.web_media_archive_asset(
    uuid,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_archive_asset(
    uuid,
    uuid
  )
to service_role;


-- ============================================================
-- 12. RESTORE ARCHIVED ASSET
-- ============================================================
--
-- Restaurar NO significa volver a READY.
--
-- Siempre:
--
-- archived
--    ↓
-- processing
--    ↓
-- quarantine
--    ↓
-- scan de nuevo
--    ↓
-- sanitización
--    ↓
-- moderación
-- ============================================================

create or replace function
  public.web_media_restore_asset(
    p_asset_id
      uuid,

    p_actor_id
      uuid
  )
returns void
language plpgsql
security definer
set search_path = ''
as $function$

declare

  v_asset
    public.web_media_assets%rowtype;

begin

  perform
    web_private.require_media_admin(
      p_actor_id,
      array[
        'owner',
        'publisher'
      ]
    );


  if
    p_asset_id is null
  then

    raise exception
      'Asset ID is required'
      using errcode =
        '22023';

  end if;


  select
    *

  into
    v_asset

  from
    public.web_media_assets

  where
    id =
      p_asset_id

  for update;


  if not found
  then

    raise exception
      'Media asset not found'
      using errcode =
        'P0002';

  end if;


  if
    v_asset.status <>
      'archived'
  then

    raise exception
      'Only archived media can be restored'
      using errcode =
        '55000';

  end if;


  if not exists (

    select
      1

    from
      storage.objects

    where
      bucket_id =
        v_asset.original_bucket

      and name =
        v_asset.object_path

  )
  then

    raise exception
      'Original private Storage object no longer exists'
      using errcode =
        'P0002';

  end if;


  update
    public.web_media_assets

  set
    status =
      'processing',

    visibility =
      'private',

    seo_indexable =
      false,

    moderation_status =
      'pending',

    malware_scan_status =
      'pending',

    metadata_sanitized =
      false,

    quarantined =
      true,

    processed_at =
      null,

    archived_at =
      null

  where
    id =
      p_asset_id;


  insert into
    web_private.media_audit (
      actor_id,
      asset_id,
      action,
      details
    )

  values (
    p_actor_id,
    p_asset_id,
    'restored',
    jsonb_build_object(
      'requires_reprocessing',
        true
    )
  );

end;
$function$;


revoke execute
on function
  public.web_media_restore_asset(
    uuid,
    uuid
  )
from public, anon, authenticated;


grant execute
on function
  public.web_media_restore_asset(
    uuid,
    uuid
  )
to service_role;


-- ============================================================
-- 13. FUNCTION COMMENTS
-- ============================================================

comment on function
  public.web_media_register_asset(
    text,
    text,
    text,
    text,
    text,
    bigint,
    text,
    uuid,
    uuid,
    text
  )
is
  'Registra un original multimedia administrativo que ya existe en el bucket privado. La RPC solo puede ser ejecutada mediante service_role y exige identidad administrativa válida.';


comment on function
  public.web_media_apply_processing_result(
    uuid,
    uuid,
    text,
    boolean,
    integer,
    integer,
    numeric,
    boolean,
    boolean,
    boolean
  )
is
  'Aplica resultados de procesamiento y seguridad. Un asset solo llega a ready cuando malware_scan_status es clean, metadata está sanitizada y la cuarentena fue retirada.';


comment on function
  public.web_media_set_metadata(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    jsonb,
    text,
    boolean,
    uuid
  )
is
  'Actualiza metadata de accesibilidad y SEO únicamente antes de la publicación activa.';


comment on function
  public.web_media_set_rights_privacy(
    uuid,
    text,
    boolean,
    text,
    text,
    text,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    text,
    uuid
  )
is
  'Registra derechos, permisos y estado de privacidad antes de permitir publicación comercial.';


comment on function
  public.web_media_set_moderation(
    uuid,
    text,
    text,
    uuid
  )
is
  'Controla el estado de moderación de multimedia y evita rebajarlo mientras existe una publicación activa.';


comment on function
  public.web_media_publish_asset(
    uuid,
    text,
    text,
    bigint,
    integer,
    integer,
    numeric,
    boolean,
    uuid
  )
is
  'Publica únicamente multimedia procesada, limpia, sanitizada, moderada, con derechos comerciales y requisitos de privacidad satisfechos.';


comment on function
  public.web_media_retire_publication(
    uuid,
    uuid
  )
is
  'Retira el snapshot público únicamente después de comprobar que el objeto correspondiente ya fue eliminado del bucket público.';


comment on function
  public.web_media_archive_asset(
    uuid,
    uuid
  )
is
  'Archiva multimedia sin publicación activa y la retira de cualquier uso público futuro.';


comment on function
  public.web_media_restore_asset(
    uuid,
    uuid
  )
is
  'Restaura un asset archivado a cuarentena y obliga a ejecutar nuevamente procesamiento, seguridad y moderación.';


commit;
