
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
  readonly instagram:
    string | undefined;

  readonly facebook:
    string | undefined;

  readonly tiktok:
    string | undefined;
}


export interface ContactConfig {
  readonly phone:
    string | undefined;

  readonly whatsapp:
    string | undefined;

  readonly email:
    string | undefined;
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

  readonly orderAppUrl:
    string | undefined;

  readonly googleBusinessProfileUrl:
    string | undefined;

  readonly googleSiteVerification:
    string | undefined;
}


/* ============================================================
   CONSTANTS
   ============================================================ */

const DEFAULT_SITE_URL =
  "http://localhost:3000";

const PRODUCTION_SITE_URL =
  "https://rinconcolombiano.pl";

/** Enlaces oficiales publicados por Rincón Colombiano. */
export const OFFICIAL_SOCIAL_LINKS = {
  whatsapp: "https://wa.me/message/OWMYNNNTJEIFF1",
  instagram: "https://www.instagram.com/rinconcolombiano.pl",
  tiktok: "https://www.tiktok.com/@rinconcolombiano.pl",
  facebook: "https://www.facebook.com/share/1CdzPbwFAu/",
} as const;

/**
 * Acepta únicamente URLs HTTPS y de los dominios oficiales.
 * Si la variable pública está vacía o mal configurada, recupera el
 * enlace oficial para no mostrar botones sin destino ni esquemas inseguros.
 */
function officialSocialUrl(
  value: string | undefined,
  fallback: string,
  allowedHosts: readonly string[],
): string {
  const candidate = value?.trim();

  if (!candidate) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate);

    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      !allowedHosts.includes(parsed.hostname.toLowerCase())
    ) {
      return fallback;
    }

    return parsed.toString();
  } catch {
    return fallback;
  }
}

/** Puede ser un teléfono internacional o una URL https://wa.me/. */
function whatsappContactUrl(value: string | undefined): string {
  const candidate = value?.trim();

  if (!candidate) {
    return OFFICIAL_SOCIAL_LINKS.whatsapp;
  }

  if (/^\+?[0-9\s()-]+$/.test(candidate)) {
    const digits = candidate.replace(/\D/g, "");

    return digits.length >= 8 && digits.length <= 15
      ? `https://wa.me/${digits}`
      : OFFICIAL_SOCIAL_LINKS.whatsapp;
  }

  return officialSocialUrl(
    candidate,
    OFFICIAL_SOCIAL_LINKS.whatsapp,
    ["wa.me", "api.whatsapp.com"],
  );
}


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
    process.env[
      "NEXT_PUBLIC_APP_ENV"
    ],
  );


const siteUrl =
  normalizeUrl(
    process.env[
      "NEXT_PUBLIC_SITE_URL"
    ],

    environment ===
      "production"
      ? PRODUCTION_SITE_URL
      : DEFAULT_SITE_URL,
  );


export const siteConfig:
  SiteConfig = {

  name:
    "Rincón Colombiano",

  shortName:
    "Rincón",

  legalCountry:
    "Poland",

  description:
    "Autentyczna kuchnia kolumbijska w Warszawie. Menu, zamówienia online, dostawa, odbiór osobisty, catering i lokale Rincón Colombiano.",

  url:
    siteUrl,

  environment,

  defaultLocale:
    parseDefaultLocale(
      process.env[
        "NEXT_PUBLIC_DEFAULT_LOCALE"
      ],
    ),

  locales:
    supportedLocales,


  /* ========================================================
     CONTACT
     ======================================================== */

  contact: {
    phone:
      optionalString(
        process.env[
          "NEXT_PUBLIC_CONTACT_PHONE"
        ],
      ),

    whatsapp:
      whatsappContactUrl(
        process.env[
          "NEXT_PUBLIC_WHATSAPP_PHONE"
        ],
      ),

    email:
      optionalString(
        process.env[
          "NEXT_PUBLIC_CONTACT_EMAIL"
        ],
      ),
  },


  /* ========================================================
     SOCIAL
     ======================================================== */

  social: {
    instagram:
      officialSocialUrl(
        process.env[
          "NEXT_PUBLIC_INSTAGRAM_URL"
        ],
        OFFICIAL_SOCIAL_LINKS.instagram,
        ["instagram.com", "www.instagram.com"],
      ),

    facebook:
      officialSocialUrl(
        process.env[
          "NEXT_PUBLIC_FACEBOOK_URL"
        ],
        OFFICIAL_SOCIAL_LINKS.facebook,
        ["facebook.com", "www.facebook.com", "m.facebook.com"],
      ),

    tiktok:
      officialSocialUrl(
        process.env[
          "NEXT_PUBLIC_TIKTOK_URL"
        ],
        OFFICIAL_SOCIAL_LINKS.tiktok,
        ["tiktok.com", "www.tiktok.com", "m.tiktok.com"],
      ),
  },


  /* ========================================================
     FEATURE FLAGS
     ======================================================== */

  features: {
    menu:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_MENU"
        ],
        true,
      ),

    onlineOrdering:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_ONLINE_ORDERING"
        ],
        true,
      ),

    delivery:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_DELIVERY"
        ],
        true,
      ),

    pickup:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_PICKUP"
        ],
        true,
      ),

    reservations:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_RESERVATIONS"
        ],
        true,
      ),

    catering:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_CATERING"
        ],
        true,
      ),

    reviews:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_REVIEWS"
        ],
        true,
      ),

    locations:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_LOCATIONS"
        ],
        true,
      ),

    promotions:
      parsePublicBoolean(
        process.env[
          "NEXT_PUBLIC_FEATURE_PROMOTIONS"
        ],
        true,
      ),
  },


  /* ========================================================
     EXTERNAL PUBLIC SERVICES
     ======================================================== */

  orderAppUrl:
    optionalString(
      process.env[
        "NEXT_PUBLIC_ORDER_APP_URL"
      ],
    ),

  googleBusinessProfileUrl:
    optionalString(
      process.env[
        "NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL"
      ],
    ),

  googleSiteVerification:
    optionalString(
      process.env[
        "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"
      ],
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
