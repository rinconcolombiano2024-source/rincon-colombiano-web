/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Site Configuration
 * ============================================================
 *
 * Fuente central de configuración pública de la aplicación.
 *
 * Este archivo puede ser utilizado tanto por Server Components
 * como por Client Components.
 *
 * REGLA DE SEGURIDAD:
 * Aquí únicamente pueden utilizarse variables NEXT_PUBLIC_*.
 *
 * NUNCA importar:
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RC_ORDERA_API_KEY
 * - RESEND_API_KEY
 * - WEBHOOK_SECRET
 * - claves privadas
 * - secretos internos
 */


/* ============================================================
   TYPES
   ============================================================ */

export type SupportedLocale =
  | "pl"
  | "es"
  | "en";

export type Environment =
  | "development"
  | "preview"
  | "production";

export interface LocaleConfig {
  readonly code: SupportedLocale;
  readonly label: string;
  readonly nativeLabel: string;
  readonly htmlLang: string;
  readonly hreflang: string;
  readonly flag: string;
}

export interface SocialConfig {
  readonly instagram?: string;
  readonly facebook?: string;
  readonly tiktok?: string;
}

export interface ContactConfig {
  readonly phone?: string;
  readonly whatsapp?: string;
  readonly email?: string;
}

export interface FeatureFlags {
  readonly menu: boolean;
  readonly onlineOrdering: boolean;
  readonly delivery: boolean;
  readonly pickup: boolean;
  readonly reservations: boolean;
  readonly catering: boolean;
  readonly reviews: boolean;
  readonly locations: boolean;
  readonly promotions: boolean;
}

export interface SiteConfig {
  readonly name: string;
  readonly shortName: string;
  readonly legalCountry: string;

  readonly description: string;

  readonly url: string;

  readonly environment: Environment;

  readonly defaultLocale: SupportedLocale;

  readonly locales: readonly LocaleConfig[];

  readonly contact: ContactConfig;

  readonly social: SocialConfig;

  readonly features: FeatureFlags;

  readonly orderAppUrl?: string;

  readonly googleBusinessProfileUrl?: string;

  readonly googleSiteVerification?: string;
}


/* ============================================================
   CONSTANTS
   ============================================================ */

const DEFAULT_SITE_URL =
  "http://localhost:3000";

const PRODUCTION_SITE_URL =
  "https://rinconcolombiano.pl";


/* ============================================================
   ENVIRONMENT HELPERS
   ============================================================ */

/**
 * Convierte una variable de entorno pública en boolean.
 *
 * Únicamente acepta explícitamente:
 *
 * true
 * false
 *
 * Cualquier otro valor usa el fallback.
 */
function parsePublicBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}


/**
 * Normaliza URLs públicas.
 *
 * Evitamos:
 *
 * https://rinconcolombiano.pl/
 *
 * mezclado con:
 *
 * https://rinconcolombiano.pl
 *
 * dentro del sistema.
 */
function normalizeUrl(
  value: string | undefined,
  fallback: string,
): string {
  const candidate =
    value?.trim() || fallback;

  try {
    const url = new URL(candidate);

    return url
      .toString()
      .replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/$/, "");
  }
}


/**
 * Limpia strings públicos opcionales.
 */
function optionalString(
  value: string | undefined,
): string | undefined {
  const cleaned = value?.trim();

  return cleaned
    ? cleaned
    : undefined;
}


/**
 * Valida el entorno público.
 */
function parseEnvironment(
  value: string | undefined,
): Environment {
  switch (value) {
    case "production":
    case "preview":
    case "development":
      return value;

    default:
      return "development";
  }
}


/**
 * Valida locale principal.
 */
function parseDefaultLocale(
  value: string | undefined,
): SupportedLocale {
  switch (value) {
    case "pl":
    case "es":
    case "en":
      return value;

    default:
      return "pl";
  }
}


/* ============================================================
   LOCALES
   ============================================================ */

export const supportedLocales =
  [
    {
      code: "pl",
      label: "Polish",
      nativeLabel: "Polski",
      htmlLang: "pl",
      hreflang: "pl-PL",
      flag: "🇵🇱",
    },

    {
      code: "es",
      label: "Spanish",
      nativeLabel: "Español",
      htmlLang: "es",
      hreflang: "es",
      flag: "🇨🇴",
    },

    {
      code: "en",
      label: "English",
      nativeLabel: "English",
      htmlLang: "en",
      hreflang: "en",
      flag: "🇬🇧",
    },
  ] as const satisfies readonly LocaleConfig[];


/* ============================================================
   PUBLIC SITE CONFIG
   ============================================================ */

const environment =
  parseEnvironment(
    process.env.NEXT_PUBLIC_APP_ENV,
  );

const siteUrl =
  normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    environment === "production"
      ? PRODUCTION_SITE_URL
      : DEFAULT_SITE_URL,
  );


export const siteConfig: SiteConfig = {
  name: "Rincón Colombiano",

  shortName: "Rincón",

  legalCountry: "Poland",

  description:
    "Autentyczna kuchnia kolumbijska w Warszawie. Menu, zamówienia online, dostawa, odbiór osobisty, catering i lokale Rincón Colombiano.",

  url: siteUrl,

  environment,

  defaultLocale:
    parseDefaultLocale(
      process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    ),

  locales: supportedLocales,

  contact: {
    phone:
      optionalString(
        process.env.NEXT_PUBLIC_CONTACT_PHONE,
      ),

    whatsapp:
      optionalString(
        process.env.NEXT_PUBLIC_WHATSAPP_PHONE,
      ),

    email:
      optionalString(
        process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      ),
  },

  social: {
    instagram:
      optionalString(
        process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      ),

    facebook:
      optionalString(
        process.env.NEXT_PUBLIC_FACEBOOK_URL,
      ),

    tiktok:
      optionalString(
        process.env.NEXT_PUBLIC_TIKTOK_URL,
      ),
  },

  features: {
    menu:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_MENU,
        true,
      ),

    onlineOrdering:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_ONLINE_ORDERING,
        true,
      ),

    delivery:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_DELIVERY,
        true,
      ),

    pickup:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_PICKUP,
        true,
      ),

    reservations:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_RESERVATIONS,
        true,
      ),

    catering:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_CATERING,
        true,
      ),

    reviews:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_REVIEWS,
        true,
      ),

    locations:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_LOCATIONS,
        true,
      ),

    promotions:
      parsePublicBoolean(
        process.env.NEXT_PUBLIC_FEATURE_PROMOTIONS,
        true,
      ),
  },

  orderAppUrl:
    optionalString(
      process.env.NEXT_PUBLIC_ORDER_APP_URL,
    ),

  googleBusinessProfileUrl:
    optionalString(
      process.env
        .NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL,
    ),

  googleSiteVerification:
    optionalString(
      process.env
        .NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ),
};


/* ============================================================
   DERIVED HELPERS
   ============================================================ */

/**
 * URL absoluta a partir de una ruta interna.
 *
 * Ejemplo:
 *
 * getAbsoluteUrl("/menu")
 *
 * =>
 *
 * https://rinconcolombiano.pl/menu
 */
export function getAbsoluteUrl(
  path = "/",
): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${siteConfig.url}${normalizedPath}`;
}


/**
 * Devuelve configuración de idioma.
 */
export function getLocaleConfig(
  locale: SupportedLocale,
): LocaleConfig {
  const localeConfig =
    supportedLocales.find(
      (item) => item.code === locale,
    );

  if (!localeConfig) {
    throw new Error(
      `Unsupported locale: ${locale}`,
    );
  }

  return localeConfig;
}


/**
 * Comprueba de forma segura si un código de idioma
 * está soportado.
 */
export function isSupportedLocale(
  value: string,
): value is SupportedLocale {
  return supportedLocales.some(
    (locale) => locale.code === value,
  );
}
