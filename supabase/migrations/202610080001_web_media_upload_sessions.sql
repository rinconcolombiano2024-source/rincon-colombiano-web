begin;


-- ============================================================
-- RINCÓN COLOMBIANO
-- ENTERPRISE MEDIA UPLOAD SESSIONS
-- ============================================================
--
-- DEPENDE DE:
--
-- 202610070001_web_media_library.sql
-- 202610070002_web_media_operations.sql
--
-- OBJETIVO:
--
-- Crear una capa de coordinación segura entre:
--
-- ADMIN
--   ↓
-- intención de upload
--   ↓
-- URL firmada temporal
--   ↓
-- Storage privado
--   ↓
-- validación
--   ↓
-- procesamiento
--   ↓
-- web_media_assets
--
-- PRINCIPIOS:
--
-- 1. Los archivos grandes NO atraviesan Server Actions.
-- 2. El token de upload firmado NO se almacena en PostgreSQL.
-- 3. Cada intención tiene request_id único.
-- 4. Cada sesión tiene object_path único.
-- 5. Nunca se permite upsert como flujo normal.
-- 6. El original continúa siendo privado.
-- 7. Las sesiones expiran.
-- 8. anon no accede.
-- 9. authenticated no accede directamente.
-- 10. únicamente service_role administra estas filas.
--
-- El navegador recibirá posteriormente:
--
-- - path;
-- - token temporal de Supabase;
-- - información estrictamente necesaria para subir.
--
-- Nunca recibirá:
--
-- - SUPABASE_SERVICE_ROLE_KEY;
-- - secretos permanentes;
-- - acceso general al bucket.
-- ============================================================


-- ============================================================
-- 1. UPLOAD SESSION TABLE
-- ============================================================

create table if not exists
  web_private.media_upload_sessions (

  -- ----------------------------------------------------------
  -- IDENTITY
  -- ----------------------------------------------------------

  id
    uuid
    primary key
    default gen_random_uuid(),


  /**
   * request_id permite idempotencia.
   *
   * Si el frontend reintenta accidentalmente la misma
   * solicitud, el backend puede reconocerla.
   */
  request_id
    uuid
    not null
    unique,


  -- ----------------------------------------------------------
  -- ADMINISTRATIVE ACTOR
  -- ----------------------------------------------------------

  actor_id
    uuid
    references auth.users(id)
    on delete set null,


  -- ----------------------------------------------------------
  -- PURPOSE
  -- ----------------------------------------------------------
  --
  -- Coincide con el dominio MediaUploadPurpose,
  -- aunque community/profile tendrán posteriormente
  -- autorización específica independiente.
  -- ----------------------------------------------------------

  purpose
    text
    not null
    check (
      purpose in (
        'content',
        'menu',
        'restaurant',
        'community',
        'profile',
        'event',
        'service',
        'promotion',
        'article',
        'seo',
        'other'
      )
    ),


  -- ----------------------------------------------------------
  -- ASSET TYPE
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
    default 'created'
    check (
      status in (
        'created',
        'uploading',
        'uploaded',
        'validating',
        'processing',
        'completed',
        'failed',
        'expired'
      )
    ),


  -- ----------------------------------------------------------
  -- STORAGE DESTINATION
  -- ----------------------------------------------------------

  bucket
    text
    not null
    default 'web-media-originals'
    check (
      bucket =
        'web-media-originals'
    ),


  /**
   * La ruta la genera el backend.
   *
   * Nunca se utiliza directamente un filename enviado
   * por el cliente como ruta de Storage.
   */
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


  -- ----------------------------------------------------------
  -- ORIGINAL FILE NAME
  -- ----------------------------------------------------------

  original_name
    text
    not null

    check (
      char_length(
        btrim(
          original_name
        )
      ) between 1 and 255
    )

    check (
      original_name !~
        '[[:cntrl:]]'
    ),


  -- ----------------------------------------------------------
  -- EXPECTED MIME
  -- ----------------------------------------------------------

  expected_mime_type
    text
    not null

    check (
      expected_mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      )
    ),


  /**
   * Defensa cruzada:
   *
   * image solo puede declarar MIME de imagen.
   * video solo puede declarar MIME de vídeo.
   */
  check (
    (
      asset_type =
        'image'

      and expected_mime_type in (
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

      and expected_mime_type in (
        'video/mp4',
        'video/webm',
        'video/quicktime'
      )
    )
  ),


  -- ----------------------------------------------------------
  -- EXPECTED SIZE
  -- ----------------------------------------------------------

  expected_size_bytes
    bigint
    not null

    check (
      expected_size_bytes >
        0

      and expected_size_bytes <=
        104857600
    ),


  /**
   * El límite queda almacenado para poder comparar
   * posteriormente intención vs objeto recibido.
   */
  maximum_file_size_bytes
    bigint
    not null

    check (
      maximum_file_size_bytes >
        0

      and maximum_file_size_bytes <=
        104857600
    ),


  check (
    expected_size_bytes <=
      maximum_file_size_bytes
  ),


  -- ----------------------------------------------------------
  -- OPTIONAL RESTAURANT RELATIONSHIP
  -- ----------------------------------------------------------

  restaurant_id
    text

    check (
      restaurant_id is null

      or char_length(
        btrim(
          restaurant_id
        )
      ) between 1 and 120
    ),


  -- ----------------------------------------------------------
  -- COMPLETED ASSET
  -- ----------------------------------------------------------

  completed_asset_id
    uuid
    references public.web_media_assets(id)
    on delete restrict,


  -- ----------------------------------------------------------
  -- FAILURE
  -- ----------------------------------------------------------

  /**
   * Código técnico estable.
   *
   * No almacenamos aquí stack traces ni secretos.
   */
  failure_code
    text

    check (
      failure_code is null

      or (
        char_length(
          failure_code
        ) between 1 and 100

        and failure_code ~
          '^[A-Z0-9_:-]+$'
      )
    ),


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


  /**
   * Supabase signed upload URLs son temporales.
   *
   * Mantenemos la sesión con la misma ventana máxima
   * operativa: 2 horas.
   */
  expires_at
    timestamptz
    not null
    default (
      now() +
      interval '2 hours'
    ),


  upload_started_at
    timestamptz,


  uploaded_at
    timestamptz,


  validation_started_at
    timestamptz,


  processing_started_at
    timestamptz,


  completed_at
    timestamptz,


  failed_at
    timestamptz,


  -- ----------------------------------------------------------
  -- ATTEMPTS
  -- ----------------------------------------------------------

  attempt_count
    integer
    not null
    default 0

    check (
      attempt_count between
        0 and 20
    ),


  -- ----------------------------------------------------------
  -- TEMPORAL CONSISTENCY
  -- ----------------------------------------------------------

  check (
    expires_at >
      created_at
  ),


  check (
    expires_at <=
      created_at +
      interval '2 hours'
  ),


  -- ----------------------------------------------------------
  -- COMPLETION CONSISTENCY
  -- ----------------------------------------------------------

  check (
    (
      status =
        'completed'

      and completed_asset_id
        is not null

      and completed_at
        is not null
    )

    or

    (
      status <>
        'completed'

      and completed_asset_id
        is null

      and completed_at
        is null
    )
  ),


  -- ----------------------------------------------------------
  -- FAILURE CONSISTENCY
  -- ----------------------------------------------------------

  check (
    (
      status =
        'failed'

      and failed_at
        is not null
    )

    or

    (
      status <>
        'failed'
    )
  )
);


-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================
--
-- Esta tabla contiene:
--
-- - rutas internas;
-- - intención administrativa;
-- - estado del pipeline.
--
-- No existe ninguna razón para exponerla mediante la
-- superficie pública de Supabase.
-- ============================================================

alter table
  web_private.media_upload_sessions
enable row level security;


revoke all
on web_private.media_upload_sessions
from anon, authenticated;


grant select,
      insert,
      update,
      delete
on web_private.media_upload_sessions
to service_role;


-- ============================================================
-- 3. AUTOMATIC UPDATED_AT
-- ============================================================
--
-- Reutilizamos el trigger seguro creado por:
--
-- 202610070001_web_media_library.sql
-- ============================================================

drop trigger if exists
  media_upload_sessions_updated_at
on web_private.media_upload_sessions;


create trigger
  media_upload_sessions_updated_at

before update
on web_private.media_upload_sessions

for each row

execute function
  web_private.touch_web_media_updated_at();


-- ============================================================
-- 4. PREVENT TERMINAL SESSION REOPENING
-- ============================================================
--
-- Una sesión:
--
-- completed
-- failed
-- expired
--
-- nunca vuelve silenciosamente a un estado activo.
--
-- Para reintentar se genera una nueva request_id y una nueva
-- ruta de Storage.
-- ============================================================

create or replace function
  web_private.protect_media_upload_terminal_state()
returns trigger
language plpgsql
set search_path = ''
as $function$

begin

  if
    old.status in (
      'completed',
      'failed',
      'expired'
    )

    and new.status is distinct from
      old.status
  then

    raise exception
      'Terminal media upload session cannot be reopened'
      using errcode =
        '55000';

  end if;


  return
    new;

end;
$function$;


revoke execute
on function
  web_private.protect_media_upload_terminal_state()
from public, anon, authenticated;


grant execute
on function
  web_private.protect_media_upload_terminal_state()
to service_role;


drop trigger if exists
  media_upload_sessions_terminal_guard
on web_private.media_upload_sessions;


create trigger
  media_upload_sessions_terminal_guard

before update
on web_private.media_upload_sessions

for each row

execute function
  web_private.protect_media_upload_terminal_state();


-- ============================================================
-- 5. STATUS TRANSITION VALIDATOR
-- ============================================================
--
-- Permitimos exclusivamente:
--
-- created
--   → uploading
--   → uploaded
--   → validating
--   → processing
--   → completed
--
-- Cualquier estado activo puede terminar en:
--
-- failed
-- expired
--
-- No permitimos saltos arbitrarios hacia atrás.
-- ============================================================

create or replace function
  web_private.validate_media_upload_transition()
returns trigger
language plpgsql
set search_path = ''
as $function$

begin

  if
    new.status is not distinct from
      old.status
  then

    return
      new;

  end if;


  if
    new.status in (
      'failed',
      'expired'
    )
  then

    return
      new;

  end if;


  if
    (
      old.status =
        'created'

      and new.status =
        'uploading'
    )

    or

    (
      old.status =
        'uploading'

      and new.status =
        'uploaded'
    )

    or

    (
      old.status =
        'uploaded'

      and new.status =
        'validating'
    )

    or

    (
      old.status =
        'validating'

      and new.status =
        'processing'
    )

    or

    (
      old.status =
        'processing'

      and new.status =
        'completed'
    )
  then

    return
      new;

  end if;


  raise exception
    'Invalid media upload session status transition: % -> %',
    old.status,
    new.status
    using errcode =
      '55000';

end;
$function$;


revoke execute
on function
  web_private.validate_media_upload_transition()
from public, anon, authenticated;


grant execute
on function
  web_private.validate_media_upload_transition()
to service_role;


drop trigger if exists
  media_upload_sessions_transition_guard
on web_private.media_upload_sessions;


create trigger
  media_upload_sessions_transition_guard

before update
on web_private.media_upload_sessions

for each row

execute function
  web_private.validate_media_upload_transition();


-- ============================================================
-- 6. AUTOMATIC STATE TIMESTAMPS
-- ============================================================

create or replace function
  web_private.stamp_media_upload_status()
returns trigger
language plpgsql
set search_path = ''
as $function$

begin

  if
    new.status is not distinct from
      old.status
  then

    return
      new;

  end if;


  if
    new.status =
      'uploading'
  then

    new.upload_started_at :=
      coalesce(
        old.upload_started_at,
        now()
      );

    new.attempt_count :=
      old.attempt_count +
      1;


  elsif
    new.status =
      'uploaded'
  then

    new.uploaded_at :=
      now();


  elsif
    new.status =
      'validating'
  then

    new.validation_started_at :=
      now();


  elsif
    new.status =
      'processing'
  then

    new.processing_started_at :=
      now();


  elsif
    new.status =
      'completed'
  then

    new.completed_at :=
      now();

    new.failure_code :=
      null;

    new.failed_at :=
      null;


  elsif
    new.status =
      'failed'
  then

    new.failed_at :=
      now();


  elsif
    new.status =
      'expired'
  then

    new.failure_code :=
      coalesce(
        new.failure_code,
        'UPLOAD_EXPIRED'
      );

  end if;


  return
    new;

end;
$function$;


revoke execute
on function
  web_private.stamp_media_upload_status()
from public, anon, authenticated;


grant execute
on function
  web_private.stamp_media_upload_status()
to service_role;


drop trigger if exists
  media_upload_sessions_status_stamp
on web_private.media_upload_sessions;


create trigger
  media_upload_sessions_status_stamp

before update
on web_private.media_upload_sessions

for each row

execute function
  web_private.stamp_media_upload_status();


-- ============================================================
-- 7. OBJECT PATH IMMUTABILITY
-- ============================================================
--
-- Después de crear una sesión nunca cambiamos:
--
-- - request_id;
-- - actor;
-- - destination bucket;
-- - object_path;
-- - asset type;
-- - expected MIME;
-- - expected size;
-- - maximum size.
--
-- Si algo cambia, se crea una sesión nueva.
-- ============================================================

create or replace function
  web_private.protect_media_upload_identity()
returns trigger
language plpgsql
set search_path = ''
as $function$

begin

  if
    new.request_id is distinct from
      old.request_id

    or new.actor_id is distinct from
      old.actor_id

    or new.bucket is distinct from
      old.bucket

    or new.object_path is distinct from
      old.object_path

    or new.asset_type is distinct from
      old.asset_type

    or new.expected_mime_type is distinct from
      old.expected_mime_type

    or new.expected_size_bytes is distinct from
      old.expected_size_bytes

    or new.maximum_file_size_bytes is distinct from
      old.maximum_file_size_bytes
  then

    raise exception
      'Media upload session identity fields are immutable'
      using errcode =
        '55000';

  end if;


  return
    new;

end;
$function$;


revoke execute
on function
  web_private.protect_media_upload_identity()
from public, anon, authenticated;


grant execute
on function
  web_private.protect_media_upload_identity()
to service_role;


drop trigger if exists
  media_upload_sessions_identity_guard
on web_private.media_upload_sessions;


create trigger
  media_upload_sessions_identity_guard

before update
on web_private.media_upload_sessions

for each row

execute function
  web_private.protect_media_upload_identity();


-- ============================================================
-- 8. INDEXES
-- ============================================================

create index if not exists
  media_upload_sessions_status_time_idx
on web_private.media_upload_sessions (
  status,
  created_at desc
);


create index if not exists
  media_upload_sessions_expiry_idx
on web_private.media_upload_sessions (
  expires_at
)
where
  status not in (
    'completed',
    'failed',
    'expired'
  );


create index if not exists
  media_upload_sessions_actor_time_idx
on web_private.media_upload_sessions (
  actor_id,
  created_at desc
)
where
  actor_id is not null;


create index if not exists
  media_upload_sessions_restaurant_time_idx
on web_private.media_upload_sessions (
  restaurant_id,
  created_at desc
)
where
  restaurant_id is not null;


create unique index if not exists
  media_upload_sessions_completed_asset_idx
on web_private.media_upload_sessions (
  completed_asset_id
)
where
  completed_asset_id is not null;


-- ============================================================
-- 9. COMMENTS
-- ============================================================

comment on table
  web_private.media_upload_sessions
is
  'Sesiones privadas e idempotentes para coordinar cargas multimedia directas hacia Supabase Storage sin enviar archivos grandes a través de Server Actions.';


comment on column
  web_private.media_upload_sessions.request_id
is
  'Identificador idempotente generado por backend para impedir creación accidental de múltiples sesiones para una misma operación.';


comment on column
  web_private.media_upload_sessions.object_path
is
  'Ruta privada generada por backend dentro de web-media-originals. Nunca debe construirse directamente desde un nombre proporcionado por usuario.';


comment on column
  web_private.media_upload_sessions.expected_mime_type
is
  'MIME declarado y validado durante la creación de la intención. Debe comprobarse nuevamente contra el objeto recibido antes de registrar el asset definitivo.';


comment on column
  web_private.media_upload_sessions.expected_size_bytes
is
  'Tamaño esperado declarado al crear la sesión. Debe compararse posteriormente con el objeto realmente recibido.';


comment on column
  web_private.media_upload_sessions.expires_at
is
  'Momento máximo de vigencia lógica de la sesión. El token firmado no se almacena en PostgreSQL.';


comment on column
  web_private.media_upload_sessions.completed_asset_id
is
  'Asset privado definitivo creado únicamente después de validar el objeto recibido.';


commit;
