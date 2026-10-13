import type {
  NextConfig,
} from "next";


/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Configuración principal de Next.js
 * ============================================================
 *
 * Objetivos:
 *
 * - seguridad por defecto;
 * - rendimiento;
 * - optimización de imágenes;
 * - compatibilidad con Vercel;
 * - preparación para RC ORDERA / Supabase;
 * - evitar configuraciones que interfieran con la gestión
 *   interna de Next.js.
 */


/* ============================================================
   ENVIRONMENT
   ============================================================ */

const isProduction =
  process.env.NODE_ENV ===
  "production";


/* ============================================================
   SECURITY HEADERS
   ============================================================ */

/**
 * Headers de seguridad globales.
 *
 * CSP se implementará posteriormente mediante una estrategia
 * compatible con nonces y contenido dinámico.
 *
 * No se configura Cache-Control globalmente.
 * Next.js debe conservar el control de las políticas de caché
 * de sus páginas y assets internos.
 */
const securityHeaders = [
  {
    key:
      "X-Content-Type-Options",
    value:
      "nosniff",
  },
  {
    key:
      "X-Frame-Options",
    value:
      "SAMEORIGIN",
  },
  {
    key:
      "Referrer-Policy",
    value:
      "strict-origin-when-cross-origin",
  },
  {
    key:
      "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=(self)",
      "usb=()",
      "interest-cohort=()",
    ].join(
      ", ",
    ),
  },
  {
    key:
      "Cross-Origin-Opener-Policy",
    value:
      "same-origin",
  },
  {
    key:
      "Cross-Origin-Resource-Policy",
    value:
      "same-origin",
  },
];


/**
 * HSTS únicamente debe enviarse en producción HTTPS.
 */
if (
  isProduction
) {
  securityHeaders.push({
    key:
      "Strict-Transport-Security",
    value:
      "max-age=63072000; includeSubDomains; preload",
  });
}


/* ============================================================
   NEXT CONFIG
   ============================================================ */

const nextConfig:
  NextConfig = {

  /* ========================================================
     SERVER ACTIONS
     ======================================================== */

  /**
   * Las imágenes administrativas de marca pueden superar
   * el límite estándar de una Server Action.
   *
   * El sistema de branding mantiene su propio límite de
   * archivo y posteriormente los archivos multimedia grandes
   * deberán utilizar carga directa hacia Storage.
   */
  experimental: {
    serverActions: {
      bodySizeLimit:
        "4.25mb",
    },
  },


  /* ========================================================
     REACT
     ======================================================== */

  reactStrictMode:
    true,


  /* ========================================================
     SECURITY
     ======================================================== */

  /**
   * Evita exponer:
   *
   * X-Powered-By: Next.js
   */
  poweredByHeader:
    false,


  /* ========================================================
     URL BEHAVIOR
     ======================================================== */

  trailingSlash:
    false,


  /* ========================================================
     COMPRESSION
     ======================================================== */

  compress:
    true,


  /* ========================================================
     SOURCE MAPS
     ======================================================== */

  /**
   * Los source maps del navegador permanecen desactivados
   * en producción.
   *
   * Si posteriormente utilizamos un sistema como Sentry,
   * los source maps deberán manejarse de forma privada.
   */
  productionBrowserSourceMaps:
    false,


  /* ========================================================
     IMAGE OPTIMIZATION
     ======================================================== */

  images: {

    formats: [
      "image/avif",
      "image/webp",
    ],


    /**
     * Tamaños utilizados por el optimizador responsive.
     */
    deviceSizes: [
      360,
      390,
      430,
      640,
      750,
      828,
      1080,
      1200,
      1440,
      1920,
    ],


    imageSizes: [
      16,
      32,
      48,
      64,
      96,
      128,
      256,
      384,
    ],


    /**
     * Caché mínima para imágenes procesadas por next/image:
     * 24 horas.
     */
    minimumCacheTTL:
      86400,
  },


  /* ========================================================
     HTTP HEADERS
     ======================================================== */

  async headers() {

    return [
      {
        source:
          "/:path*",

        headers:
          securityHeaders,
      },
    ];
  },


  /*
   * IMPORTANTE:
   *
   * No añadimos manualmente Cache-Control a:
   *
   * /_next/static/:path*
   *
   * Next.js administra automáticamente el cacheado de sus
   * assets versionados/inmutables.
   *
   * Intervenir manualmente sobre esos headers provocaba el
   * warning detectado por `next build` y puede alterar el
   * comportamiento esperado entre development y production.
   */


  /* ========================================================
     LEGACY SUMUP CATALOG REDIRECTS
     ======================================================== */

  /**
   * Preserve public bookmarks and indexed links from the live SumUp
   * catalogue when Next.js eventually takes over rinconcolombiano.pl.
   *
   * The full catalogue URL is permanently moved to the real PL menu.
   * Individual legacy products/categories use TEMPORARY redirects
   * because no verified 1:1 RC ORDERA product/price mapping exists yet.
   * Never redirect old carts, checkout or payment/order endpoints.
   */
  async redirects() {
    return [
      {
        source: "/produkty",
        destination: "/pl/menu",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/pl/menu",
        permanent: false,
      },
      {
        source: "/produkt/:slug",
        destination: "/pl/menu",
        permanent: false,
      },
      {
        source: "/kategoria/:slug",
        destination: "/pl/menu",
        permanent: false,
      },
      {
        source: "/category/:slug",
        destination: "/pl/menu",
        permanent: false,
      },
    ];
  },
};


export default nextConfig;
