/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Central SEO Configuration
 * ============================================================
 *
 * Responsabilidades:
 * - Metadata reutilizable.
 * - Canonical URLs.
 * - hreflang / idiomas alternativos.
 * - Open Graph.
 * - Twitter / social previews.
 * - Robots / indexación.
 * - SEO por restaurante.
 * - Protección contra indexación de previews.
 *
 * REGLAS:
 * - Development NO se indexa.
 * - Preview NO se indexa.
 * - Solo production puede indexarse.
 * - Las URLs canónicas siempre deben ser absolutas.
 */

import type {
  Metadata,
} from "next";

import type {
  RestaurantConfig,
} from "@/config/restaurants";

import {
  siteConfig,
  supportedLocales,
  type SupportedLocale,
} from "@/config/site";


/* ============================================================
   TYPES
   ============================================================ */

export type SeoContentType =
  | "website"
  | "article";

export interface SeoImage {
  readonly url: string;
  readonly alt: string;

  readonly width?: number;
  readonly height?: number;
}

export interface PageSeoInput {
  readonly title: string;

  readonly description: string;

  /**
   * Ruta sin dominio.
   *
   * Ejemplo:
   *
   * /menu
   * /lokale/czapelska
   */
  readonly path: string;

  readonly locale?: SupportedLocale;

  /**
   * Cuando true:
   * el título ya contiene la marca y no debe recibir
   * el template global.
   */
  readonly absoluteTitle?: boolean;

  /**
   * Fuerza noindex incluso en producción.
   */
  readonly noIndex?: boolean;

  readonly type?: SeoContentType;

  readonly images?: readonly SeoImage[];

  /**
   * Permite rutas diferentes según idioma.
   *
   * Esto será útil si posteriormente decidimos:
   *
   * /pl/o-nas
   * /es/nosotros
   * /en/about
   */
  readonly alternatePaths?: Partial<
    Record<SupportedLocale, string>
  >;
}


/* ============================================================
   GLOBAL SEO CONSTANTS
   ============================================================ */

export const seoConfig = {
  brandName:
    siteConfig.name,

  defaultTitle:
    "Rincón Colombiano | Restauracja kolumbijska Warszawa",

  defaultDescription:
    "Autentyczna kuchnia kolumbijska w Warszawie. Menu, zamówienia online, dostawa, odbiór osobisty, catering i lokale Rincón Colombiano.",

  defaultLocale:
    siteConfig.defaultLocale,

  city:
    "Warszawa",

  country:
    "Polska",

  countryCode:
    "PL",

  cuisine:
    "Colombian",

  /**
   * Producción es el único entorno indexable.
   */
  indexingEnabled:
    siteConfig.environment ===
    "production",
} as const;


/* ============================================================
   LOCALE MAPS
   ============================================================ */

const openGraphLocales: Readonly<
  Record<SupportedLocale, string>
> = {
  pl: "pl_PL",
  es: "es_CO",
  en: "en_GB",
};


/* ============================================================
   PATH HELPERS
   ============================================================ */

function normalizePath(
  path: string,
): string {
  const trimmed =
    path.trim();

  if (
    trimmed === "" ||
    trimmed === "/"
  ) {
    return "/";
  }

  const withLeadingSlash =
    trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

  return withLeadingSlash.replace(
    /\/+$/,
    "",
  );
}


/**
 * Construye la URL pública absoluta.
 */
export function buildCanonicalUrl(
  path: string,
): string {
  const normalizedPath =
    normalizePath(path);

  if (
    normalizedPath === "/"
  ) {
    return siteConfig.url;
  }

  return `${siteConfig.url}${normalizedPath}`;
}


/**
 * Arquitectura prevista para idiomas:
 *
 * /pl
 * /es
 * /en
 *
 * y posteriormente:
 *
 * /pl/menu
 * /es/menu
 * /en/menu
 */
export function buildLocalizedPath(
  locale: SupportedLocale,
  path: string,
): string {
  const normalizedPath =
    normalizePath(path);

  if (
    normalizedPath === "/"
  ) {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}


/**
 * URL absoluta localizada.
 */
export function buildLocalizedUrl(
  locale: SupportedLocale,
  path: string,
): string {
  return buildCanonicalUrl(
    buildLocalizedPath(
      locale,
      path,
    ),
  );
}


/* ============================================================
   IMAGE HELPERS
   ============================================================ */

function buildAbsoluteAssetUrl(
  url: string,
): string {
  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return buildCanonicalUrl(url);
}


function mapOpenGraphImages(
  images:
    | readonly SeoImage[]
    | undefined,
) {
  if (
    !images ||
    images.length === 0
  ) {
    return undefined;
  }

  return images.map(
    (image) => ({
      url:
        buildAbsoluteAssetUrl(
          image.url,
        ),

      alt:
        image.alt,

      ...(typeof image.width ===
      "number"
        ? {
            width:
              image.width,
          }
        : {}),

      ...(typeof image.height ===
      "number"
        ? {
            height:
              image.height,
          }
        : {}),
    }),
  );
}


/* ============================================================
   LANGUAGE ALTERNATES
   ============================================================ */

function buildLanguageAlternates(
  basePath: string,
  alternatePaths:
    | Partial<
        Record<
          SupportedLocale,
          string
        >
      >
    | undefined,
): Readonly<Record<string, string>> {
  const languages:
    Record<string, string> = {};

  for (
    const localeConfig
    of supportedLocales
  ) {
    const locale =
      localeConfig.code;

    const localePath =
      alternatePaths?.[
        locale
      ] ?? basePath;

    languages[
      localeConfig.hreflang
    ] =
      buildLocalizedUrl(
        locale,
        localePath,
      );
  }

  /**
   * x-default apunta al idioma principal.
   */
  languages["x-default"] =
    buildLocalizedUrl(
      siteConfig.defaultLocale,
      alternatePaths?.[
        siteConfig.defaultLocale
      ] ?? basePath,
    );

  return languages;
}


/* ============================================================
   ROBOTS
   ============================================================ */

function buildRobotsMetadata(
  requestedNoIndex: boolean,
): Metadata["robots"] {
  const shouldIndex =
    seoConfig.indexingEnabled &&
    !requestedNoIndex;

  if (!shouldIndex) {
    return {
      index: false,
      follow: false,
      noarchive: true,

      googleBot: {
        index: false,
        follow: false,
        noarchive: true,
      },
    };
  }

  return {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  };
}


/* ============================================================
   PAGE METADATA FACTORY
   ============================================================ */

/**
 * Constructor estándar de metadata.
 *
 * Todas las páginas importantes deberían terminar utilizando
 * esta función o una capa especializada construida encima.
 */
export function buildPageMetadata(
  input: PageSeoInput,
): Metadata {
  const locale =
    input.locale ??
    siteConfig.defaultLocale;

  const canonicalPath =
    buildLocalizedPath(
      locale,
      input.path,
    );

  const canonicalUrl =
    buildCanonicalUrl(
      canonicalPath,
    );

  const fullTitle =
    input.absoluteTitle
      ? input.title
      : `${input.title} | ${siteConfig.name}`;

  const images =
    mapOpenGraphImages(
      input.images,
    );

  const alternateLanguages =
    buildLanguageAlternates(
      input.path,
      input.alternatePaths,
    );

  return {
    title:
      input.absoluteTitle
        ? {
            absolute:
              input.title,
          }
        : input.title,

    description:
      input.description,

    alternates: {
      canonical:
        canonicalUrl,

      languages:
        alternateLanguages,
    },

    robots:
      buildRobotsMetadata(
        input.noIndex ??
          false,
      ),

    openGraph: {
      type:
        input.type ??
        "website",

      title:
        fullTitle,

      description:
        input.description,

      url:
        canonicalUrl,

      siteName:
        siteConfig.name,

      locale:
        openGraphLocales[
          locale
        ],

      alternateLocale:
        supportedLocales
          .filter(
            (item) =>
              item.code !==
              locale,
          )
          .map(
            (item) =>
              openGraphLocales[
                item.code
              ],
          ),

      ...(images
        ? {
            images,
          }
        : {}),
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        fullTitle,

      description:
        input.description,

      ...(images
        ? {
            images:
              images.map(
                (image) =>
                  image.url,
              ),
          }
        : {}),
    },
  };
}


/* ============================================================
   RESTAURANT SEO
   ============================================================ */

/**
 * Metadata especializada para una sede.
 */
export function buildRestaurantMetadata(
  restaurant:
    RestaurantConfig,

  locale:
    SupportedLocale =
      siteConfig.defaultLocale,
): Metadata {
  return buildPageMetadata({
    title:
      restaurant.seo.title,

    description:
      restaurant.seo.description,

    path:
      `/lokale/${restaurant.slug}`,

    locale,

    absoluteTitle:
      true,

    /**
     * Una sede cerrada permanentemente no debería seguir
     * compitiendo normalmente en resultados de búsqueda.
     *
     * Si necesitamos conservar la URL histórica, podremos
     * cambiar posteriormente la estrategia a redirect/410.
     */
    noIndex:
      restaurant.status ===
      "closed",
  });
}


/* ============================================================
   COMMON PAGE HELPERS
   ============================================================ */

export function buildHomeMetadata(
  locale:
    SupportedLocale =
      siteConfig.defaultLocale,
): Metadata {
  return buildPageMetadata({
    title:
      seoConfig.defaultTitle,

    description:
      seoConfig.defaultDescription,

    path:
      "/",

    locale,

    absoluteTitle:
      true,
  });
}


export function buildMenuMetadata(
  locale:
    SupportedLocale =
      siteConfig.defaultLocale,
): Metadata {
  return buildPageMetadata({
    title:
      "Menu",

    description:
      "Poznaj menu Rincón Colombiano w Warszawie: kolumbijskie dania, przekąski, arepas, empanadas i tradycyjne specjalności.",

    path:
      "/menu",

    locale,
  });
}


export function buildCateringMetadata(
  locale:
    SupportedLocale =
      siteConfig.defaultLocale,
): Metadata {
  return buildPageMetadata({
    title:
      "Catering kolumbijski w Warszawie",

    description:
      "Catering Rincón Colombiano na wydarzenia firmowe, prywatne uroczystości, festiwale i wydarzenia kulturalne w Warszawie i okolicach.",

    path:
      "/catering",

    locale,
  });
}
