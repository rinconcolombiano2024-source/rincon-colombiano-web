/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Internationalization Configuration
 * ============================================================
 *
 * Fuente central de configuración i18n.
 *
 * Idiomas iniciales:
 *
 * - Polski
 * - Español
 * - English
 *
 * OBJETIVOS:
 *
 * - URLs localizadas
 * - SEO hreflang
 * - navegación
 * - App Router
 * - selección de idioma
 * - detección segura
 * - formateo Intl
 * - expansión futura
 *
 * PRINCIPIOS:
 *
 * 1. PL es el idioma principal inicial.
 * 2. URLs públicas usan prefijo:
 *
 *    /pl
 *    /es
 *    /en
 *
 * 3. No generar contenido diferente
 *    según Accept-Language en la misma URL.
 *
 * 4. Cada idioma tiene URL estable.
 *
 * 5. SEO y navegación utilizan exactamente
 *    los mismos códigos de locale.
 *
 * 6. Las redirecciones automáticas no deben
 *    impedir a Google rastrear cada idioma.
 */

import type {
  SupportedLocale,
} from "@/config/site";


/* ============================================================
   SUPPORTED LOCALES
   ============================================================ */

export const SUPPORTED_LOCALES =
  [
    "pl",
    "es",
    "en",
  ] as const satisfies
    readonly SupportedLocale[];


/* ============================================================
   DEFAULT LOCALE
   ============================================================ */

export const DEFAULT_LOCALE:
  SupportedLocale =
  "pl";


/* ============================================================
   LOCALE TYPE
   ============================================================ */

export type AppLocale =
  (
    typeof SUPPORTED_LOCALES
  )[number];


/* ============================================================
   LOCALE PREFIX MODE
   ============================================================ */

export const LOCALE_PREFIX_MODE =
  "always" as const;


/* ============================================================
   COOKIE
   ============================================================ */

/**
 * Guarda solamente la preferencia de idioma.
 *
 * No es una cookie de marketing.
 */
export const LOCALE_COOKIE_NAME =
  "rc_locale";


/* ============================================================
   LOCALE CONFIGURATION
   ============================================================ */

export interface LocaleDefinition {
  readonly code:
    AppLocale;

  /**
   * BCP 47 language tag.
   */
  readonly languageTag:
    string;

  /**
   * Locale utilizado por Intl.
   */
  readonly intlLocale:
    string;

  /**
   * Locale Open Graph.
   */
  readonly openGraphLocale:
    string;

  readonly htmlLang:
    string;

  readonly direction:
    "ltr" | "rtl";

  readonly nativeName:
    string;

  readonly displayName:
    string;

  readonly countryLabel:
    string;

  readonly currency:
    string;

  readonly active:
    boolean;

  readonly default:
    boolean;
}


/* ============================================================
   LOCALE DEFINITIONS
   ============================================================ */

export const localeDefinitions:
  Readonly<
    Record<
      AppLocale,
      LocaleDefinition
    >
  > = {

  pl: {
    code:
      "pl",

    languageTag:
      "pl-PL",

    intlLocale:
      "pl-PL",

    openGraphLocale:
      "pl_PL",

    htmlLang:
      "pl",

    direction:
      "ltr",

    nativeName:
      "Polski",

    displayName:
      "Polish",

    countryLabel:
      "Polska",

    currency:
      "PLN",

    active:
      true,

    default:
      true,
  },


  es: {
    code:
      "es",

    languageTag:
      "es",

    intlLocale:
      "es-ES",

    openGraphLocale:
      "es_ES",

    htmlLang:
      "es",

    direction:
      "ltr",

    nativeName:
      "Español",

    displayName:
      "Spanish",

    countryLabel:
      "España / Latinoamérica",

    currency:
      "PLN",

    active:
      true,

    default:
      false,
  },


  en: {
    code:
      "en",

    languageTag:
      "en",

    intlLocale:
      "en-GB",

    openGraphLocale:
      "en_GB",

    htmlLang:
      "en",

    direction:
      "ltr",

    nativeName:
      "English",

    displayName:
      "English",

    countryLabel:
      "International",

    currency:
      "PLN",

    active:
      true,

    default:
      false,
  },
};


/* ============================================================
   LOCALE ALIASES
   ============================================================ */

/**
 * Utilizado para interpretar:
 *
 * pl-PL
 * es-CO
 * es-ES
 * en-US
 * en-GB
 *
 * y convertirlos al locale interno.
 */

const localeAliases:
  Readonly<
    Record<
      string,
      AppLocale
    >
  > = {

  pl:
    "pl",

  "pl-pl":
    "pl",

  es:
    "es",

  "es-es":
    "es",

  "es-co":
    "es",

  "es-mx":
    "es",

  "es-ar":
    "es",

  en:
    "en",

  "en-us":
    "en",

  "en-gb":
    "en",

  "en-ca":
    "en",

  "en-au":
    "en",
};


/* ============================================================
   IS SUPPORTED LOCALE
   ============================================================ */

export function isSupportedLocale(
  value:
    string | null | undefined,
): value is AppLocale {
  if (!value) {
    return false;
  }

  return (
    SUPPORTED_LOCALES as
      readonly string[]
  ).includes(
    value,
  );
}


/* ============================================================
   NORMALIZE LOCALE
   ============================================================ */

export function normalizeLocale(
  value:
    string | null | undefined,
): AppLocale | null {
  if (!value) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        "_",
        "-",
      );

  if (
    isSupportedLocale(
      normalized,
    )
  ) {
    return normalized;
  }

  const alias =
    localeAliases[
      normalized
    ];

  if (alias) {
    return alias;
  }

  const languageCode =
    normalized
      .split("-")[0];

  if (
    languageCode &&
    isSupportedLocale(
      languageCode,
    )
  ) {
    return languageCode;
  }

  return null;
}


/* ============================================================
   GET LOCALE DEFINITION
   ============================================================ */

export function getLocaleDefinition(
  locale:
    AppLocale,
): LocaleDefinition {
  return (
    localeDefinitions[
      locale
    ]
  );
}


/* ============================================================
   GET ACTIVE LOCALES
   ============================================================ */

export function getActiveLocales():
  readonly AppLocale[] {
  return SUPPORTED_LOCALES.filter(
    (locale) =>
      localeDefinitions[
        locale
      ].active,
  );
}


/* ============================================================
   DEFAULT FALLBACK
   ============================================================ */

export function resolveLocaleOrDefault(
  value:
    string | null | undefined,
): AppLocale {
  return (
    normalizeLocale(
      value,
    ) ??
    DEFAULT_LOCALE
  );
}


/* ============================================================
   PATHNAME SEGMENTS
   ============================================================ */

function getPathSegments(
  pathname:
    string,
): readonly string[] {
  return pathname
    .split("/")
    .filter(Boolean);
}


/* ============================================================
   GET LOCALE FROM PATHNAME
   ============================================================ */

export function getLocaleFromPathname(
  pathname:
    string,
): AppLocale | null {
  const firstSegment =
    getPathSegments(
      pathname,
    )[0];

  if (!firstSegment) {
    return null;
  }

  return normalizeLocale(
    firstSegment,
  );
}


/* ============================================================
   HAS LOCALE PREFIX
   ============================================================ */

export function hasLocalePrefix(
  pathname:
    string,
): boolean {
  return (
    getLocaleFromPathname(
      pathname,
    ) !== null
  );
}


/* ============================================================
   STRIP LOCALE PREFIX
   ============================================================ */

export function stripLocalePrefix(
  pathname:
    string,
): string {
  const segments =
    getPathSegments(
      pathname,
    );

  if (
    segments.length === 0
  ) {
    return "/";
  }

  const firstSegment =
    segments[0];

  if (
    firstSegment &&
    normalizeLocale(
      firstSegment,
    )
  ) {
    const remaining =
      segments.slice(
        1,
      );

    return remaining.length ===
      0
      ? "/"
      : `/${remaining.join("/")}`;
  }

  return (
    `/${segments.join("/")}`
  );
}


/* ============================================================
   ADD LOCALE PREFIX
   ============================================================ */

export function addLocalePrefix(
  pathname:
    string,
  locale:
    AppLocale,
): string {
  const pathWithoutLocale =
    stripLocalePrefix(
      pathname,
    );

  if (
    pathWithoutLocale === "/"
  ) {
    return `/${locale}/`;
  }

  return (
    `/${locale}${pathWithoutLocale}`
  );
}


/* ============================================================
   REPLACE LOCALE PREFIX
   ============================================================ */

export function replaceLocalePrefix(
  pathname:
    string,
  locale:
    AppLocale,
): string {
  return addLocalePrefix(
    pathname,
    locale,
  );
}


/* ============================================================
   BUILD LANGUAGE SWITCHER PATHS
   ============================================================ */

export function buildLanguageSwitcherPaths(
  pathname:
    string,
): Readonly<
  Record<
    AppLocale,
    string
  >
> {
  const pathWithoutLocale =
    stripLocalePrefix(
      pathname,
    );

  return {
    pl:
      addLocalePrefix(
        pathWithoutLocale,
        "pl",
      ),

    es:
      addLocalePrefix(
        pathWithoutLocale,
        "es",
      ),

    en:
      addLocalePrefix(
        pathWithoutLocale,
        "en",
      ),
  };
}


/* ============================================================
   ACCEPT-LANGUAGE PARSING
   ============================================================ */

interface ParsedLanguagePreference {
  readonly language:
    string;

  readonly quality:
    number;

  readonly order:
    number;
}


/**
 * Parser deliberadamente pequeño.
 *
 * Ejemplo:
 *
 * pl-PL,pl;q=0.9,en;q=0.8
 */
function parseAcceptLanguage(
  header:
    string,
): readonly ParsedLanguagePreference[] {
  return header
    .split(",")
    .map(
      (
        rawPart,
        index,
      ): ParsedLanguagePreference | null => {
        const parts =
          rawPart
            .trim()
            .split(";");

        const language =
          parts[0]
            ?.trim();

        if (!language) {
          return null;
        }

        const qualityPart =
          parts.find(
            (part) =>
              part
                .trim()
                .startsWith(
                  "q=",
                ),
          );

        const parsedQuality =
          qualityPart
            ? Number.parseFloat(
                qualityPart
                  .trim()
                  .slice(
                    2,
                  ),
              )
            : 1;

        const quality =
          Number.isFinite(
            parsedQuality,
          )
            ? Math.max(
                0,
                Math.min(
                  parsedQuality,
                  1,
                ),
              )
            : 0;

        return {
          language,

          quality,

          order:
            index,
        };
      },
    )
    .filter(
      (
        preference,
      ): preference is ParsedLanguagePreference =>
        preference !==
        null,
    )
    .sort(
      (
        left,
        right,
      ) => {
        if (
          right.quality !==
          left.quality
        ) {
          return (
            right.quality -
            left.quality
          );
        }

        return (
          left.order -
          right.order
        );
      },
    );
}


/* ============================================================
   RESOLVE ACCEPT-LANGUAGE
   ============================================================ */

export function resolveLocaleFromAcceptLanguage(
  header:
    string | null | undefined,
): AppLocale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const preferences =
    parseAcceptLanguage(
      header,
    );

  for (
    const preference
    of preferences
  ) {
    if (
      preference.language ===
      "*"
    ) {
      continue;
    }

    const locale =
      normalizeLocale(
        preference.language,
      );

    if (locale) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}


/* ============================================================
   LOCALE COOKIE VALIDATION
   ============================================================ */

export function resolveLocaleFromCookie(
  value:
    string | null | undefined,
): AppLocale | null {
  return normalizeLocale(
    value,
  );
}


/* ============================================================
   RESOLVE PREFERRED LOCALE
   ============================================================ */

/**
 * Prioridad:
 *
 * 1. locale explícito de URL
 * 2. cookie del usuario
 * 3. Accept-Language
 * 4. PL
 *
 * IMPORTANTE:
 *
 * La URL siempre gana.
 */

export function resolvePreferredLocale(
  input: {
    readonly pathname?:
      string;

    readonly cookieLocale?:
      string | null;

    readonly acceptLanguage?:
      string | null;
  },
): AppLocale {
  if (
    input.pathname
  ) {
    const pathnameLocale =
      getLocaleFromPathname(
        input.pathname,
      );

    if (
      pathnameLocale
    ) {
      return pathnameLocale;
    }
  }

  const cookieLocale =
    resolveLocaleFromCookie(
      input.cookieLocale,
    );

  if (
    cookieLocale
  ) {
    return cookieLocale;
  }

  return resolveLocaleFromAcceptLanguage(
    input.acceptLanguage,
  );
}


/* ============================================================
   INTL
   ============================================================ */

export function getIntlLocale(
  locale:
    AppLocale,
): string {
  return (
    localeDefinitions[
      locale
    ].intlLocale
  );
}


/* ============================================================
   HTML LANG
   ============================================================ */

export function getHtmlLang(
  locale:
    AppLocale,
): string {
  return (
    localeDefinitions[
      locale
    ].htmlLang
  );
}


/* ============================================================
   TEXT DIRECTION
   ============================================================ */

export function getTextDirection(
  locale:
    AppLocale,
): "ltr" | "rtl" {
  return (
    localeDefinitions[
      locale
    ].direction
  );
}


/* ============================================================
   BCP47 LANGUAGE TAG
   ============================================================ */

export function getLanguageTag(
  locale:
    AppLocale,
): string {
  return (
    localeDefinitions[
      locale
    ].languageTag
  );
}


/* ============================================================
   OPEN GRAPH LOCALE
   ============================================================ */

export function getOpenGraphLocale(
  locale:
    AppLocale,
): string {
  return (
    localeDefinitions[
      locale
    ].openGraphLocale
  );
}


/* ============================================================
   NUMBER FORMATTER
   ============================================================ */

export function createNumberFormatter(
  locale:
    AppLocale,
  options?:
    Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return new Intl.NumberFormat(
    getIntlLocale(
      locale,
    ),
    options,
  );
}


/* ============================================================
   CURRENCY FORMATTER
   ============================================================ */

export function createCurrencyFormatter(
  locale:
    AppLocale,
  currency = "PLN",
): Intl.NumberFormat {
  return new Intl.NumberFormat(
    getIntlLocale(
      locale,
    ),
    {
      style:
        "currency",

      currency,
    },
  );
}


/* ============================================================
   DATE FORMATTER
   ============================================================ */

export function createDateFormatter(
  locale:
    AppLocale,
  options?:
    Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(
    getIntlLocale(
      locale,
    ),
    options,
  );
}


/* ============================================================
   ROOT CONFIG
   ============================================================ */

export const i18nConfig = {
  defaultLocale:
    DEFAULT_LOCALE,

  supportedLocales:
    SUPPORTED_LOCALES,

  localePrefix:
    LOCALE_PREFIX_MODE,

  cookieName:
    LOCALE_COOKIE_NAME,

  locales:
    localeDefinitions,
} as const;
