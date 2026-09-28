/**
 * ============================================================
 * RINCÓN COLOMBIANO
 * Enterprise SEO Configuration & Metadata Engine
 * ============================================================
 *
 * Sistema central de SEO técnico.
 *
 * Responsable de:
 *
 * - metadata
 * - titles
 * - descriptions
 * - canonical URLs
 * - hreflang
 * - robots
 * - Open Graph
 * - social cards
 * - PL / ES / EN
 * - rutas públicas
 * - páginas dinámicas
 * - restaurantes
 * - servicios
 * - structured data
 *
 * PRINCIPIOS:
 *
 * 1. Una URL pública importante tiene canonical estable.
 * 2. PL / ES / EN tienen alternates/hreflang.
 * 3. Search, cuenta, admin y referidos personales = noindex.
 * 4. Preview/development nunca deben indexarse.
 * 5. Metadata no debe contener información inventada.
 * 6. Ratings solo se publican cuando provienen de datos reales.
 * 7. No utilizamos meta keywords: no aportan valor SEO real.
 * 8. UGC se indexa únicamente cuando supera las reglas
 *    de publicación, privacidad, moderación y calidad.
 * 9. URLs provienen de routes.ts.
 */

import type {
  Metadata,
} from "next";

import type {
  SupportedLocale,
} from "@/config/site";

import {
  buildRoutePath,
  getRoute,
  type RouteKey,
} from "@/config/routes";


/* ============================================================
   GLOBAL SEO CONSTANTS
   ============================================================ */

export const SEO_SITE_NAME =
  "Rincón Colombiano";

export const SEO_PRODUCTION_ORIGIN =
  "https://rinconcolombiano.pl";

export const SEO_DEFAULT_LOCALE:
  SupportedLocale =
  "pl";


/* ============================================================
   RUNTIME ORIGIN
   ============================================================ */

/**
 * NEXT_PUBLIC_SITE_URL puede utilizarse para preview
 * o entornos personalizados.
 *
 * En producción la URL canónica esperada es:
 *
 * https://rinconcolombiano.pl
 */

function normalizeOrigin(
  value:
    string,
): string {
  return value
    .trim()
    .replace(
      /\/+$/,
      "",
    );
}


export const SEO_ORIGIN =
  normalizeOrigin(
    process.env[
      "NEXT_PUBLIC_SITE_URL"
    ] ??
      SEO_PRODUCTION_ORIGIN,
  );


/* ============================================================
   PRODUCTION CHECK
   ============================================================ */

export function isSeoProductionEnvironment():
  boolean {
const vercelEnvironment =
  process.env[
    "VERCEL_ENV"
  ];

  if (
    vercelEnvironment
  ) {
    return (
      vercelEnvironment ===
      "production"
    );
  }

  return (
    process.env.NODE_ENV ===
    "production"
  );
}


/* ============================================================
   LOCALE METADATA
   ============================================================ */

export const seoLocaleConfig:
  Readonly<
    Record<
      SupportedLocale,
      {
        readonly hreflang:
          string;

        readonly openGraphLocale:
          string;

        readonly languageName:
          string;

        readonly cityName:
          string;
      }
    >
  > = {

  pl: {
    hreflang:
      "pl-PL",

    openGraphLocale:
      "pl_PL",

    languageName:
      "Polski",

    cityName:
      "Warszawa",
  },

  es: {
    hreflang:
      "es",

    openGraphLocale:
      "es_ES",

    languageName:
      "Español",

    cityName:
      "Varsovia",
  },

  en: {
    hreflang:
      "en",

    openGraphLocale:
      "en_US",

    languageName:
      "English",

    cityName:
      "Warsaw",
  },
};


/* ============================================================
   SEO IMAGE
   ============================================================ */

export interface SeoImage {
  readonly url:
    string;

  readonly width?:
    number;

  readonly height?:
    number;

  readonly alt?:
    string;

  readonly type?:
    string;
}


/* ============================================================
   LOCALIZED SEO COPY
   ============================================================ */

export interface LocalizedSeoCopy {
  readonly title:
    string;

  readonly description:
    string;
}


/* ============================================================
   PAGE SEO INPUT
   ============================================================ */

export interface PageSeoInput {
  readonly locale:
    SupportedLocale;

  /**
   * Preferir routeKey.
   *
   * path existe para casos editoriales/especiales.
   */
  readonly routeKey?:
    RouteKey;

  readonly params?:
    Readonly<
      Record<
        string,
        string | number
      >
    >;

  readonly path?:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly images?:
    readonly SeoImage[];

  /**
   * Permite hacer noindex de una página que normalmente
   * sería indexable.
   *
   * Para rutas con runtimeIndexability=true,
   * debe indicarse explícitamente true.
   */
  readonly indexable?:
    boolean;

  readonly canonicalOverride?:
    string;

  readonly publishedAt?:
    string;

  readonly modifiedAt?:
    string;

  readonly authors?:
    readonly string[];

  readonly contentType?:
    "website" | "article";
}


/* ============================================================
   RESTAURANT SEO INPUT
   ============================================================ */

export interface RestaurantSeoInput {
  readonly locale:
    SupportedLocale;

  readonly slug:
    string;

  readonly name:
    string;

  readonly description:
    string;

  readonly streetAddress:
    string;

  readonly addressLocality:
    string;

  readonly postalCode?:
    string;

  readonly countryCode:
    string;

  readonly phone?:
    string;

  readonly latitude?:
    number;

  readonly longitude?:
    number;

  readonly images?:
    readonly SeoImage[];

  readonly openingHours?:
    readonly string[];

  readonly indexable:
    boolean;
}


/* ============================================================
   SERVICE SEO INPUT
   ============================================================ */

export interface ServiceSeoInput {
  readonly locale:
    SupportedLocale;

  readonly routeKey:
    RouteKey;

  readonly name:
    string;

  readonly description:
    string;

  readonly images?:
    readonly SeoImage[];

  readonly indexable?:
    boolean;
}


/* ============================================================
   BREADCRUMB INPUT
   ============================================================ */

export interface SeoBreadcrumbItem {
  readonly name:
    string;

  readonly url:
    string;
}


/* ============================================================
   ABSOLUTE URL
   ============================================================ */

export function buildAbsoluteUrl(
  path:
    string,
): string {
  if (
    /^https?:\/\//i.test(
      path,
    )
  ) {
    return path;
  }

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return (
    `${SEO_ORIGIN}${normalizedPath}`
  );
}


/* ============================================================
   CANONICAL
   ============================================================ */

export function buildCanonicalUrl(
  routeKey:
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
  return buildAbsoluteUrl(
    buildRoutePath(
      routeKey,
      locale,
      params,
    ),
  );
}


/* ============================================================
   OPEN GRAPH LOCALES
   ============================================================ */

function getAlternateOpenGraphLocales(
  locale:
    SupportedLocale,
): string[] {
  return (
    Object.entries(
      seoLocaleConfig,
    )
      .filter(
        ([key]) =>
          key !== locale,
      )
      .map(
        (
          [
            ,
            config,
          ],
        ) =>
          config
            .openGraphLocale,
      )
  );
}


/* ============================================================
   HREFLANG ALTERNATES
   ============================================================ */

export function buildLocalizedAlternates(
  routeKey:
    RouteKey,
  params:
    Readonly<
      Record<
        string,
        string | number
      >
    > = {},
): Readonly<
  Record<
    string,
    string
  >
> {
  const result:
    Record<
      string,
      string
    > = {};

  (
    [
      "pl",
      "es",
      "en",
    ] as const
  ).forEach(
    (locale) => {
      result[
        seoLocaleConfig[
          locale
        ].hreflang
      ] =
        buildCanonicalUrl(
          routeKey,
          locale,
          params,
        );
    },
  );

  result["x-default"] =
    buildCanonicalUrl(
      routeKey,
      SEO_DEFAULT_LOCALE,
      params,
    );

  return result;
}


/* ============================================================
   ROBOTS
   ============================================================ */

export function buildRobotsMetadata(
  index:
    boolean,
  follow:
    boolean,
): NonNullable<
  Metadata["robots"]
> {
  return {
    index,
    follow,
googleBot: {
  index,
  follow,

  "max-image-preview":
    "large",

  "max-snippet":
    -1,

  "max-video-preview":
    -1,
},
  };
}


/* ============================================================
   ROUTE INDEXABILITY
   ============================================================ */

export function resolveRouteIndexability(
  routeKey:
    RouteKey,
  runtimeIndexable:
    boolean | undefined,
): boolean {
  if (
    !isSeoProductionEnvironment()
  ) {
    return false;
  }

  const route =
    getRoute(
      routeKey,
    );

  if (
    route.access !== "public"
  ) {
    return false;
  }

  if (
    route.seo
      .runtimeIndexability
  ) {
    return (
      runtimeIndexable ===
      true
    );
  }

  if (
    runtimeIndexable ===
    false
  ) {
    return false;
  }

  return route.seo.index;
}


/* ============================================================
   IMAGE NORMALIZATION
   ============================================================ */
interface NormalizedSeoImage {
  url:
    string;

  width?:
    number;

  height?:
    number;

  alt?:
    string;

  type?:
    string;
}


function normalizeSeoImages(
  images:
    readonly SeoImage[],
): NormalizedSeoImage[] {
  return images.map(
    (image): NormalizedSeoImage => ({
      url:
        buildAbsoluteUrl(
          image.url,
        ),

      ...(
        image.width !==
        undefined
          ? {
              width:
                image.width,
            }
          : {}
      ),

      ...(
        image.height !==
        undefined
          ? {
              height:
                image.height,
            }
          : {}
      ),

      ...(
        image.alt !==
        undefined
          ? {
              alt:
                image.alt,
            }
          : {}
      ),

      ...(
        image.type !==
        undefined
          ? {
              type:
                image.type,
            }
          : {}
      ),
    }),
  );
}

/* ============================================================
   GENERIC PAGE METADATA
   ============================================================ */

export function buildPageMetadata(
  input:
    PageSeoInput,
): Metadata {
  const route =
    input.routeKey
      ? getRoute(
          input.routeKey,
        )
      : null;

  const params =
    input.params ??
    {};

  const canonical =
    input.canonicalOverride
      ? buildAbsoluteUrl(
          input.canonicalOverride,
        )
      : input.routeKey
        ? buildCanonicalUrl(
            input.routeKey,
            input.locale,
            params,
          )
        : buildAbsoluteUrl(
            input.path ??
            buildRoutePath(
              "home",
              input.locale,
            ),
          );

  const index =
    input.routeKey
      ? resolveRouteIndexability(
          input.routeKey,
          input.indexable,
        )
      : (
          isSeoProductionEnvironment() &&
          input.indexable !==
            false
        );

  const follow =
    route
      ? (
          index
            ? route.seo.follow
            : (
                route.access ===
                "public"
                  ? route.seo.follow
                  : false
              )
        )
      : index;

  const images =
    normalizeSeoImages(
      input.images ??
      [],
    );

  const alternates =
    input.routeKey
      ? {
          canonical,

          languages:
            buildLocalizedAlternates(
              input.routeKey,
              params,
            ),
        }
      : {
          canonical,
        };

  const openGraphType =
    input.contentType ===
      "article"
      ? "article"
      : "website";

  return {
    metadataBase:
      new URL(
        SEO_ORIGIN,
      ),

    title:
      input.title,

    description:
      input.description,

    alternates,

    robots:
      buildRobotsMetadata(
        index,
        follow,
      ),

    openGraph: {
      type:
        openGraphType,

      siteName:
        SEO_SITE_NAME,

      title:
        input.title,

      description:
        input.description,

      url:
        canonical,

      locale:
        seoLocaleConfig[
          input.locale
        ].openGraphLocale,

      alternateLocale:
        getAlternateOpenGraphLocales(
          input.locale,
        ),

      ...(
        images.length > 0
          ? {
              images,
            }
          : {}
      ),

      ...(
        input.contentType ===
          "article" &&
        input.publishedAt
          ? {
              publishedTime:
                input.publishedAt,
            }
          : {}
      ),

      ...(
        input.contentType ===
          "article" &&
        input.modifiedAt
          ? {
              modifiedTime:
                input.modifiedAt,
            }
          : {}
      ),

      ...(
        input.contentType ===
          "article" &&
        input.authors &&
        input.authors.length >
          0
          ? {
authors:
  [
    ...input.authors,
  ],
            }
          : {}
      ),
    },

    twitter: {
      card:
        images.length > 0
          ? "summary_large_image"
          : "summary",

      title:
        input.title,

      description:
        input.description,

      ...(
        images.length > 0
          ? {
              images:
                images.map(
                  (image) =>
                    image.url,
                ),
            }
          : {}
      ),
    },
  };
}


/* ============================================================
   ROUTE SEO COPY
   ============================================================ */

export const routeSeoContent:
  Partial<
    Record<
      RouteKey,
      Readonly<
        Record<
          SupportedLocale,
          LocalizedSeoCopy
        >
      >
    >
  > = {

  home: {
    pl: {
      title:
        "Rincón Colombiano | Kuchnia kolumbijska w Warszawie",

      description:
        "Poznaj Rincón Colombiano w Warszawie: autentyczna kuchnia kolumbijska, zamówienia, catering, wydarzenia, rezerwacje, społeczność i wyjątkowe doświadczenia.",
    },

    es: {
      title:
        "Rincón Colombiano | Gastronomía colombiana en Varsovia",

      description:
        "Descubre Rincón Colombiano en Varsovia: gastronomía colombiana, pedidos, catering, eventos, reservas, comunidad y experiencias especiales.",
    },

    en: {
      title:
        "Rincón Colombiano | Colombian food in Warsaw",

      description:
        "Discover Rincón Colombiano in Warsaw: Colombian food, ordering, catering, events, reservations, community and special experiences.",
    },
  },


  menu: {
    pl: {
      title:
        "Menu kolumbijskie w Warszawie | Rincón Colombiano",

      description:
        "Poznaj menu Rincón Colombiano: kolumbijskie dania, przekąski, napoje i aktualna oferta dostępna w naszych lokalach w Warszawie.",
    },

    es: {
      title:
        "Menú colombiano en Varsovia | Rincón Colombiano",

      description:
        "Descubre el menú de Rincón Colombiano: platos colombianos, entradas, bebidas y la oferta disponible en nuestros restaurantes de Varsovia.",
    },

    en: {
      title:
        "Colombian menu in Warsaw | Rincón Colombiano",

      description:
        "Explore Rincón Colombiano's menu with Colombian dishes, snacks, drinks and the current offer available at our Warsaw locations.",
    },
  },


  order: {
    pl: {
      title:
        "Zamów jedzenie kolumbijskie | Rincón Colombiano",

      description:
        "Zamów kolumbijskie jedzenie bezpośrednio w Rincón Colombiano i wybierz dostępny sposób odbioru lub dostawy.",
    },

    es: {
      title:
        "Pedir comida colombiana | Rincón Colombiano",

      description:
        "Pide comida colombiana directamente con Rincón Colombiano y elige las opciones disponibles de recogida o entrega.",
    },

    en: {
      title:
        "Order Colombian food | Rincón Colombiano",

      description:
        "Order Colombian food directly from Rincón Colombiano and choose from the available pickup or delivery options.",
    },
  },


  delivery: {
    pl: {
      title:
        "Dostawa kuchni kolumbijskiej w Warszawie | Rincón Colombiano",

      description:
        "Sprawdź dostępność dostawy Rincón Colombiano w Warszawie, warunki zamówienia oraz aktualne opcje dostawy.",
    },

    es: {
      title:
        "Domicilios de comida colombiana en Varsovia | Rincón Colombiano",

      description:
        "Consulta la disponibilidad de entrega de Rincón Colombiano en Varsovia y las opciones actuales para recibir tu pedido.",
    },

    en: {
      title:
        "Colombian food delivery in Warsaw | Rincón Colombiano",

      description:
        "Check Rincón Colombiano delivery availability in Warsaw and the current options for receiving your order.",
    },
  },


  services: {
    pl: {
      title:
        "Usługi i wydarzenia | Rincón Colombiano Warszawa",

      description:
        "Catering, urodziny, wydarzenia firmowe, rodzinne spotkania, śniadania, dekoracje i inne kolumbijskie doświadczenia w Warszawie.",
    },

    es: {
      title:
        "Servicios y eventos | Rincón Colombiano Varsovia",

      description:
        "Catering, cumpleaños, eventos empresariales, reuniones familiares, desayunos, decoración y experiencias colombianas en Varsovia.",
    },

    en: {
      title:
        "Services and events | Rincón Colombiano Warsaw",

      description:
        "Catering, birthdays, corporate events, family gatherings, breakfasts, decorations and Colombian experiences in Warsaw.",
    },
  },


  catering: {
    pl: {
      title:
        "Catering kolumbijski w Warszawie | Rincón Colombiano",

      description:
        "Kolumbijski catering na wydarzenia prywatne, firmowe i kulturalne w Warszawie. Skontaktuj się z Rincón Colombiano i opowiedz nam o swoim wydarzeniu.",
    },

    es: {
      title:
        "Catering colombiano en Varsovia | Rincón Colombiano",

      description:
        "Catering colombiano para eventos privados, empresariales y culturales en Varsovia. Cuéntanos qué necesitas y solicita información.",
    },

    en: {
      title:
        "Colombian catering in Warsaw | Rincón Colombiano",

      description:
        "Colombian catering for private, corporate and cultural events in Warsaw. Tell Rincón Colombiano about your event and request information.",
    },
  },


  birthdays: {
    pl: {
      title:
        "Urodziny z kolumbijskim smakiem | Rincón Colombiano",

      description:
        "Zorganizuj urodziny z kolumbijskim jedzeniem, wyjątkową atmosferą i dodatkowymi usługami dopasowanymi do Twojego wydarzenia.",
    },

    es: {
      title:
        "Cumpleaños con sabor colombiano | Rincón Colombiano",

      description:
        "Celebra cumpleaños con gastronomía colombiana, un ambiente especial y servicios adicionales adaptados a tu celebración.",
    },

    en: {
      title:
        "Colombian birthday celebrations | Rincón Colombiano",

      description:
        "Celebrate birthdays with Colombian food, a special atmosphere and additional services tailored to your celebration.",
    },
  },


  corporate: {
    pl: {
      title:
        "Catering i wydarzenia dla firm | Rincón Colombiano",

      description:
        "Kolumbijska gastronomia dla firm: catering, spotkania, wydarzenia zespołowe i rozwiązania dopasowane do potrzeb organizacji.",
    },

    es: {
      title:
        "Catering y eventos para empresas | Rincón Colombiano",

      description:
        "Gastronomía colombiana para empresas: catering, reuniones, eventos de equipo y soluciones adaptadas a cada organización.",
    },

    en: {
      title:
        "Corporate catering and events | Rincón Colombiano",

      description:
        "Colombian food for companies: catering, meetings, team events and solutions tailored to each organization.",
    },
  },


  families: {
    pl: {
      title:
        "Kolumbijskie doświadczenia dla rodzin | Rincón Colombiano",

      description:
        "Rodzinne spotkania, wspólne posiłki i wydarzenia z kolumbijskim smakiem w Rincón Colombiano.",
    },

    es: {
      title:
        "Experiencias colombianas para familias | Rincón Colombiano",

      description:
        "Encuentros familiares, comidas para compartir y celebraciones con sabor colombiano en Rincón Colombiano.",
    },

    en: {
      title:
        "Colombian experiences for families | Rincón Colombiano",

      description:
        "Family gatherings, shared meals and celebrations with Colombian flavor at Rincón Colombiano.",
    },
  },


  breakfasts: {
    pl: {
      title:
        "Kolumbijskie śniadania w Warszawie | Rincón Colombiano",

      description:
        "Poznaj kolumbijskie śniadania, specjalne zestawy i nowe propozycje Rincón Colombiano w Warszawie.",
    },

    es: {
      title:
        "Desayunos colombianos en Varsovia | Rincón Colombiano",

      description:
        "Descubre desayunos colombianos, propuestas especiales y nuevas experiencias de Rincón Colombiano en Varsovia.",
    },

    en: {
      title:
        "Colombian breakfasts in Warsaw | Rincón Colombiano",

      description:
        "Discover Colombian breakfasts, special options and new Rincón Colombiano experiences in Warsaw.",
    },
  },


  surprise_breakfasts: {
    pl: {
      title:
        "Śniadania niespodzianki w Warszawie | Rincón Colombiano",

      description:
        "Zaskocz bliską osobę wyjątkowym śniadaniem inspirowanym Kolumbią. Skontaktuj się z Rincón Colombiano, aby ustalić szczegóły.",
    },

    es: {
      title:
        "Desayunos sorpresa en Varsovia | Rincón Colombiano",

      description:
        "Sorprende a alguien especial con un desayuno inspirado en Colombia. Contacta con Rincón Colombiano para organizar los detalles.",
    },

    en: {
      title:
        "Surprise breakfasts in Warsaw | Rincón Colombiano",

      description:
        "Surprise someone special with a Colombian-inspired breakfast. Contact Rincón Colombiano to arrange the details.",
    },
  },


  table_decorations: {
    pl: {
      title:
        "Dekoracje stołów i wyjątkowe chwile | Rincón Colombiano",

      description:
        "Dekoracje stołów na urodziny, romantyczne chwile i specjalne wydarzenia organizowane z Rincón Colombiano.",
    },

    es: {
      title:
        "Decoración de mesas y momentos especiales | Rincón Colombiano",

      description:
        "Decoración de mesas para cumpleaños, momentos románticos y celebraciones especiales con Rincón Colombiano.",
    },

    en: {
      title:
        "Table decorations and special moments | Rincón Colombiano",

      description:
        "Table decorations for birthdays, romantic moments and special celebrations with Rincón Colombiano.",
    },
  },


  bakery: {
    pl: {
      title:
        "Kolumbijska piekarnia i desery | Rincón Colombiano",

      description:
        "Odkrywaj kolumbijskie wypieki, desery oraz specjalne zamówienia przygotowywane przez Rincón Colombiano.",
    },

    es: {
      title:
        "Panadería y postres colombianos | Rincón Colombiano",

      description:
        "Descubre panadería colombiana, postres y pedidos especiales preparados por Rincón Colombiano.",
    },

    en: {
      title:
        "Colombian bakery and desserts | Rincón Colombiano",

      description:
        "Discover Colombian bakery products, desserts and special orders prepared by Rincón Colombiano.",
    },
  },


  events: {
    pl: {
      title:
        "Wydarzenia | Rincón Colombiano Warszawa",

      description:
        "Poznaj wydarzenia, spotkania kulturalne i doświadczenia organizowane przez Rincón Colombiano.",
    },

    es: {
      title:
        "Eventos | Rincón Colombiano Varsovia",

      description:
        "Descubre eventos, encuentros culturales y experiencias organizadas por Rincón Colombiano.",
    },

    en: {
      title:
        "Events | Rincón Colombiano Warsaw",

      description:
        "Discover events, cultural gatherings and experiences organized by Rincón Colombiano.",
    },
  },


  locations: {
    pl: {
      title:
        "Lokale Rincón Colombiano w Warszawie",

      description:
        "Znajdź lokale Rincón Colombiano w Warszawie, sprawdź adresy, dostępne usługi, godziny oraz informacje o każdej lokalizacji.",
    },

    es: {
      title:
        "Restaurantes Rincón Colombiano en Varsovia",

      description:
        "Encuentra los restaurantes Rincón Colombiano en Varsovia y consulta direcciones, servicios, horarios e información de cada ubicación.",
    },

    en: {
      title:
        "Rincón Colombiano locations in Warsaw",

      description:
        "Find Rincón Colombiano locations in Warsaw and check addresses, services, opening hours and information for each location.",
    },
  },


  reservations: {
    pl: {
      title:
        "Rezerwacje | Rincón Colombiano Warszawa",

      description:
        "Sprawdź dostępność i zarezerwuj wizytę w wybranym lokalu Rincón Colombiano.",
    },

    es: {
      title:
        "Reservas | Rincón Colombiano Varsovia",

      description:
        "Consulta disponibilidad y reserva tu visita en el restaurante Rincón Colombiano que elijas.",
    },

    en: {
      title:
        "Reservations | Rincón Colombiano Warsaw",

      description:
        "Check availability and reserve your visit at the Rincón Colombiano location of your choice.",
    },
  },


  about: {
    pl: {
      title:
        "O nas | Historia Rincón Colombiano",

      description:
        "Poznaj historię Rincón Colombiano, naszą drogę, kulturę oraz misję dzielenia się kolumbijską gastronomią.",
    },

    es: {
      title:
        "Nosotros | Historia de Rincón Colombiano",

      description:
        "Conoce la historia de Rincón Colombiano, nuestro camino, nuestra cultura y la misión de compartir la gastronomía colombiana.",
    },

    en: {
      title:
        "About us | The Rincón Colombiano story",

      description:
        "Discover the story of Rincón Colombiano, our journey, culture and mission to share Colombian food.",
    },
  },


  contact: {
    pl: {
      title:
        "Kontakt | Rincón Colombiano",

      description:
        "Skontaktuj się z Rincón Colombiano w sprawie zamówień, rezerwacji, cateringu, wydarzeń, współpracy, opinii lub innych pytań.",
    },

    es: {
      title:
        "Contáctanos | Rincón Colombiano",

      description:
        "Contacta con Rincón Colombiano para pedidos, reservas, catering, eventos, colaboraciones, opiniones o cualquier otra consulta.",
    },

    en: {
      title:
        "Contact us | Rincón Colombiano",

      description:
        "Contact Rincón Colombiano about orders, reservations, catering, events, partnerships, feedback or other questions.",
    },
  },


  reviews: {
    pl: {
      title:
        "Opinie klientów | Rincón Colombiano",

      description:
        "Poznaj opublikowane opinie i doświadczenia klientów Rincón Colombiano.",
    },

    es: {
      title:
        "Opiniones de clientes | Rincón Colombiano",

      description:
        "Conoce opiniones publicadas y experiencias de clientes de Rincón Colombiano.",
    },

    en: {
      title:
        "Customer reviews | Rincón Colombiano",

      description:
        "Discover published reviews and experiences from Rincón Colombiano customers.",
    },
  },


  suggestions: {
    pl: {
      title:
        "Sugestie | Rincón Colombiano",

      description:
        "Podziel się sugestią i pomóż nam ulepszać doświadczenie Rincón Colombiano.",
    },

    es: {
      title:
        "Sugerencias | Rincón Colombiano",

      description:
        "Déjanos una sugerencia y ayúdanos a mejorar la experiencia de Rincón Colombiano.",
    },

    en: {
      title:
        "Suggestions | Rincón Colombiano",

      description:
        "Share a suggestion and help us improve the Rincón Colombiano experience.",
    },
  },


  careers: {
    pl: {
      title:
        "Kariera | Dołącz do Rincón Colombiano",

      description:
        "Poznaj możliwości pracy i współpracy z Rincón Colombiano oraz wyślij swoją kandydaturę.",
    },

    es: {
      title:
        "Trabaja con nosotros | Rincón Colombiano",

      description:
        "Descubre oportunidades para trabajar y crecer con Rincón Colombiano y envíanos tu candidatura.",
    },

    en: {
      title:
        "Careers | Join Rincón Colombiano",

      description:
        "Discover opportunities to work and grow with Rincón Colombiano and submit your application.",
    },
  },


  community: {
    pl: {
      title:
        "Społeczność Rincón Colombiano",

      description:
        "Dołącz do społeczności Rincón Colombiano, odkrywaj historie, wydarzenia, kulturę, gastronomię i treści publikowane przez społeczność.",
    },

    es: {
      title:
        "Comunidad Rincón Colombiano",

      description:
        "Únete a la comunidad Rincón Colombiano y descubre historias, eventos, cultura, gastronomía y contenido de la comunidad.",
    },

    en: {
      title:
        "Rincón Colombiano community",

      description:
        "Join the Rincón Colombiano community and discover stories, events, culture, food and community content.",
    },
  },


  loyalty: {
    pl: {
      title:
        "Nagrody i program lojalnościowy | Rincón Colombiano",

      description:
        "Poznaj program nagród Rincón Colombiano, zdobywaj korzyści za zakupy i sprawdzaj dostępne nagrody.",
    },

    es: {
      title:
        "Recompensas y fidelización | Rincón Colombiano",

      description:
        "Descubre el programa de recompensas de Rincón Colombiano, recibe beneficios por tus compras y consulta tus premios.",
    },

    en: {
      title:
        "Rewards and loyalty | Rincón Colombiano",

      description:
        "Discover the Rincón Colombiano rewards program, earn benefits from purchases and explore available rewards.",
    },
  },


  referrals: {
    pl: {
      title:
        "Poleć znajomego | Rincón Colombiano",

      description:
        "Poznaj program poleceń Rincón Colombiano i zasady otrzymywania nagród za skuteczne polecenia.",
    },

    es: {
      title:
        "Refiere a un amigo | Rincón Colombiano",

      description:
        "Conoce el programa de referidos de Rincón Colombiano y las condiciones para recibir recompensas por invitaciones válidas.",
    },

    en: {
      title:
        "Refer a friend | Rincón Colombiano",

      description:
        "Learn about the Rincón Colombiano referral program and the conditions for earning rewards from successful referrals.",
    },
  },


  ai: {
    pl: {
      title:
        "Rincón AI | Wirtualny asystent Rincón Colombiano",

      description:
        "Porozmawiaj z Rincón AI o menu, zamówieniach, rezerwacjach, wydarzeniach, nagrodach i usługach Rincón Colombiano.",
    },

    es: {
      title:
        "Rincón AI | Asistente virtual de Rincón Colombiano",

      description:
        "Habla con Rincón AI sobre menú, pedidos, reservas, eventos, recompensas y servicios de Rincón Colombiano.",
    },

    en: {
      title:
        "Rincón AI | Rincón Colombiano virtual assistant",

      description:
        "Talk to Rincón AI about the menu, orders, reservations, events, rewards and Rincón Colombiano services.",
    },
  },
};


/* ============================================================
   GET ROUTE SEO COPY
   ============================================================ */

export function getRouteSeoCopy(
  routeKey:
    RouteKey,
  locale:
    SupportedLocale,
): LocalizedSeoCopy | null {
  return (
    routeSeoContent[
      routeKey
    ]?.[
      locale
    ] ??
    null
  );
}


/* ============================================================
   BUILD ROUTE METADATA
   ============================================================ */

export function buildRouteMetadata(
  routeKey:
    RouteKey,
  locale:
    SupportedLocale,
  options: {
    readonly params?:
      Readonly<
        Record<
          string,
          string | number
        >
      >;

    readonly title?:
      string;

    readonly description?:
      string;

    readonly images?:
      readonly SeoImage[];

    readonly indexable?:
      boolean;
  } = {},
): Metadata {
  const copy =
    getRouteSeoCopy(
      routeKey,
      locale,
    );

  const title =
    options.title ??
    copy?.title ??
    SEO_SITE_NAME;

  const description =
    options.description ??
    copy?.description ??
    (
      locale === "pl"
        ? "Oficjalna strona Rincón Colombiano."
        : locale === "es"
          ? "Sitio oficial de Rincón Colombiano."
          : "Official Rincón Colombiano website."
    );

  return buildPageMetadata({
    locale,

    routeKey,

    ...(options.params
      ? {
          params:
            options.params,
        }
      : {}),

    title,

    description,

    ...(options.images
      ? {
          images:
            options.images,
        }
      : {}),

    ...(options.indexable !==
      undefined
      ? {
          indexable:
            options.indexable,
        }
      : {}),
  });
}


/* ============================================================
   HOME METADATA
   ============================================================ */

export function buildHomeMetadata(
  locale:
    SupportedLocale =
      SEO_DEFAULT_LOCALE,
): Metadata {
  return buildRouteMetadata(
    "home",
    locale,
  );
}


/* ============================================================
   MENU METADATA
   ============================================================ */

export function buildMenuMetadata(
  locale:
    SupportedLocale =
      SEO_DEFAULT_LOCALE,
): Metadata {
  return buildRouteMetadata(
    "menu",
    locale,
  );
}


/* ============================================================
   CATERING METADATA
   ============================================================ */

export function buildCateringMetadata(
  locale:
    SupportedLocale =
      SEO_DEFAULT_LOCALE,
): Metadata {
  return buildRouteMetadata(
    "catering",
    locale,
  );
}


/* ============================================================
   RESTAURANT METADATA
   ============================================================ */

export function buildRestaurantMetadata(
  input:
    RestaurantSeoInput,
): Metadata {
  const city =
    seoLocaleConfig[
      input.locale
    ].cityName;

  const title =
    `${input.name} | ${city}`;

  return buildPageMetadata({
    locale:
      input.locale,

    routeKey:
      "location",

    params: {
      slug:
        input.slug,
    },

    title,

    description:
      input.description,

    indexable:
      input.indexable,

    ...(input.images
      ? {
          images:
            input.images,
        }
      : {}),
  });
}


/* ============================================================
   SERVICE METADATA
   ============================================================ */

export function buildServiceMetadata(
  input:
    ServiceSeoInput,
): Metadata {
  return buildRouteMetadata(
    input.routeKey,
    input.locale,
    {
      title:
        input.name,

      description:
        input.description,

      ...(input.images
        ? {
            images:
              input.images,
          }
        : {}),

      ...(input.indexable !==
        undefined
        ? {
            indexable:
              input.indexable,
          }
        : {}),
    },
  );
}


/* ============================================================
   JSON-LD BASE TYPE
   ============================================================ */

export type JsonLdObject =
  Readonly<
    Record<
      string,
      unknown
    >
  >;


/* ============================================================
   ORGANIZATION JSON-LD
   ============================================================ */

export function buildOrganizationJsonLd(
  input: {
    readonly logoUrl?:
      string;

    readonly sameAs?:
      readonly string[];

    readonly email?:
      string;

    readonly phone?:
      string;
  } = {},
): JsonLdObject {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "Organization",

    "@id":
      `${SEO_PRODUCTION_ORIGIN}/#organization`,

    name:
      SEO_SITE_NAME,

    url:
      SEO_PRODUCTION_ORIGIN,

    ...(input.logoUrl
      ? {
          logo:
            buildAbsoluteUrl(
              input.logoUrl,
            ),
        }
      : {}),

    ...(input.sameAs &&
    input.sameAs.length > 0
      ? {
          sameAs:
            input.sameAs,
        }
      : {}),

    ...(input.email
      ? {
          email:
            input.email,
        }
      : {}),

    ...(input.phone
      ? {
          telephone:
            input.phone,
        }
      : {}),
  };
}


/* ============================================================
   WEBSITE JSON-LD
   ============================================================ */

export function buildWebsiteJsonLd(
  locale:
    SupportedLocale,
): JsonLdObject {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "WebSite",

    "@id":
      `${SEO_PRODUCTION_ORIGIN}/#website`,

    url:
      buildCanonicalUrl(
        "home",
        locale,
      ),

    name:
      SEO_SITE_NAME,

    inLanguage:
      seoLocaleConfig[
        locale
      ].hreflang,

    publisher: {
      "@id":
        `${SEO_PRODUCTION_ORIGIN}/#organization`,
    },
  };
}


/* ============================================================
   RESTAURANT JSON-LD
   ============================================================ */

export function buildRestaurantJsonLd(
  input:
    RestaurantSeoInput,
): JsonLdObject {
  const restaurantUrl =
    buildCanonicalUrl(
      "location",
      input.locale,
      {
        slug:
          input.slug,
      },
    );

  return {
    "@context":
      "https://schema.org",

    "@type":
      "Restaurant",

    "@id":
      `${restaurantUrl}#restaurant`,

    name:
      input.name,

    description:
      input.description,

    url:
      restaurantUrl,

    servesCuisine: [
      "Colombian",
    ],

    address: {
      "@type":
        "PostalAddress",

      streetAddress:
        input.streetAddress,

      addressLocality:
        input.addressLocality,

      addressCountry:
        input.countryCode,

      ...(input.postalCode
        ? {
            postalCode:
              input.postalCode,
          }
        : {}),
    },

    ...(input.phone
      ? {
          telephone:
            input.phone,
        }
      : {}),

    ...(
      input.latitude !==
        undefined &&
      input.longitude !==
        undefined
        ? {
            geo: {
              "@type":
                "GeoCoordinates",

              latitude:
                input.latitude,

              longitude:
                input.longitude,
            },
          }
        : {}
    ),

    ...(input.images &&
    input.images.length > 0
      ? {
          image:
            input.images.map(
              (image) =>
                buildAbsoluteUrl(
                  image.url,
                ),
            ),
        }
      : {}),

    ...(input.openingHours &&
    input.openingHours.length > 0
      ? {
          openingHours:
            input.openingHours,
        }
      : {}),

    menu:
      buildCanonicalUrl(
        "menu",
        input.locale,
      ),
  };
}


/* ============================================================
   SERVICE JSON-LD
   ============================================================ */

export function buildServiceJsonLd(
  input:
    ServiceSeoInput,
): JsonLdObject {
  const url =
    buildCanonicalUrl(
      input.routeKey,
      input.locale,
    );

  return {
    "@context":
      "https://schema.org",

    "@type":
      "Service",

    "@id":
      `${url}#service`,

    name:
      input.name,

    description:
      input.description,

    url,

    provider: {
      "@id":
        `${SEO_PRODUCTION_ORIGIN}/#organization`,
    },

    areaServed: {
      "@type":
        "City",

      name:
        seoLocaleConfig[
          input.locale
        ].cityName,
    },
  };
}


/* ============================================================
   BREADCRUMB JSON-LD
   ============================================================ */

export function buildBreadcrumbJsonLd(
  items:
    readonly SeoBreadcrumbItem[],
): JsonLdObject {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement:
      items.map(
        (
          item,
          index,
        ) => ({
          "@type":
            "ListItem",

          position:
            index + 1,

          name:
            item.name,

          item:
            buildAbsoluteUrl(
              item.url,
            ),
        }),
      ),
  };
}


/* ============================================================
   JSON-LD SERIALIZATION
   ============================================================ */

/**
 * Serialización segura para:
 *
 * <script type="application/ld+json">
 *
 * Reemplazamos "<" para evitar que contenido inesperado
 * pueda cerrar la etiqueta script.
 */

export function serializeJsonLd(
  value:
    JsonLdObject,
): string {
  return JSON.stringify(
    value,
  ).replace(
    /</g,
    "\\u003c",
  );
}


/* ============================================================
   SEO CONFIG EXPORT
   ============================================================ */

export const seoConfig = {
  siteName:
    SEO_SITE_NAME,

  origin:
    SEO_ORIGIN,

  productionOrigin:
    SEO_PRODUCTION_ORIGIN,

  defaultLocale:
    SEO_DEFAULT_LOCALE,

  locales:
    seoLocaleConfig,
} as const;
