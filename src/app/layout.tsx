import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Root Layout
 * ============================================================
 *
 * Responsabilidades:
 * - Documento HTML raíz.
 * - Metadata global.
 * - Configuración móvil.
 * - Accesibilidad global.
 * - Identidad básica del sitio.
 *
 * IMPORTANTE:
 * - Las páginas individuales podrán extender su propia metadata.
 * - SEO específico por local/plato/página se implementará después.
 */

const SITE_NAME = "Rincón Colombiano";

const SITE_DESCRIPTION =
  "Rincón Colombiano, restaurante de auténtica gastronomía colombiana en Varsovia. Menú, pedidos online, domicilios, reservas, catering y nuestros locales.";

const DEFAULT_SITE_URL = "http://localhost:3000";

function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return new URL(DEFAULT_SITE_URL);
  }

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

/**
 * ============================================================
 * METADATA GLOBAL
 * ============================================================
 */

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),

  applicationName: SITE_NAME,

  title: {
    default: `${SITE_NAME} | Restaurante colombiano en Varsovia`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  category: "restaurant",

  creator: SITE_NAME,
  publisher: SITE_NAME,

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  referrer: "origin-when-cross-origin",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",

    siteName: SITE_NAME,

    title: `${SITE_NAME} | Restaurante colombiano en Varsovia`,

    description: SITE_DESCRIPTION,

    locale: "pl_PL",
  },

  twitter: {
    card: "summary_large_image",

    title: `${SITE_NAME} | Restaurante colombiano en Varsovia`,

    description: SITE_DESCRIPTION,
  },

  other: {
    "geo.region": "PL-14",
    "geo.placename": "Warszawa",
  },
};

/**
 * ============================================================
 * VIEWPORT
 * ============================================================
 *
 * Configuración separada porque Next.js moderno gestiona
 * viewport mediante su propio export.
 */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#faf9f6",
    },
  ],

  colorScheme: "light",
};

/**
 * ============================================================
 * ROOT LAYOUT
 * ============================================================
 */

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="pl">
      <body>
        <a
          className="skip-link"
          href="#main-content"
        >
          Przejdź do treści
        </a>

        {children}
      </body>
    </html>
  );
}
