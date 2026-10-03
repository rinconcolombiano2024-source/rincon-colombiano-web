/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * RC ORDERA — Server Integration Configuration
 * ============================================================
 *
 * RESPONSABILIDAD:
 *
 * - centralizar la conexión con RC ORDERA;
 * - validar configuración de entorno;
 * - mantener IDs estables por restaurante;
 * - construir enlaces directos hacia RC ORDERA;
 * - impedir que configuración sensible se reparta por la app;
 * - permitir crecimiento multi-sede.
 *
 * IMPORTANTE:
 *
 * Este módulo está pensado para código ejecutado en servidor.
 * Nunca debe exponer claves privilegiadas al navegador.
 */


/* ============================================================
   TYPES
   ============================================================ */

export type RcOrderaLocationKey =
  | "czapelska"
  | "brzeska";


export interface RcOrderaServerConfig {
  readonly supabaseUrl:
    string;

  readonly anonKey:
    string;

  readonly timeoutMs:
    number;

  readonly publicAppUrl:
    string;
}


export interface RcOrderaIntegrationReadiness {
  readonly configured:
    boolean;

  readonly missing:
    readonly RcOrderaEnvironmentRequirement[];
}


export type RcOrderaEnvironmentRequirement =
  | "RC_ORDERA_SUPABASE_URL"
  | "RC_ORDERA_SUPABASE_ANON_KEY"
  | "CZAPELSKA_LOCATION_ID";


/* ============================================================
   CONSTANTS
   ============================================================ */

const RC_ORDERA_DEFAULT_APP_URL =
  "https://rincon-colombiano-pedidosapp.vercel.app";

const RC_ORDERA_CZAPELSKA_DEFAULT_RESTAURANT_ID =
  "9702bf42-2f50-46b2-8f8a-d5f80ba576d5";

const RC_ORDERA_DEFAULT_TIMEOUT_MS =
  8_000;


const RC_ORDERA_MIN_TIMEOUT_MS =
  1_000;


const RC_ORDERA_MAX_TIMEOUT_MS =
  30_000;


const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


/* ============================================================
   ENVIRONMENT
   ============================================================ */

function readEnvironmentVariable(
  name:
    string,
): string | null {
  const value =
    process.env[
      name
    ];

  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}


/* ============================================================
   URL NORMALIZATION
   ============================================================ */

function normalizeHttpOrigin(
  value:
    string,
): string | null {
  try {
    const url =
      new URL(
        value,
      );

    if (
      url.protocol !==
        "https:" &&
      url.protocol !==
        "http:"
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}


function normalizePublicAppUrl(
  value:
    string,
): string | null {
  try {
    const url =
      new URL(
        value,
      );

    if (
      url.protocol !==
        "https:" &&
      url.protocol !==
        "http:"
    ) {
      return null;
    }

    url.hash =
      "";

    return url
      .toString()
      .replace(
        /\/$/,
        "",
      );
  } catch {
    return null;
  }
}


/* ============================================================
   TIMEOUT
   ============================================================ */

function parseTimeout(
  rawValue:
    string | null,
): number {
  if (!rawValue) {
    return RC_ORDERA_DEFAULT_TIMEOUT_MS;
  }

  const parsed =
    Number.parseInt(
      rawValue,
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return RC_ORDERA_DEFAULT_TIMEOUT_MS;
  }

  return Math.min(
    RC_ORDERA_MAX_TIMEOUT_MS,
    Math.max(
      RC_ORDERA_MIN_TIMEOUT_MS,
      parsed,
    ),
  );
}


/* ============================================================
   PUBLIC APPLICATION
   ============================================================ */

export function getRcOrderaPublicAppUrl():
  string {
  const configured =
    readEnvironmentVariable(
      "RC_ORDERA_PUBLIC_APP_URL",
    ) ??
    readEnvironmentVariable(
      "NEXT_PUBLIC_ORDER_APP_URL",
    );

  if (!configured) {
    return RC_ORDERA_DEFAULT_APP_URL;
  }

  return (
    normalizePublicAppUrl(
      configured,
    ) ??
    RC_ORDERA_DEFAULT_APP_URL
  );
}


/* ============================================================
   RESTAURANT IDS
   ============================================================ */

export function getRcOrderaRestaurantId(
  location:
    RcOrderaLocationKey,
): string | null {
  const environmentVariable =
    location ===
    "czapelska"
      ? "CZAPELSKA_LOCATION_ID"
      : "BRZESKA_LOCATION_ID";

  const configuredValue =
    readEnvironmentVariable(
      environmentVariable,
    );

  if (
    configuredValue &&
    UUID_PATTERN.test(
      configuredValue,
    )
  ) {
    return configuredValue;
  }

  /*
   * Czapelska 33 es actualmente la sede pública
   * principal de Rincón Colombiano.
   *
   * Su UUID no es un secreto y constituye parte
   * de la URL pública de RC ORDERA.
   *
   * Mantener este fallback evita que una variable
   * de entorno ausente provoque que los clientes
   * lleguen a RC ORDERA sin restaurante seleccionado.
   */
  if (
    location ===
    "czapelska"
  ) {
    return RC_ORDERA_CZAPELSKA_DEFAULT_RESTAURANT_ID;
  }

  /*
   * Brzeska permanece sin fallback mientras no
   * esté abierta y configurada oficialmente.
   */
  return null;
}
/* ============================================================
   SERVER CONNECTION
   ============================================================ */

export function getRcOrderaServerConfig():
  RcOrderaServerConfig | null {
  const rawSupabaseUrl =
    readEnvironmentVariable(
      "RC_ORDERA_SUPABASE_URL",
    );

  const anonKey =
    readEnvironmentVariable(
      "RC_ORDERA_SUPABASE_ANON_KEY",
    );

  if (
    !rawSupabaseUrl ||
    !anonKey
  ) {
    return null;
  }

  const supabaseUrl =
    normalizeHttpOrigin(
      rawSupabaseUrl,
    );

  if (!supabaseUrl) {
    return null;
  }

  if (
    anonKey.length <
    20
  ) {
    return null;
  }

  return {
    supabaseUrl,
    anonKey,

    timeoutMs:
      parseTimeout(
        readEnvironmentVariable(
          "RC_ORDERA_API_TIMEOUT_MS",
        ),
      ),

    publicAppUrl:
      getRcOrderaPublicAppUrl(),
  };
}


/* ============================================================
   DIRECT ORDER URL
   ============================================================ */

/**
 * Construye el enlace directo al menú público de RC ORDERA
 * para una sede concreta.
 *
 * Ejemplo:
 *
 * https://...vercel.app/cliente.html?store=<restaurant_user_id>&app=v91.0.4
 *
 * Czapelska dispone de un UUID público de respaldo para evitar
 * que una configuración de entorno incompleta envíe al cliente
 * a RC ORDERA sin restaurante seleccionado.
 *
 * Las sedes que todavía no tengan un restaurant_user_id
 * configurado no reciben un identificador inventado.
 */
export function buildRcOrderaOrderUrl(
  location:
    RcOrderaLocationKey,
): string {
  const url =
    new URL(
      getRcOrderaPublicAppUrl(),
    );

  /*
   * El cliente debe aterrizar directamente
   * en la interfaz pública de menú de RC ORDERA.
   *
   * Nunca enviamos al usuario a la portada
   * genérica de la aplicación.
   */
  url.pathname =
    "/cliente.html";

  /*
   * Eliminamos parámetros anteriores para evitar
   * enlaces duplicados o inconsistentes.
   */
  url.search =
    "";

  const restaurantId =
    getRcOrderaRestaurantId(
      location,
    );

  if (restaurantId) {
    url.searchParams.set(
      "store",
      restaurantId,
    );
  }

  /*
   * Versión actual del cliente RC ORDERA.
   *
   * Mantiene coherencia con la versión pública
   * actualmente desplegada.
   */
  url.searchParams.set(
    "app",
    "v91.0.4",
  );

  return url.toString();
}

/* ============================================================
   READINESS
   ============================================================ */

export function getRcOrderaIntegrationReadiness():
  RcOrderaIntegrationReadiness {
  const missing:
    RcOrderaEnvironmentRequirement[] =
    [];

  if (
    !readEnvironmentVariable(
      "RC_ORDERA_SUPABASE_URL",
    )
  ) {
    missing.push(
      "RC_ORDERA_SUPABASE_URL",
    );
  }

  if (
    !readEnvironmentVariable(
      "RC_ORDERA_SUPABASE_ANON_KEY",
    )
  ) {
    missing.push(
      "RC_ORDERA_SUPABASE_ANON_KEY",
    );
  }

  if (
    !getRcOrderaRestaurantId(
      "czapelska",
    )
  ) {
    missing.push(
      "CZAPELSKA_LOCATION_ID",
    );
  }

  return {
    configured:
      missing.length ===
      0,

    missing,
  };
}


/* ============================================================
   STATUS
   ============================================================ */

export function isRcOrderaConfigured():
  boolean {
  return (
    getRcOrderaServerConfig() !==
      null &&
    getRcOrderaRestaurantId(
      "czapelska",
    ) !== null
  );
}
