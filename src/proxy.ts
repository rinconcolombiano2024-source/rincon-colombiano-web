import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  addLocalePrefix,
  getLocaleFromPathname,
  resolvePreferredLocale,
} from "@/i18n/config";


/* ============================================================
   COOKIE CONFIGURATION
   ============================================================ */

const LOCALE_COOKIE_MAX_AGE =
  60 *
  60 *
  24 *
  365;


/* ============================================================
   PUBLIC FILE
   ============================================================ */

const PUBLIC_FILE_PATTERN =
  /\/[^/]+\.[^/]+$/;


/* ============================================================
   BYPASS
   ============================================================ */

function shouldBypassLocaleRouting(
  pathname:
    string,
): boolean {
  if (
    pathname.startsWith(
      "/api",
    )
  ) {
    return true;
  }

  if (
    pathname.startsWith(
      "/_next",
    )
  ) {
    return true;
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/",
    )
  ) {
    return true;
  }

  /**
   * Referral URLs intentionally remain
   * short and locale-independent:
   *
   * /r/CODE
   */
  if (
    pathname === "/r" ||
    pathname.startsWith(
      "/r/",
    )
  ) {
    return true;
  }

  if (
    PUBLIC_FILE_PATTERN.test(
      pathname,
    )
  ) {
    return true;
  }

  return false;
}


/* ============================================================
   SET LOCALE COOKIE
   ============================================================ */

function setLocaleCookie(
  response:
    NextResponse,
  request:
    NextRequest,
  locale:
    string,
): void {
  response.cookies.set(
    LOCALE_COOKIE_NAME,
    locale,
    {
      path:
        "/",

      maxAge:
        LOCALE_COOKIE_MAX_AGE,

      sameSite:
        "lax",

      secure:
        request.nextUrl
          .protocol ===
        "https:",
    },
  );
}


/* ============================================================
   PROXY
   ============================================================ */

export function proxy(
  request:
    NextRequest,
): NextResponse {
  const pathname =
    request.nextUrl
      .pathname;

  if (
    shouldBypassLocaleRouting(
      pathname,
    )
  ) {
    return NextResponse.next();
  }


  /* ========================================================
     ROOT
     ======================================================== */

  /**
   * La raíz tiene un destino SEO estable.
   *
   * /
   * ↓
   * /pl
   *
   * El usuario puede cambiar después a ES/EN.
   */
  if (
    pathname === "/"
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      `/${DEFAULT_LOCALE}`;

    const response =
      NextResponse.redirect(
        url,
        308,
      );

    setLocaleCookie(
      response,
      request,
      DEFAULT_LOCALE,
    );

    return response;
  }


  /* ========================================================
     ALREADY LOCALIZED
     ======================================================== */

  const pathnameLocale =
    getLocaleFromPathname(
      pathname,
    );

  if (
    pathnameLocale
  ) {
    const response =
      NextResponse.next();

    const currentCookie =
      request.cookies.get(
        LOCALE_COOKIE_NAME,
      )?.value;

    if (
      currentCookie !==
      pathnameLocale
    ) {
      setLocaleCookie(
        response,
        request,
        pathnameLocale,
      );
    }

    return response;
  }


  /* ========================================================
     UNPREFIXED PUBLIC PATH
     ======================================================== */

  const cookieLocale =
    request.cookies.get(
      LOCALE_COOKIE_NAME,
    )?.value;

  const acceptLanguage =
    request.headers.get(
      "accept-language",
    );

  const preferredLocale =
    resolvePreferredLocale({
      cookieLocale:
        cookieLocale ??
        null,

      acceptLanguage,
    });

  const url =
    request.nextUrl.clone();

  url.pathname =
    addLocalePrefix(
      pathname,
      preferredLocale,
    );

  const response =
    NextResponse.redirect(
      url,
      307,
    );

  setLocaleCookie(
    response,
    request,
    preferredLocale,
  );

  return response;
}


/* ============================================================
   MATCHER
   ============================================================ */

/**
 * Next.js 16:
 *
 * middleware.ts
 * fue sustituido por
 * proxy.ts
 *
 * El matcher permanece deliberadamente amplio;
 * las excepciones empresariales se resuelven arriba.
 */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
