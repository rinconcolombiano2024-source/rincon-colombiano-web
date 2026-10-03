import type { NextConfig } from "next";

/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Configuración principal de Next.js
 * ============================================================
 *
 * Objetivos:
 * - Seguridad por defecto
 * - Rendimiento
 * - Optimización de imágenes
 * - Compatibilidad con Vercel
 * - Preparado para RC ORDERA / Supabase
 * - Sin configuraciones experimentales innecesarias
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Headers de seguridad globales.
 *
 * CSP se implementará posteriormente en middleware,
 * donde podremos manejar nonces correctamente.
 */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=(self)",
      "payment=(self)",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

/**
 * HSTS debe utilizarse únicamente en producción mediante HTTPS.
 */
if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
    /**
   * Server Actions
   *
   * Las imágenes administrativas de marca pueden pesar
   * varios MB. Next.js limita por defecto las Server Actions
   * a 1 MB, lo cual impediría que nuestro propio límite de
   * 4 MB llegue siquiera a ejecutarse.
   *
   * Vercel mantiene un límite de payload de 4.5 MB.
   * Dejamos margen de seguridad para multipart/form-data.
   *
   * Archivos multimedia grandes y videos utilizarán después
   * carga directa a Storage y no atravesarán la Function.
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "4.25mb",
    },
  },
  /**
   * React
   */
  reactStrictMode: true,

  /**
   * Seguridad
   *
   * Evita exponer el header:
   * X-Powered-By: Next.js
   */
  poweredByHeader: false,

  /**
   * URLs
   */
  trailingSlash: false,

  /**
   * Compresión HTTP.
   */
  compress: true,

  /**
   * Source maps del navegador desactivados en producción.
   *
   * Más adelante Sentry manejará el proceso de source maps
   * de manera privada.
   */
  productionBrowserSourceMaps: false,

  /**
   * Optimización de imágenes.
   */
  images: {
    formats: ["image/avif", "image/webp"],

    /**
     * Evita servir imágenes enormes innecesariamente.
     */
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1440, 1920],

    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    /**
     * Caché mínima de imágenes optimizadas:
     * 24 horas.
     */
    minimumCacheTTL: 86400,
  },

  /**
   * Headers globales.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },

      /**
       * Archivos estáticos versionados de Next.js.
       *
       * Pueden almacenarse agresivamente en caché porque
       * sus nombres cambian cuando cambia su contenido.
       */
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  /**
   * Redirects globales.
   *
   * Por ahora se deja vacío.
   *
   * Los redirects desde la antigua página SumUp y URLs
   * históricas se incorporarán cuando hagamos la migración
   * definitiva del dominio.
   */
  async redirects() {
    return [];
  },
};

export default nextConfig;
