import type {
  Metadata,
  Viewport,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  notFound,
} from "next/navigation";

import "../globals.css";

import {
  SEO_ORIGIN,
  SEO_SITE_NAME,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "@/config/seo";

import {
  SUPPORTED_LOCALES,
  getHtmlLang,
  getTextDirection,
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/config";


/* ============================================================
   STATIC LOCALES
   ============================================================ */

export function generateStaticParams():
  readonly {
    readonly locale:
      AppLocale;
  }[] {
  return SUPPORTED_LOCALES.map(
    (locale) => ({
      locale,
    }),
  );
}


export const dynamicParams =
  false;


/* ============================================================
   GLOBAL METADATA
   ============================================================ */

export const metadata:
  Metadata = {

  metadataBase:
    new URL(
      SEO_ORIGIN,
    ),

  applicationName:
    SEO_SITE_NAME,

  title:
    SEO_SITE_NAME,

  category:
    "restaurant",

  creator:
    SEO_SITE_NAME,

  publisher:
    SEO_SITE_NAME,

  referrer:
    "origin-when-cross-origin",

  formatDetection: {
    telephone:
      false,

    address:
      false,

    email:
      false,
  },

  other: {
    "geo.region":
      "PL-14",

    "geo.placename":
      "Warszawa",
  },
};


/* ============================================================
   VIEWPORT
   ============================================================ */

export const viewport:
  Viewport = {

  width:
    "device-width",

  initialScale:
    1,

  maximumScale:
    5,

  themeColor: [
    {
      media:
        "(prefers-color-scheme: light)",

      color:
        "#faf9f6",
    },
  ],

  colorScheme:
    "light",
};


/* ============================================================
   SKIP LINK
   ============================================================ */

const skipLinkText:
  Readonly<
    Record<
      AppLocale,
      string
    >
  > = {

  pl:
    "Przejdź do treści",

  es:
    "Ir al contenido",

  en:
    "Skip to content",
};


/* ============================================================
   PROPS
   ============================================================ */

interface LocaleLayoutProps {
  readonly children:
    ReactNode;

  readonly params:
    Promise<{
      readonly locale:
        string;
    }>;
}


/* ============================================================
   ROOT LOCALE LAYOUT
   ============================================================ */

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const {
    locale:
      rawLocale,
  } =
    await params;

  if (
    !isSupportedLocale(
      rawLocale,
    )
  ) {
    notFound();
  }

  const locale:
    AppLocale =
    rawLocale;

  const organizationJsonLd =
    buildOrganizationJsonLd();

  const websiteJsonLd =
    buildWebsiteJsonLd(
      locale,
    );

  return (
    <html
      lang={getHtmlLang(
        locale,
      )}
      dir={getTextDirection(
        locale,
      )}
    >
      <body>
        <a
          className="skip-link"
          href="#main-content"
        >
          {
            skipLinkText[
              locale
            ]
          }
        </a>

        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              serializeJsonLd(
                organizationJsonLd,
              ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              serializeJsonLd(
                websiteJsonLd,
              ),
          }}
        />
      </body>
    </html>
  );
}
