-- Commercial media: fix hero_primary mismatch and add optional photos.
-- Reuse server-side signature-validated upload, role checks and audit.
-- Do NOT grant brand write RPCs to anon/authenticated.
alter table public.web_brand_assets
  drop constraint if exists web_brand_assets_slot_check;
alter table public.web_brand_assets
  add constraint web_brand_assets_slot_check
  check (slot in ('logo_primary', 'logo_compact', 'logo_light', 'logo_dark', 'favicon', 'open_graph', 'social_square', 'hero_primary', 'campaign_primary', 'food_featured_1', 'food_featured_2', 'food_featured_3'));

alter table public.web_brand_published
  drop constraint if exists web_brand_published_slot_check;
alter table public.web_brand_published
  add constraint web_brand_published_slot_check
  check (slot in ('logo_primary', 'logo_compact', 'logo_light', 'logo_dark', 'favicon', 'open_graph', 'social_square', 'hero_primary', 'campaign_primary', 'food_featured_1', 'food_featured_2', 'food_featured_3'));

-- Preserve existing function body and privileges; only expand
-- allowlist. Original service_role-only RPC access is unchanged.
CREATE OR REPLACE FUNCTION public.web_brand_register_asset(p_slot text, p_object_path text, p_original_name text, p_mime_type text, p_size_bytes bigint, p_alt_text text, p_sha256 text, p_uploaded_by uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

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
      'hero_primary',
      'campaign_primary',
      'food_featured_1',
      'food_featured_2',
      'food_featured_3'
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

revoke all on function public.web_brand_register_asset(text,text,text,text,bigint,text,text,uuid) from public, anon, authenticated;
grant execute on function public.web_brand_register_asset(text,text,text,text,bigint,text,text,uuid) to service_role;
