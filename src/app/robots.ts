import type {
  MetadataRoute,
} from "next";

import {
  SEO_PRODUCTION_ORIGIN,
  isSeoProductionEnvironment,
} from "@/config/seo";


/* ============================================================
   ROBOTS
   ============================================================ */

/**
 * Política central de rastreo de Rincón Colombiano.
 *
 * PRODUCCIÓN:
 *
 * - permite rastrear el sitio público;
 * - bloquea infraestructura privada/técnica;
 * - anuncia el sitemap oficial;
 * - declara el host canónico.
 *
 * PREVIEW / DESARROLLO:
 *
 * - bloquea completamente el rastreo.
 *
 * Esto evita que dominios temporales de Vercel,
 * previews o entornos de prueba compitan con:
 *
 * https://rinconcolombiano.pl
 */
export default function robots():
  MetadataRoute.Robots {
  const isProduction =
    isSeoProductionEnvironment();


  /* ========================================================
     NON-PRODUCTION
     ======================================================== */

  if (
    !isProduction
  ) {
    return {
      rules: [
        {
          userAgent:
            "*",

          disallow:
            "/",
        },
      ],
    };
  }


  /* ========================================================
     PRODUCTION
     ======================================================== */

  return {
    rules: [
      {
        userAgent:
          "*",

        allow:
          "/",

        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/r",
          "/r/",
        ],
      },
    ],

    sitemap:
      `${SEO_PRODUCTION_ORIGIN}/sitemap.xml`,

    host:
      SEO_PRODUCTION_ORIGIN,
  };
}
