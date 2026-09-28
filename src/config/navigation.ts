/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Navigation Configuration
 * ============================================================
 *
 * Fuente central de navegación pública.
 *
 * Objetivos:
 * - Evitar enlaces duplicados en componentes.
 * - Mantener Header, Mobile Menu y Footer sincronizados.
 * - Integrar feature flags.
 * - Preparar internacionalización.
 * - Preparar múltiples sedes.
 * - Mantener rutas tipadas y consistentes.
 *
 * IMPORTANTE:
 * Los textos visibles se moverán posteriormente al sistema
 * de traducciones PL / ES / EN.
 */

import type {
  FeatureFlags,
} from "@/config/site";

import {
  siteConfig,
} from "@/config/site";


/* ============================================================
   TYPES
   ============================================================ */

export type NavigationFeature =
  keyof FeatureFlags;

export type NavigationPlacement =
  | "header"
  | "mobile"
  | "footer"
  | "legal";

export type NavigationIntent =
  | "default"
  | "primary"
  | "secondary";

export interface NavigationItem {
  /**
   * ID estable.
   *
   * Nunca utilizar el label visible como identificador.
   */
  readonly id: string;

  /**
   * Texto temporal.
   *
   * Posteriormente será reemplazado por translationKey.
   */
  readonly label: string;

  /**
   * Clave que utilizaremos posteriormente con i18n.
   */
  readonly translationKey: string;

  /**
   * Ruta interna o URL externa.
   */
  readonly href: string;

  /**
   * Posiciones en las que debe aparecer.
   */
  readonly placements: readonly NavigationPlacement[];

  /**
   * Apariencia/intención del enlace.
   */
  readonly intent: NavigationIntent;

  /**
   * Feature flag asociado.
   *
   * Si no existe, el enlace siempre puede mostrarse.
   */
  readonly feature?: NavigationFeature;

  /**
   * URL externa.
   */
  readonly external?: boolean;

  /**
   * Abrir en nueva pestaña.
   *
   * Solo debe utilizarse cuando realmente tenga sentido.
   */
  readonly openInNewTab?: boolean;

  /**
   * Evita indexación de enlaces específicos si fuera necesario.
   */
  readonly noFollow?: boolean;

  /**
   * Orden lógico.
   */
  readonly order: number;
}


/* ============================================================
   ROUTES
   ============================================================ */

/**
 * Fuente central de rutas públicas.
 *
 * Cuando implementemos i18n:
 *
 * /pl/menu
 * /es/menu
 * /en/menu
 *
 * estas rutas se resolverán mediante una capa de routing.
 */
export const routes = {
  home: "/",

  menu: "/menu",

  order: "/zamow",

  delivery: "/dostawa",

  reservations: "/rezerwacje",

  catering: "/catering",

  about: "/o-nas",

  locations: "/lokale",

  contact: "/kontakt",

  privacy: "/polityka-prywatnosci",

  terms: "/regulamin",
} as const;


/* ============================================================
   PRIMARY NAVIGATION
   ============================================================ */

export const navigationItems = [
  {
    id: "nav-menu",

    label: "Menu",

    translationKey:
      "navigation.menu",

    href:
      routes.menu,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "default",

    feature:
      "menu",

    order: 10,
  },

  {
    id: "nav-locations",

    label: "Lokale",

    translationKey:
      "navigation.locations",

    href:
      routes.locations,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "default",

    feature:
      "locations",

    order: 20,
  },

  {
    id: "nav-catering",

    label: "Catering",

    translationKey:
      "navigation.catering",

    href:
      routes.catering,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "default",

    feature:
      "catering",

    order: 30,
  },

  {
    id: "nav-about",

    label: "O nas",

    translationKey:
      "navigation.about",

    href:
      routes.about,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "default",

    order: 40,
  },

  {
    id: "nav-contact",

    label: "Kontakt",

    translationKey:
      "navigation.contact",

    href:
      routes.contact,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "default",

    order: 50,
  },

  {
    id: "nav-reservations",

    label: "Rezerwacje",

    translationKey:
      "navigation.reservations",

    href:
      routes.reservations,

    placements: [
      "mobile",
      "footer",
    ],

    intent:
      "secondary",

    feature:
      "reservations",

    order: 60,
  },

  {
    id: "nav-delivery",

    label: "Dostawa",

    translationKey:
      "navigation.delivery",

    href:
      routes.delivery,

    placements: [
      "mobile",
      "footer",
    ],

    intent:
      "secondary",

    feature:
      "delivery",

    order: 70,
  },

  {
    id: "nav-order",

    label: "Zamów online",

    translationKey:
      "navigation.order",

    href:
      routes.order,

    placements: [
      "header",
      "mobile",
      "footer",
    ],

    intent:
      "primary",

    feature:
      "onlineOrdering",

    order: 100,
  },
] as const satisfies readonly NavigationItem[];


/* ============================================================
   LEGAL NAVIGATION
   ============================================================ */

export const legalNavigationItems = [
  {
    id: "nav-privacy",

    label:
      "Polityka prywatności",

    translationKey:
      "navigation.privacy",

    href:
      routes.privacy,

    placements: [
      "legal",
      "footer",
    ],

    intent:
      "default",

    order: 10,
  },

  {
    id: "nav-terms",

    label:
      "Regulamin",

    translationKey:
      "navigation.terms",

    href:
      routes.terms,

    placements: [
      "legal",
      "footer",
    ],

    intent:
      "default",

    order: 20,
  },
] as const satisfies readonly NavigationItem[];


/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Comprueba si el feature flag del enlace está activo.
 */
export function isNavigationItemEnabled(
  item: NavigationItem,
): boolean {
  if (!item.feature) {
    return true;
  }

  return siteConfig.features[
    item.feature
  ];
}


/**
 * Devuelve navegación activa y ordenada
 * para una posición concreta.
 */
export function getNavigationByPlacement(
  placement: NavigationPlacement,
): readonly NavigationItem[] {
  return [
    ...navigationItems,
    ...legalNavigationItems,
  ]
    .filter(
      (item) =>
        item.placements.includes(
          placement,
        ),
    )
    .filter(
      isNavigationItemEnabled,
    )
    .sort(
      (a, b) =>
        a.order - b.order,
    );
}


/**
 * Navegación del header de escritorio.
 */
export function getHeaderNavigation():
  readonly NavigationItem[] {
  return getNavigationByPlacement(
    "header",
  );
}


/**
 * Navegación móvil.
 */
export function getMobileNavigation():
  readonly NavigationItem[] {
  return getNavigationByPlacement(
    "mobile",
  );
}


/**
 * Navegación principal del footer.
 */
export function getFooterNavigation():
  readonly NavigationItem[] {
  return getNavigationByPlacement(
    "footer",
  );
}


/**
 * Navegación legal.
 */
export function getLegalNavigation():
  readonly NavigationItem[] {
  return getNavigationByPlacement(
    "legal",
  );
}


/**
 * Devuelve únicamente el CTA principal de pedido.
 */
export function getPrimaryNavigationAction():
  NavigationItem | undefined {
  return getHeaderNavigation().find(
    (item) =>
      item.intent === "primary",
  );
}


/**
 * Comprueba si una URL corresponde a una ruta interna.
 */
export function isInternalHref(
  href: string,
): boolean {
  return (
    href.startsWith("/") &&
    !href.startsWith("//")
  );
}


/**
 * Construye atributos seguros para links externos.
 *
 * Esto evita repetir:
 *
 * target="_blank"
 * rel="noopener noreferrer"
 */
export function getExternalLinkProps(
  item: NavigationItem,
): Readonly<{
  target?: "_blank";
  rel?: string;
}> {
  if (
    !item.external ||
    !item.openInNewTab
  ) {
    return {};
  }

  const relValues = [
    "noopener",
    "noreferrer",
  ];

  if (item.noFollow) {
    relValues.push(
      "nofollow",
    );
  }

  return {
    target: "_blank",
    rel: relValues.join(" "),
  };
}
