import type {
  MetadataRoute,
} from "next";

import {
  SEO_PRODUCTION_ORIGIN,
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
