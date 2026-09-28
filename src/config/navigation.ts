/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise Navigation Architecture
 * ============================================================
 *
 * Fuente central de estructura de navegación.
 *
 * IMPORTANTE:
 *
 * Este archivo NO define URLs.
 *
 * Las URLs pertenecen exclusivamente a:
 *
 * src/config/routes.ts
 *
 * Este archivo define:
 *
 * - qué aparece en header
 * - qué aparece en mobile
 * - mega menú de servicios
 * - acciones principales
 * - navegación de cuenta
 * - footer
 * - jerarquía visual
 * - iconografía lógica
 * - analytics keys
 *
 * PRINCIPIOS:
 *
 * 1. Nunca hardcodear URLs en componentes.
 * 2. Nunca duplicar rutas de routes.ts.
 * 3. Las features deshabilitadas no aparecen.
 * 4. Rutas privadas requieren autenticación.
 * 5. Admin nunca aparece en navegación pública.
 * 6. El header debe mantenerse simple.
 * 7. El footer puede ser mucho más completo.
 * 8. Redes sociales se resuelven desde social.ts,
 *    no se duplican aquí.
 */

import type {
  SupportedLocale,
} from "@/config/site";

import {
  buildRoutePath,
  getRoute,
  type RouteKey,
} from "@/config/routes";

import type {
  FeatureFlagKey,
} from "@/types/settings";


/* ============================================================
   LOCALIZED NAVIGATION TEXT
   ============================================================ */

export type NavigationText =
  Readonly<
    Record<
      SupportedLocale,
      string
    >
  >;


/* ============================================================
   ICON KEYS
   ============================================================ */

/**
 * Claves abstractas.
 *
 * Más adelante los componentes decidirán
 * qué librería/icono visual renderizar.
 */

export type NavigationIconKey =
  | "home"
  | "menu"
  | "shopping_bag"
  | "delivery"
  | "calendar"
  | "services"
  | "cake"
  | "business"
  | "family"
  | "breakfast"
  | "gift"
  | "decoration"
  | "bakery"
  | "events"
  | "location"
  | "community"
  | "star"
  | "referral"
  | "ai"
  | "search"
  | "account"
  | "about"
  | "contact"
  | "review"
  | "suggestion"
  | "career"
  | "privacy"
  | "legal"
  | "accessibility"
  | "complaint";


/* ============================================================
   VISUAL EMPHASIS
   ============================================================ */

export type NavigationEmphasis =
  | "default"
  | "subtle"
  | "secondary"
  | "primary";


/* ============================================================
   NAVIGATION ITEM
   ============================================================ */

export interface NavigationItem {
  readonly id:
    string;

  readonly routeKey:
    RouteKey;

  readonly label:
    NavigationText;

  readonly description:
    NavigationText | null;

  readonly icon:
    NavigationIconKey | null;

  readonly emphasis:
    NavigationEmphasis;

  /**
   * Nombre estable para analytics.
   *
   * Ejemplo:
   *
   * navigation.header.menu
   */
  readonly analyticsKey:
    string;

  readonly children:
    readonly NavigationItem[];
}


/* ============================================================
   RESOLVED NAVIGATION ITEM
   ============================================================ */

/**
 * Objeto listo para entregar al componente visual.
 */

export interface ResolvedNavigationItem {
  readonly id:
    string;

  readonly routeKey:
    RouteKey;

  readonly label:
    string;

  readonly description:
    string | null;

  readonly href:
    string;

  readonly icon:
    NavigationIconKey | null;

  readonly emphasis:
    NavigationEmphasis;

  readonly analyticsKey:
    string;

  readonly children:
    readonly ResolvedNavigationItem[];
}


/* ============================================================
   NAVIGATION CONTEXT
   ============================================================ */

export interface NavigationContext {
  readonly locale:
    SupportedLocale;

  readonly authenticated:
    boolean;

  /**
   * Features que están realmente habilitadas
   * para este request/usuario/restaurante.
   */
  readonly enabledFeatures:
    ReadonlySet<
      FeatureFlagKey
    >;
}


/* ============================================================
   FOOTER SECTION
   ============================================================ */

export interface FooterNavigationSection {
  readonly id:
    string;

  readonly title:
    NavigationText;

  readonly items:
    readonly NavigationItem[];

  readonly sortOrder:
    number;
}


/* ============================================================
   RESOLVED FOOTER SECTION
   ============================================================ */

export interface ResolvedFooterNavigationSection {
  readonly id:
    string;

  readonly title:
    string;

  readonly items:
    readonly ResolvedNavigationItem[];

  readonly sortOrder:
    number;
}


/* ============================================================
   ITEM FACTORY
   ============================================================ */

/**
 * Reduce ruido y garantiza que todos los elementos
 * siguen el mismo contrato.
 */

function navigationItem(
  item: NavigationItem,
): NavigationItem {
  return item;
}


/* ============================================================
   SERVICE CHILDREN
   ============================================================ */

export const serviceNavigationItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "service-catering",

    routeKey:
      "catering",

    label: {
      pl: "Catering",
      es: "Catering",
      en: "Catering",
    },

    description: {
      pl:
        "Kolumbijska kuchnia na wydarzenia i spotkania.",

      es:
        "Gastronomía colombiana para eventos y reuniones.",

      en:
        "Colombian food for events and gatherings.",
    },

    icon:
      "services",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.catering",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-birthdays",

    routeKey:
      "birthdays",

    label: {
      pl: "Urodziny",
      es: "Cumpleaños",
      en: "Birthdays",
    },

    description: {
      pl:
        "Świętuj z kolumbijskim jedzeniem i wyjątkową atmosferą.",

      es:
        "Celebra con comida colombiana y una experiencia especial.",

      en:
        "Celebrate with Colombian food and a special experience.",
    },

    icon:
      "cake",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.birthdays",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-corporate",

    routeKey:
      "corporate",

    label: {
      pl: "Dla firm",
      es: "Empresas",
      en: "Corporate",
    },

    description: {
      pl:
        "Catering, spotkania i rozwiązania dla firm.",

      es:
        "Catering, reuniones y soluciones para empresas.",

      en:
        "Catering, meetings and solutions for companies.",
    },

    icon:
      "business",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.corporate",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-families",

    routeKey:
      "families",

    label: {
      pl: "Dla rodzin",
      es: "Familias",
      en: "Families",
    },

    description: {
      pl:
        "Kolumbijskie doświadczenia dla rodzin i bliskich.",

      es:
        "Experiencias colombianas para familias y seres queridos.",

      en:
        "Colombian experiences for families and loved ones.",
    },

    icon:
      "family",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.families",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-breakfasts",

    routeKey:
      "breakfasts",

    label: {
      pl: "Śniadania",
      es: "Desayunos",
      en: "Breakfasts",
    },

    description: {
      pl:
        "Kolumbijskie śniadania i specjalne zestawy.",

      es:
        "Desayunos colombianos y propuestas especiales.",

      en:
        "Colombian breakfasts and special options.",
    },

    icon:
      "breakfast",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.breakfasts",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-surprise-breakfasts",

    routeKey:
      "surprise_breakfasts",

    label: {
      pl:
        "Śniadania niespodzianki",

      es:
        "Desayunos sorpresa",

      en:
        "Surprise breakfasts",
    },

    description: {
      pl:
        "Wyjątkowy prezent dla bliskiej osoby.",

      es:
        "Una experiencia especial para sorprender a alguien.",

      en:
        "A special way to surprise someone.",
    },

    icon:
      "gift",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.surprise_breakfasts",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-table-decorations",

    routeKey:
      "table_decorations",

    label: {
      pl:
        "Dekoracje stołów",

      es:
        "Decoración de mesas",

      en:
        "Table decorations",
    },

    description: {
      pl:
        "Dekoracje na romantyczne chwile i uroczystości.",

      es:
        "Decoraciones para celebraciones y momentos especiales.",

      en:
        "Decorations for celebrations and special moments.",
    },

    icon:
      "decoration",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.table_decorations",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-bakery",

    routeKey:
      "bakery",

    label: {
      pl:
        "Piekarnia",

      es:
        "Panadería",

      en:
        "Bakery",
    },

    description: {
      pl:
        "Kolumbijskie wypieki, desery i specjalne zamówienia.",

      es:
        "Panadería colombiana, postres y pedidos especiales.",

      en:
        "Colombian bakery, desserts and special orders.",
    },

    icon:
      "bakery",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.bakery",

    children:
      [],
  }),


  navigationItem({
    id:
      "service-events",

    routeKey:
      "events",

    label: {
      pl:
        "Wydarzenia",

      es:
        "Eventos",

      en:
        "Events",
    },

    description: {
      pl:
        "Poznaj wydarzenia i doświadczenia Rincón Colombiano.",

      es:
        "Descubre eventos y experiencias de Rincón Colombiano.",

      en:
        "Discover Rincón Colombiano events and experiences.",
    },

    icon:
      "events",

    emphasis:
      "default",

    analyticsKey:
      "navigation.services.events",

    children:
      [],
  }),
];


/* ============================================================
   HEADER NAVIGATION
   ============================================================ */

/**
 * No llenamos el header con todo.
 *
 * Es una navegación de marca/conversión,
 * no un sitemap visual.
 */

export const headerNavigationItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "header-menu",

    routeKey:
      "menu",

    label: {
      pl: "Menu",
      es: "Menú",
      en: "Menu",
    },

    description:
      null,

    icon:
      "menu",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.menu",

    children:
      [],
  }),


  navigationItem({
    id:
      "header-services",

    routeKey:
      "services",

    label: {
      pl: "Usługi",
      es: "Servicios",
      en: "Services",
    },

    description:
      null,

    icon:
      "services",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.services",

    children:
      serviceNavigationItems,
  }),


  navigationItem({
    id:
      "header-locations",

    routeKey:
      "locations",

    label: {
      pl: "Lokale",
      es: "Restaurantes",
      en: "Locations",
    },

    description:
      null,

    icon:
      "location",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.locations",

    children:
      [],
  }),


  navigationItem({
    id:
      "header-reservations",

    routeKey:
      "reservations",

    label: {
      pl: "Rezerwacje",
      es: "Reservas",
      en: "Reservations",
    },

    description:
      null,

    icon:
      "calendar",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.reservations",

    children:
      [],
  }),


  navigationItem({
    id:
      "header-community",

    routeKey:
      "community",

    label: {
      pl: "Społeczność",
      es: "Comunidad",
      en: "Community",
    },

    description:
      null,

    icon:
      "community",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.community",

    children:
      [],
  }),


  navigationItem({
    id:
      "header-loyalty",

    routeKey:
      "loyalty",

    label: {
      pl: "Nagrody",
      es: "Recompensas",
      en: "Rewards",
    },

    description:
      null,

    icon:
      "gift",

    emphasis:
      "default",

    analyticsKey:
      "navigation.header.loyalty",

    children:
      [],
  }),
];


/* ============================================================
   HEADER PRIMARY CTA
   ============================================================ */

export const headerPrimaryAction:
  NavigationItem =
  navigationItem({
    id:
      "header-order",

    routeKey:
      "order",

    label: {
      pl: "Zamów",
      es: "Pedir",
      en: "Order",
    },

    description:
      null,

    icon:
      "shopping_bag",

    emphasis:
      "primary",

    analyticsKey:
      "navigation.header.order",

    children:
      [],
  });


/* ============================================================
   HEADER UTILITIES
   ============================================================ */

export const headerUtilityItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "utility-search",

    routeKey:
      "search",

    label: {
      pl: "Szukaj",
      es: "Buscar",
      en: "Search",
    },

    description:
      null,

    icon:
      "search",

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.utility.search",

    children:
      [],
  }),


  navigationItem({
    id:
      "utility-ai",

    routeKey:
      "ai",

    label: {
      pl: "Rincón AI",
      es: "Rincón AI",
      en: "Rincón AI",
    },

    description:
      null,

    icon:
      "ai",

    emphasis:
      "secondary",

    analyticsKey:
      "navigation.utility.ai",

    children:
      [],
  }),


  navigationItem({
    id:
      "utility-account",

    routeKey:
      "account",

    label: {
      pl: "Moje konto",
      es: "Mi cuenta",
      en: "My account",
    },

    description:
      null,

    icon:
      "account",

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.utility.account",

    children:
      [],
  }),
];


/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */

export const mobileNavigationItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "mobile-home",

    routeKey:
      "home",

    label: {
      pl: "Start",
      es: "Inicio",
      en: "Home",
    },

    description:
      null,

    icon:
      "home",

    emphasis:
      "default",

    analyticsKey:
      "navigation.mobile.home",

    children:
      [],
  }),

  ...headerNavigationItems,

  navigationItem({
    id:
      "mobile-referrals",

    routeKey:
      "referrals",

    label: {
      pl: "Poleć znajomego",
      es: "Refiere a un amigo",
      en: "Refer a friend",
    },

    description:
      null,

    icon:
      "referral",

    emphasis:
      "default",

    analyticsKey:
      "navigation.mobile.referrals",

    children:
      [],
  }),


  navigationItem({
    id:
      "mobile-ai",

    routeKey:
      "ai",

    label: {
      pl: "Rincón AI",
      es: "Rincón AI",
      en: "Rincón AI",
    },

    description:
      null,

    icon:
      "ai",

    emphasis:
      "secondary",

    analyticsKey:
      "navigation.mobile.ai",

    children:
      [],
  }),


  navigationItem({
    id:
      "mobile-contact",

    routeKey:
      "contact",

    label: {
      pl: "Kontakt",
      es: "Contáctanos",
      en: "Contact",
    },

    description:
      null,

    icon:
      "contact",

    emphasis:
      "default",

    analyticsKey:
      "navigation.mobile.contact",

    children:
      [],
  }),
];


/* ============================================================
   CUSTOMER ACCOUNT NAVIGATION
   ============================================================ */

export const accountNavigationItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "account-home",

    routeKey:
      "account",

    label: {
      pl: "Moje konto",
      es: "Mi cuenta",
      en: "My account",
    },

    description:
      null,

    icon:
      "account",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.home",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-orders",

    routeKey:
      "account_orders",

    label: {
      pl: "Zamówienia",
      es: "Pedidos",
      en: "Orders",
    },

    description:
      null,

    icon:
      "shopping_bag",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.orders",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-reservations",

    routeKey:
      "account_reservations",

    label: {
      pl: "Rezerwacje",
      es: "Reservas",
      en: "Reservations",
    },

    description:
      null,

    icon:
      "calendar",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.reservations",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-rewards",

    routeKey:
      "account_rewards",

    label: {
      pl: "Nagrody",
      es: "Recompensas",
      en: "Rewards",
    },

    description:
      null,

    icon:
      "gift",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.rewards",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-referrals",

    routeKey:
      "account_referrals",

    label: {
      pl: "Polecenia",
      es: "Referidos",
      en: "Referrals",
    },

    description:
      null,

    icon:
      "referral",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.referrals",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-profile",

    routeKey:
      "account_profile",

    label: {
      pl: "Profil",
      es: "Perfil",
      en: "Profile",
    },

    description:
      null,

    icon:
      "account",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.profile",

    children:
      [],
  }),


  navigationItem({
    id:
      "account-privacy",

    routeKey:
      "account_privacy",

    label: {
      pl: "Prywatność",
      es: "Privacidad",
      en: "Privacy",
    },

    description:
      null,

    icon:
      "privacy",

    emphasis:
      "default",

    analyticsKey:
      "navigation.account.privacy",

    children:
      [],
  }),
];


/* ============================================================
   FOOTER — DISCOVER
   ============================================================ */

const footerDiscoverItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "footer-menu",

    routeKey:
      "menu",

    label: {
      pl: "Menu",
      es: "Menú",
      en: "Menu",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.menu",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-order",

    routeKey:
      "order",

    label: {
      pl: "Zamów",
      es: "Pedir",
      en: "Order",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.order",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-locations",

    routeKey:
      "locations",

    label: {
      pl: "Lokale",
      es: "Restaurantes",
      en: "Locations",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.locations",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-reservations",

    routeKey:
      "reservations",

    label: {
      pl: "Rezerwacje",
      es: "Reservas",
      en: "Reservations",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.reservations",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-reviews",

    routeKey:
      "reviews",

    label: {
      pl: "Opinie",
      es: "Opiniones",
      en: "Reviews",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.reviews",

    children:
      [],
  }),
];


/* ============================================================
   FOOTER — COMMUNITY
   ============================================================ */

const footerCommunityItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "footer-community",

    routeKey:
      "community",

    label: {
      pl: "Społeczność",
      es: "Comunidad",
      en: "Community",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.community",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-loyalty",

    routeKey:
      "loyalty",

    label: {
      pl: "Nagrody",
      es: "Recompensas",
      en: "Rewards",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.loyalty",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-referrals",

    routeKey:
      "referrals",

    label: {
      pl: "Poleć znajomego",
      es: "Refiere a un amigo",
      en: "Refer a friend",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.referrals",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-ai",

    routeKey:
      "ai",

    label: {
      pl: "Rincón AI",
      es: "Rincón AI",
      en: "Rincón AI",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.ai",

    children:
      [],
  }),
];


/* ============================================================
   FOOTER — COMPANY
   ============================================================ */

const footerCompanyItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "footer-about",

    routeKey:
      "about",

    label: {
      pl: "O nas",
      es: "Nosotros",
      en: "About us",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.about",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-contact",

    routeKey:
      "contact",

    label: {
      pl: "Kontakt",
      es: "Contáctanos",
      en: "Contact",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.contact",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-suggestions",

    routeKey:
      "suggestions",

    label: {
      pl: "Sugestie",
      es: "Sugerencias",
      en: "Suggestions",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.suggestions",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-careers",

    routeKey:
      "careers",

    label: {
      pl: "Kariera",
      es: "Trabaja con nosotros",
      en: "Careers",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "default",

    analyticsKey:
      "navigation.footer.careers",

    children:
      [],
  }),
];


/* ============================================================
   FOOTER — LEGAL
   ============================================================ */

const footerLegalItems:
  readonly NavigationItem[] = [

  navigationItem({
    id:
      "footer-legal",

    routeKey:
      "legal",

    label: {
      pl: "Informacje prawne",
      es: "Centro legal",
      en: "Legal center",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.legal",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-terms",

    routeKey:
      "terms",

    label: {
      pl: "Regulamin",
      es: "Términos y condiciones",
      en: "Terms and conditions",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.terms",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-sales-terms",

    routeKey:
      "sales_terms",

    label: {
      pl: "Warunki sprzedaży",
      es: "Condiciones de venta",
      en: "Sales terms",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.sales_terms",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-privacy",

    routeKey:
      "privacy",

    label: {
      pl: "Polityka prywatności",
      es: "Privacidad",
      en: "Privacy",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.privacy",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-cookies",

    routeKey:
      "cookies",

    label: {
      pl: "Polityka cookies",
      es: "Cookies",
      en: "Cookies",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.cookies",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-accessibility",

    routeKey:
      "accessibility",

    label: {
      pl: "Dostępność",
      es: "Accesibilidad",
      en: "Accessibility",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.accessibility",

    children:
      [],
  }),


  navigationItem({
    id:
      "footer-complaints",

    routeKey:
      "complaints",

    label: {
      pl: "Reklamacje",
      es: "Reclamaciones",
      en: "Complaints",
    },

    description:
      null,

    icon:
      null,

    emphasis:
      "subtle",

    analyticsKey:
      "navigation.footer.complaints",

    children:
      [],
  }),
];


/* ============================================================
   FOOTER SECTIONS
   ============================================================ */

export const footerNavigationSections:
  readonly FooterNavigationSection[] = [

  {
    id:
      "discover",

    title: {
      pl: "Odkrywaj",
      es: "Descubre",
      en: "Discover",
    },

    items:
      footerDiscoverItems,

    sortOrder:
      10,
  },


  {
    id:
      "services",

    title: {
      pl: "Usługi",
      es: "Servicios",
      en: "Services",
    },

    items:
      serviceNavigationItems,

    sortOrder:
      20,
  },


  {
    id:
      "community",

    title: {
      pl: "Rincón",
      es: "Rincón",
      en: "Rincón",
    },

    items:
      footerCommunityItems,

    sortOrder:
      30,
  },


  {
    id:
      "company",

    title: {
      pl: "Firma",
      es: "Empresa",
      en: "Company",
    },

    items:
      footerCompanyItems,

    sortOrder:
      40,
  },


  {
    id:
      "legal",

    title: {
      pl: "Prawo i prywatność",
      es: "Legal y privacidad",
      en: "Legal & privacy",
    },

    items:
      footerLegalItems,

    sortOrder:
      50,
  },
];


/* ============================================================
   FEATURE AVAILABILITY
   ============================================================ */

export function isNavigationRouteAvailable(
  routeKey:
    RouteKey,
  context:
    NavigationContext,
): boolean {
  const route =
    getRoute(
      routeKey,
    );

  if (
    route.access ===
      "admin"
  ) {
    return false;
  }

  if (
    route.access ===
      "authenticated" &&
    !context.authenticated
  ) {
    return false;
  }

  if (
    route.featureFlag &&
    !context.enabledFeatures.has(
      route.featureFlag,
    )
  ) {
    return false;
  }

  return true;
}


/* ============================================================
   RESOLVE ONE ITEM
   ============================================================ */

export function resolveNavigationItem(
  item:
    NavigationItem,
  context:
    NavigationContext,
): ResolvedNavigationItem | null {
  if (
    !isNavigationRouteAvailable(
      item.routeKey,
      context,
    )
  ) {
    return null;
  }

  const route =
    getRoute(
      item.routeKey,
    );

  if (
    route.dynamic
  ) {
    throw new Error(
      `Dynamic route "${item.routeKey}" cannot be resolved without parameters in global navigation.`,
    );
  }

  const children =
    item.children
      .map(
        (child) =>
          resolveNavigationItem(
            child,
            context,
          ),
      )
      .filter(
        (
          child,
        ): child is ResolvedNavigationItem =>
          child !== null,
      );

  return {
    id:
      item.id,

    routeKey:
      item.routeKey,

    label:
      item.label[
        context.locale
      ],

    description:
      item.description
        ? item.description[
            context.locale
          ]
        : null,

    href:
      buildRoutePath(
        item.routeKey,
        context.locale,
      ),

    icon:
      item.icon,

    emphasis:
      item.emphasis,

    analyticsKey:
      item.analyticsKey,

    children,
  };
}


/* ============================================================
   RESOLVE ITEM COLLECTION
   ============================================================ */

export function resolveNavigationItems(
  items:
    readonly NavigationItem[],
  context:
    NavigationContext,
): readonly ResolvedNavigationItem[] {
  return items
    .map(
      (item) =>
        resolveNavigationItem(
          item,
          context,
        ),
    )
    .filter(
      (
        item,
      ): item is ResolvedNavigationItem =>
        item !== null,
    );
}


/* ============================================================
   RESOLVE HEADER
   ============================================================ */

export function resolveHeaderNavigation(
  context:
    NavigationContext,
): readonly ResolvedNavigationItem[] {
  return resolveNavigationItems(
    headerNavigationItems,
    context,
  );
}


/* ============================================================
   RESOLVE HEADER CTA
   ============================================================ */

export function resolveHeaderPrimaryAction(
  context:
    NavigationContext,
): ResolvedNavigationItem | null {
  return resolveNavigationItem(
    headerPrimaryAction,
    context,
  );
}


/* ============================================================
   RESOLVE UTILITIES
   ============================================================ */

export function resolveHeaderUtilityNavigation(
  context:
    NavigationContext,
): readonly ResolvedNavigationItem[] {
  return resolveNavigationItems(
    headerUtilityItems,
    context,
  );
}


/* ============================================================
   RESOLVE MOBILE
   ============================================================ */

export function resolveMobileNavigation(
  context:
    NavigationContext,
): readonly ResolvedNavigationItem[] {
  return resolveNavigationItems(
    mobileNavigationItems,
    context,
  );
}


/* ============================================================
   RESOLVE ACCOUNT
   ============================================================ */

export function resolveAccountNavigation(
  context:
    NavigationContext,
): readonly ResolvedNavigationItem[] {
  if (
    !context.authenticated
  ) {
    return [];
  }

  return resolveNavigationItems(
    accountNavigationItems,
    context,
  );
}


/* ============================================================
   RESOLVE FOOTER
   ============================================================ */

export function resolveFooterNavigation(
  context:
    NavigationContext,
): readonly ResolvedFooterNavigationSection[] {
  return footerNavigationSections
    .map(
      (
        section,
      ): ResolvedFooterNavigationSection => ({
        id:
          section.id,

        title:
          section.title[
            context.locale
          ],

        items:
          resolveNavigationItems(
            section.items,
            context,
          ),

        sortOrder:
          section.sortOrder,
      }),
    )
    .filter(
      (section) =>
        section.items.length >
        0,
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.sortOrder -
        right.sortOrder,
    );
}
