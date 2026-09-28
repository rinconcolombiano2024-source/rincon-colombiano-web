/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Route Registry
 * ============================================================
 *
 * Registro central de rutas de toda la plataforma.
 *
 * OBJETIVOS:
 *
 * - evitar URLs dispersas por el código
 * - soportar PL / ES / EN
 * - controlar SEO
 * - controlar sitemap
 * - controlar autenticación
 * - controlar feature flags
 * - soportar comunidad
 * - soportar loyalty
 * - soportar referidos
 * - soportar IA
 * - soportar páginas legales
 * - soportar administración privada
 *
 * PRINCIPIO:
 *
 * ROUTES
 *   ↓
 * NAVIGATION
 *   ↓
 * SEO
 *   ↓
 * SITEMAP
 *   ↓
 * INTERNAL LINKING
 *
 * No duplicar rutas manualmente en componentes.
 */

import type {
  SupportedLocale,
} from "@/config/site";

import type {
  FeatureFlagKey,
} from "@/types/settings";


/* ============================================================
   ROUTE KEYS
   ============================================================ */

export type RouteKey =
  /* Core */
  | "home"
  | "menu"
  | "order"
  | "delivery"

  /* Services */
  | "services"
  | "catering"
  | "birthdays"
  | "corporate"
  | "families"
  | "breakfasts"
  | "surprise_breakfasts"
  | "table_decorations"
  | "bakery"
  | "events"

  /* Restaurants */
  | "locations"
  | "location"

  /* Brand */
  | "about"
  | "contact"
  | "reviews"
  | "leave_review"
  | "suggestions"
  | "careers"

  /* Reservation */
  | "reservations"

  /* Community */
  | "community"
  | "community_profile"
  | "community_post"

  /* Loyalty */
  | "loyalty"
  | "referrals"
  | "referral_invitation"

  /* AI */
  | "ai"

  /* Customer */
  | "account"
  | "account_orders"
  | "account_reservations"
  | "account_rewards"
  | "account_referrals"
  | "account_profile"
  | "account_privacy"

  /* Search */
  | "search"

  /* Legal */
  | "legal"
  | "terms"
  | "sales_terms"
  | "privacy"
  | "cookies"
  | "community_terms"
  | "loyalty_terms"
  | "referral_terms"
  | "accessibility"
  | "complaints"

  /* Admin */
  | "admin";


/* ============================================================
   ROUTE GROUP
   ============================================================ */

export type RouteGroup =
  | "primary"
  | "commerce"
  | "services"
  | "restaurants"
  | "brand"
  | "community"
  | "loyalty"
  | "customer"
  | "support"
  | "legal"
  | "admin";


/* ============================================================
   ACCESS
   ============================================================ */

export type RouteAccess =
  | "public"
  | "authenticated"
  | "admin";


/* ============================================================
   LOCALE STRATEGY
   ============================================================ */

export type RouteLocaleStrategy =
  | "prefixed"
  | "unprefixed";


/* ============================================================
   SEO POLICY
   ============================================================ */

export interface RouteSeoPolicy {
  readonly index:
    boolean;

  readonly follow:
    boolean;

  readonly sitemap:
    boolean;

  /**
   * Para rutas dinámicas la decisión definitiva
   * puede depender del recurso.
   */
  readonly runtimeIndexability:
    boolean;
}


/* ============================================================
   LOCALIZED SEGMENTS
   ============================================================ */

export interface LocalizedRouteSegments {
  readonly pl:
    string;

  readonly es:
    string;

  readonly en:
    string;
}


/* ============================================================
   ROUTE DEFINITION
   ============================================================ */

export interface RouteDefinition {
  readonly key:
    RouteKey;

  readonly group:
    RouteGroup;

  readonly access:
    RouteAccess;

  readonly localeStrategy:
    RouteLocaleStrategy;

  readonly segments:
    LocalizedRouteSegments;

  /**
   * Clave futura del sistema i18n.
   */
  readonly labelKey:
    string;

  readonly seo:
    RouteSeoPolicy;

  readonly featureFlag?:
    FeatureFlagKey;

  readonly showInHeader:
    boolean;

  readonly showInFooter:
    boolean;

  readonly showInMobileNavigation:
    boolean;

  readonly dynamic:
    boolean;
}


/* ============================================================
   SEO PRESETS
   ============================================================ */

const publicSeo:
  RouteSeoPolicy = {
    index: true,
    follow: true,
    sitemap: true,
    runtimeIndexability: false,
  };


const privateSeo:
  RouteSeoPolicy = {
    index: false,
    follow: false,
    sitemap: false,
    runtimeIndexability: false,
  };


const utilitySeo:
  RouteSeoPolicy = {
    index: false,
    follow: true,
    sitemap: false,
    runtimeIndexability: false,
  };


const dynamicPublicSeo:
  RouteSeoPolicy = {
    index: true,
    follow: true,
    sitemap: false,
    runtimeIndexability: true,
  };


/* ============================================================
   ROUTES
   ============================================================ */

export const routes:
  Readonly<
    Record<
      RouteKey,
      RouteDefinition
    >
  > = {

  /* ========================================================
     CORE
     ======================================================== */

  home: {
    key: "home",
    group: "primary",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "",
      es: "",
      en: "",
    },

    labelKey:
      "navigation.home",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  menu: {
    key: "menu",
    group: "commerce",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "menu",
      es: "menu",
      en: "menu",
    },

    labelKey:
      "navigation.menu",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  order: {
    key: "order",
    group: "commerce",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "zamow",
      es: "pedir",
      en: "order",
    },

    labelKey:
      "navigation.order",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  delivery: {
    key: "delivery",
    group: "commerce",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "dostawa",
      es: "domicilios",
      en: "delivery",
    },

    labelKey:
      "navigation.delivery",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     SERVICES
     ======================================================== */

  services: {
    key: "services",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "uslugi",
      es: "servicios",
      en: "services",
    },

    labelKey:
      "navigation.services",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  catering: {
    key: "catering",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "catering",
      es: "catering",
      en: "catering",
    },

    labelKey:
      "navigation.catering",

    seo:
      publicSeo,

    featureFlag:
      "catering",

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  birthdays: {
    key: "birthdays",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "urodziny",
      es: "cumpleanos",
      en: "birthdays",
    },

    labelKey:
      "services.birthdays",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  corporate: {
    key: "corporate",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "dla-firm",
      es: "empresas",
      en: "corporate",
    },

    labelKey:
      "services.corporate",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  families: {
    key: "families",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "dla-rodzin",
      es: "familias",
      en: "families",
    },

    labelKey:
      "services.families",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  breakfasts: {
    key: "breakfasts",
    group: "services",
    access: "public",
    localeStrategy: "prefixed",

    segments: {
      pl: "sniadania",
      es: "desayunos",
      en: "breakfasts",
    },

    labelKey:
      "services.breakfasts",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  surprise_breakfasts: {
    key:
      "surprise_breakfasts",

    group:
      "services",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "sniadania-niespodzianki",

      es:
        "desayunos-sorpresa",

      en:
        "surprise-breakfasts",
    },

    labelKey:
      "services.surpriseBreakfasts",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  table_decorations: {
    key:
      "table_decorations",

    group:
      "services",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "dekoracje-stolow",

      es:
        "decoracion-de-mesas",

      en:
        "table-decorations",
    },

    labelKey:
      "services.tableDecorations",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  bakery: {
    key:
      "bakery",

    group:
      "services",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "piekarnia",

      es:
        "panaderia",

      en:
        "bakery",
    },

    labelKey:
      "services.bakery",

    seo:
      publicSeo,

    featureFlag:
      "bakery",

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  events: {
    key:
      "events",

    group:
      "services",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "wydarzenia",

      es:
        "eventos",

      en:
        "events",
    },

    labelKey:
      "navigation.events",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     RESTAURANTS
     ======================================================== */

  locations: {
    key:
      "locations",

    group:
      "restaurants",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "lokale",

      es:
        "restaurantes",

      en:
        "locations",
    },

    labelKey:
      "navigation.locations",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  location: {
    key:
      "location",

    group:
      "restaurants",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "lokale/[slug]",

      es:
        "restaurantes/[slug]",

      en:
        "locations/[slug]",
    },

    labelKey:
      "navigation.location",

    seo:
      dynamicPublicSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      true,
  },


  /* ========================================================
     RESERVATIONS
     ======================================================== */

  reservations: {
    key:
      "reservations",

    group:
      "commerce",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "rezerwacje",

      es:
        "reservas",

      en:
        "reservations",
    },

    labelKey:
      "navigation.reservations",

    seo:
      publicSeo,

    featureFlag:
      "reservations",

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  /* ========================================================
     BRAND
     ======================================================== */

  about: {
    key:
      "about",

    group:
      "brand",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "o-nas",

      es:
        "nosotros",

      en:
        "about",
    },

    labelKey:
      "navigation.about",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  contact: {
    key:
      "contact",

    group:
      "support",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "kontakt",

      es:
        "contacto",

      en:
        "contact",
    },

    labelKey:
      "navigation.contact",

    seo:
      publicSeo,

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  reviews: {
    key:
      "reviews",

    group:
      "brand",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "opinie",

      es:
        "opiniones",

      en:
        "reviews",
    },

    labelKey:
      "navigation.reviews",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  leave_review: {
    key:
      "leave_review",

    group:
      "support",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "opinie/dodaj",

      es:
        "opiniones/dejar-opinion",

      en:
        "reviews/leave-review",
    },

    labelKey:
      "reviews.leave",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  suggestions: {
    key:
      "suggestions",

    group:
      "support",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "sugestie",

      es:
        "sugerencias",

      en:
        "suggestions",
    },

    labelKey:
      "navigation.suggestions",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  careers: {
    key:
      "careers",

    group:
      "brand",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "kariera",

      es:
        "trabaja-con-nosotros",

      en:
        "careers",
    },

    labelKey:
      "navigation.careers",

    seo:
      publicSeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     COMMUNITY
     ======================================================== */

  community: {
    key:
      "community",

    group:
      "community",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "spolecznosc",

      es:
        "comunidad",

      en:
        "community",
    },

    labelKey:
      "navigation.community",

    seo:
      publicSeo,

    featureFlag:
      "community",

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  community_profile: {
    key:
      "community_profile",

    group:
      "community",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "spolecznosc/u/[slug]",

      es:
        "comunidad/u/[slug]",

      en:
        "community/u/[slug]",
    },

    labelKey:
      "community.profile",

    seo:
      dynamicPublicSeo,

    featureFlag:
      "community",

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      true,
  },


  community_post: {
    key:
      "community_post",

    group:
      "community",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "spolecznosc/p/[id]",

      es:
        "comunidad/p/[id]",

      en:
        "community/p/[id]",
    },

    labelKey:
      "community.post",

    seo:
      dynamicPublicSeo,

    featureFlag:
      "community",

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      true,
  },


  /* ========================================================
     LOYALTY
     ======================================================== */

  loyalty: {
    key:
      "loyalty",

    group:
      "loyalty",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "nagrody",

      es:
        "recompensas",

      en:
        "rewards",
    },

    labelKey:
      "navigation.loyalty",

    seo:
      publicSeo,

    featureFlag:
      "loyalty",

    showInHeader:
      true,

    showInFooter:
      true,

    showInMobileNavigation:
      true,

    dynamic:
      false,
  },


  referrals: {
    key:
      "referrals",

    group:
      "loyalty",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "polec-znajomego",

      es:
        "refiere-a-un-amigo",

      en:
        "refer-a-friend",
    },

    labelKey:
      "navigation.referrals",

    seo:
      publicSeo,

    featureFlag:
      "referrals",

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  referral_invitation: {
    key:
      "referral_invitation",

    group:
      "loyalty",

    access:
      "public",

    localeStrategy:
      "unprefixed",

    segments: {
      pl:
        "r/[code]",

      es:
        "r/[code]",

      en:
        "r/[code]",
    },

    labelKey:
      "referral.invitation",

    seo:
      utilitySeo,

    featureFlag:
      "referrals",

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      true,
  },


  /* ========================================================
     AI
     ======================================================== */

  ai: {
    key:
      "ai",

    group:
      "support",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "rincon-ai",

      es:
        "rincon-ai",

      en:
        "rincon-ai",
    },

    labelKey:
      "navigation.ai",

    seo:
      publicSeo,

    featureFlag:
      "ai_assistant",

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     SEARCH
     ======================================================== */

  search: {
    key:
      "search",

    group:
      "support",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "szukaj",

      es:
        "buscar",

      en:
        "search",
    },

    labelKey:
      "navigation.search",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     CUSTOMER AREA
     ======================================================== */

  account: {
    key:
      "account",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto",

      es:
        "mi-cuenta",

      en:
        "account",
    },

    labelKey:
      "account.home",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_orders: {
    key:
      "account_orders",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/zamowienia",

      es:
        "mi-cuenta/pedidos",

      en:
        "account/orders",
    },

    labelKey:
      "account.orders",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_reservations: {
    key:
      "account_reservations",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/rezerwacje",

      es:
        "mi-cuenta/reservas",

      en:
        "account/reservations",
    },

    labelKey:
      "account.reservations",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_rewards: {
    key:
      "account_rewards",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/nagrody",

      es:
        "mi-cuenta/recompensas",

      en:
        "account/rewards",
    },

    labelKey:
      "account.rewards",

    seo:
      privateSeo,

    featureFlag:
      "loyalty",

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_referrals: {
    key:
      "account_referrals",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/polecenia",

      es:
        "mi-cuenta/referidos",

      en:
        "account/referrals",
    },

    labelKey:
      "account.referrals",

    seo:
      privateSeo,

    featureFlag:
      "referrals",

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_profile: {
    key:
      "account_profile",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/profil",

      es:
        "mi-cuenta/perfil",

      en:
        "account/profile",
    },

    labelKey:
      "account.profile",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  account_privacy: {
    key:
      "account_privacy",

    group:
      "customer",

    access:
      "authenticated",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "konto/prywatnosc",

      es:
        "mi-cuenta/privacidad",

      en:
        "account/privacy",
    },

    labelKey:
      "account.privacy",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     LEGAL
     ======================================================== */

  legal: {
    key:
      "legal",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "informacje-prawne",

      es:
        "legal",

      en:
        "legal",
    },

    labelKey:
      "legal.home",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  terms: {
    key:
      "terms",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "regulamin",

      es:
        "terminos-y-condiciones",

      en:
        "terms",
    },

    labelKey:
      "legal.terms",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  sales_terms: {
    key:
      "sales_terms",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "warunki-sprzedazy",

      es:
        "condiciones-de-venta",

      en:
        "sales-terms",
    },

    labelKey:
      "legal.salesTerms",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  privacy: {
    key:
      "privacy",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "polityka-prywatnosci",

      es:
        "privacidad",

      en:
        "privacy",
    },

    labelKey:
      "legal.privacy",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  cookies: {
    key:
      "cookies",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "polityka-cookies",

      es:
        "cookies",

      en:
        "cookies",
    },

    labelKey:
      "legal.cookies",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  community_terms: {
    key:
      "community_terms",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "regulamin-spolecznosci",

      es:
        "terminos-comunidad",

      en:
        "community-terms",
    },

    labelKey:
      "legal.communityTerms",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  loyalty_terms: {
    key:
      "loyalty_terms",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "regulamin-programu-lojalnosciowego",

      es:
        "terminos-recompensas",

      en:
        "rewards-terms",
    },

    labelKey:
      "legal.loyaltyTerms",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  referral_terms: {
    key:
      "referral_terms",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "regulamin-polecen",

      es:
        "terminos-referidos",

      en:
        "referral-terms",
    },

    labelKey:
      "legal.referralTerms",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  accessibility: {
    key:
      "accessibility",

    group:
      "legal",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "dostepnosc",

      es:
        "accesibilidad",

      en:
        "accessibility",
    },

    labelKey:
      "legal.accessibility",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  complaints: {
    key:
      "complaints",

    group:
      "support",

    access:
      "public",

    localeStrategy:
      "prefixed",

    segments: {
      pl:
        "reklamacje",

      es:
        "reclamaciones",

      en:
        "complaints",
    },

    labelKey:
      "legal.complaints",

    seo:
      utilitySeo,

    showInHeader:
      false,

    showInFooter:
      true,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },


  /* ========================================================
     ADMIN
     ======================================================== */

  admin: {
    key:
      "admin",

    group:
      "admin",

    access:
      "admin",

    localeStrategy:
      "unprefixed",

    segments: {
      pl:
        "admin",

      es:
        "admin",

      en:
        "admin",
    },

    labelKey:
      "admin.home",

    seo:
      privateSeo,

    showInHeader:
      false,

    showInFooter:
      false,

    showInMobileNavigation:
      false,

    dynamic:
      false,
  },
};


/* ============================================================
   LOCALE PREFIX
   ============================================================ */

export function getLocalePrefix(
  locale:
    SupportedLocale,
): string {
  return `/${locale}`;
}


/* ============================================================
   NORMALIZE PATH
   ============================================================ */

function normalizePath(
  path: string,
): string {
  if (
    path === ""
  ) {
    return "/";
  }

  return (
    "/" +
    path
      .split("/")
      .filter(Boolean)
      .join("/")
  );
}


/* ============================================================
   INTERPOLATE DYNAMIC PARAMS
   ============================================================ */

function interpolateRouteParams(
  pattern:
    string,
  params:
    Readonly<
      Record<
        string,
        string | number
      >
    >,
): string {
  return pattern.replace(
    /\[([^\]]+)\]/g,
    (
      match,
      parameterName:
        string,
    ) => {
      const value =
        params[
          parameterName
        ];

      if (
        value === undefined
      ) {
        throw new Error(
          `Missing route parameter: ${parameterName}`,
        );
      }

      return encodeURIComponent(
        String(
          value,
        ),
      );
    },
  );
}


/* ============================================================
   BUILD ROUTE
   ============================================================ */

export function buildRoutePath(
  key:
    RouteKey,
  locale:
    SupportedLocale,
  params:
    Readonly<
      Record<
        string,
        string | number
      >
    > = {},
): string {
  const route =
    routes[key];

  const localizedSegment =
    route.segments[
      locale
    ];

  const interpolated =
    interpolateRouteParams(
      localizedSegment,
      params,
    );

  if (
    route.localeStrategy ===
      "unprefixed"
  ) {
    return normalizePath(
      interpolated,
    );
  }

  if (
  interpolated === ""
) {
  return getLocalePrefix(
    locale,
  );
}

  return normalizePath(
    `${getLocalePrefix(
      locale,
    )}/${interpolated}`,
  );
}


/* ============================================================
   GET ROUTE
   ============================================================ */

export function getRoute(
  key:
    RouteKey,
): RouteDefinition {
  return routes[key];
}


/* ============================================================
   HEADER ROUTES
   ============================================================ */

export function getHeaderRoutes():
  readonly RouteDefinition[] {
  return Object.values(
    routes,
  ).filter(
    (route) =>
      route.showInHeader &&
      route.access ===
        "public",
  );
}


/* ============================================================
   FOOTER ROUTES
   ============================================================ */

export function getFooterRoutes():
  readonly RouteDefinition[] {
  return Object.values(
    routes,
  ).filter(
    (route) =>
      route.showInFooter &&
      route.access ===
        "public",
  );
}


/* ============================================================
   MOBILE ROUTES
   ============================================================ */

export function getMobileNavigationRoutes():
  readonly RouteDefinition[] {
  return Object.values(
    routes,
  ).filter(
    (route) =>
      route
        .showInMobileNavigation &&
      route.access ===
        "public",
  );
}


/* ============================================================
   SITEMAP ROUTES
   ============================================================ */

export function getStaticSitemapRoutes():
  readonly RouteDefinition[] {
  return Object.values(
    routes,
  ).filter(
    (route) =>
      route.seo.sitemap &&
      route.seo.index &&
      !route.dynamic &&
      route.access ===
        "public",
  );
}


/* ============================================================
   INDEXABILITY
   ============================================================ */

export function isRouteIndexable(
  key:
    RouteKey,
): boolean {
  const route =
    routes[key];

  return (
    route.access ===
      "public" &&
    route.seo.index
  );
}


/* ============================================================
   PRIVATE ROUTE
   ============================================================ */

export function isPrivateRoute(
  key:
    RouteKey,
): boolean {
  return (
    routes[key].access !==
    "public"
  );
}
