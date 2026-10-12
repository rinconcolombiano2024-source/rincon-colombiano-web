import type {
  MetadataRoute,
} from "next";

import {
  SEO_PRODUCTION_ORIGIN,
  seoLocaleConfig,
} from "@/config/seo";

import {
  buildRoutePath,
  type RouteKey,
} from "@/config/routes";

import {
  getOpenRestaurants,
} from "@/config/restaurants";

import {
  SUPPORTED_LOCALES,
} from "@/i18n/config";


/* ============================================================
   PUBLISHED STATIC ROUTES
   ============================================================ */

/**
 * Únicamente incluimos rutas públicas que:
 *
 * - existen realmente;
 * - responden correctamente;
 * - son indexables;
 * - contienen contenido útil;
 * - forman parte de la experiencia pública actual.
 *
 * routes.ts contiene también arquitectura futura.
 * Esas rutas NO deben entrar al sitemap hasta estar
 * implementadas y listas para indexación.
 */
const PUBLISHED_STATIC_ROUTE_KEYS =
  [
    "home",
    "menu",
  ] as const satisfies
    readonly RouteKey[];


/* ============================================================
   PRODUCTION URL
   ============================================================ */

/**
 * El sitemap siempre publica el dominio canónico oficial.
 *
 * Nunca debe anunciar:
 *
 * - localhost;
 * - previews de Vercel;
 * - dominios temporales;
 * - URLs internas.
 */
function buildProductionUrl(
  path:
    string,
): string {
  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return (
    `${SEO_PRODUCTION_ORIGIN}${normalizedPath}`
  );
}


/**
 * Every sitemap hreflang alternate must point to an equivalent
 * actually published page, never planned routes or unopened sites.
 * This is also used for location pages, but ONLY when status=open.
 */
function buildSitemapAlternates(
  routeKey: RouteKey,
  params: Readonly<Record<string, string | number>> = {},
): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const language of SUPPORTED_LOCALES) {
    languages[seoLocaleConfig[language].hreflang] =
      buildProductionUrl(buildRoutePath(routeKey, language, params));
  }
  languages["x-default"] =
    buildProductionUrl(buildRoutePath(routeKey, "pl", params));
  return { languages };
}


/* ============================================================
   STATIC ROUTES
   ============================================================ */

function buildStaticSitemapEntries():
  MetadataRoute.Sitemap {
  return PUBLISHED_STATIC_ROUTE_KEYS
    .flatMap(
      (
        routeKey,
      ) =>
        SUPPORTED_LOCALES.map(
          (
            locale,
          ) => ({
            url:
              buildProductionUrl(
                buildRoutePath(
                  routeKey,
                  locale,
                ),
              ),
            alternates: buildSitemapAlternates(routeKey),
          }),
        ),
    );
}


/* ============================================================
   RESTAURANT ROUTES
   ============================================================ */

/**
 * Únicamente las sedes realmente abiertas aparecen
 * en el sitemap.
 *
 * Esto mantiene sincronizadas:
 *
 * - disponibilidad pública;
 * - política de indexación;
 * - SEO local;
 * - sitemap.
 *
 * Ejemplo actual:
 *
 * Czapelska -> incluida.
 * Brzeska   -> excluida mientras sea coming_soon.
 *
 * Cuando una futura sede cambie a status "open",
 * entrará automáticamente al sitemap.
 */
function buildRestaurantSitemapEntries():
  MetadataRoute.Sitemap {
  return getOpenRestaurants()
    .flatMap(
      (
        restaurant,
      ) =>
        SUPPORTED_LOCALES.map(
          (
            locale,
          ) => ({
            url:
              buildProductionUrl(
                buildRoutePath(
                  "location",
                  locale,
                  {
                    slug:
                      restaurant.slug,
                  },
                ),
              ),
            alternates: buildSitemapAlternates("location", { slug: restaurant.slug }),
          }),
        ),
    );
}


/* ============================================================
   SITEMAP
   ============================================================ */

export default function sitemap():
  MetadataRoute.Sitemap {
  return [
    ...buildStaticSitemapEntries(),
    ...buildRestaurantSitemapEntries(),
  ];
}
