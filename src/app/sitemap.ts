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
  SUPPORTED_LOCALES,
} from "@/i18n/config";


/* ============================================================
   PUBLISHED ROUTES
   ============================================================ */

/**
 * IMPORTANTE:
 *
 * Solamente deben aparecer aquí rutas que:
 *
 * 1. existan realmente;
 * 2. respondan HTTP 200;
 * 3. sean públicas;
 * 4. sean indexables;
 * 5. tengan contenido útil y definitivo.
 *
 * routes.ts contiene la arquitectura completa futura,
 * pero NO debemos anunciar a Google páginas que todavía
 * no están implementadas.
 *
 * A medida que construyamos nuevas páginas:
 *
 * menu
 * locations
 * catering
 * services
 * etc.
 *
 * las agregaremos aquí después de comprobar que existen.
 */
const PUBLISHED_STATIC_ROUTE_KEYS =
  [
    "home",
  ] as const satisfies
    readonly RouteKey[];


/* ============================================================
   PRODUCTION URL
   ============================================================ */

/**
 * El sitemap siempre publica el dominio canónico.
 *
 * Nunca debe anunciar:
 *
 * - localhost
 * - preview deployments
 * - dominios temporales de Vercel
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
   SITEMAP
   ============================================================ */

export default function sitemap():
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
