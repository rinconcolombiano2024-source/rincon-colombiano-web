import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import { validPublishedSeo } from "@/config/seo-cms";
import { getPublishedCmsTextContent } from "@/lib/cms/public-content";
import { getBrandOpenGraphImage, getPrimaryBrandLogo } from "@/lib/brand/public-brand";

import {
  buildBreadcrumbJsonLd,
  buildRestaurantJsonLd,
  buildRestaurantMetadata,
  serializeJsonLd,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  getPublicRestaurants,
  type DayOfWeek,
  type RestaurantConfig,
  type RestaurantStatus,
} from "@/config/restaurants";

import {
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
  type RcOrderaLocationKey,
} from "@/integrations/rc-ordera/config";


/* ============================================================
   TYPES
   ============================================================ */

interface RestaurantPageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;

      readonly slug:
        string[];
    }>;
}


interface RestaurantPageCopy {
  readonly back:
    string;

  readonly eyebrow:
    string;

  readonly addressLabel:
    string;

  readonly hoursLabel:
    string;

  readonly hoursUnavailable:
    string;

  readonly servicesLabel:
    string;

  readonly servicesUnavailable:
    string;

  readonly order:
    string;

  readonly menu:
    string;

  readonly maps:
    string;

  readonly phone:
    string;

  readonly email:
    string;

  readonly statusOpen:
    string;

  readonly statusComingSoon:
    string;

  readonly statusTemporary:
    string;

  readonly statusClosed:
    string;

  readonly cuisineTitle:
    string;

  readonly cuisineDescription:
    string;

  readonly locationTitle:
    string;

  readonly locationDescription:
    string;

  readonly availabilityNote:
    string;

  readonly services: {
    readonly dineIn:
      string;

    readonly pickup:
      string;

    readonly delivery:
      string;

    readonly reservations:
      string;

    readonly catering:
      string;
  };

  readonly days:
    Readonly<
      Record<
        DayOfWeek,
        string
      >
    >;

  readonly closed:
    string;
}


interface RestaurantStaticParam {
  readonly locale:
    AppLocale;

  readonly slug:
    string[];
}


/* ============================================================
   LOCALIZED COPY
   ============================================================ */

const restaurantPageContent:
  Readonly<
    Record<
      AppLocale,
      RestaurantPageCopy
    >
  > = {
  pl: {
    back:
      "Wróć do strony głównej",

    eyebrow:
      "Restauracja kolumbijska • Warszawa",

    addressLabel:
      "Adres",

    hoursLabel:
      "Godziny otwarcia",

    hoursUnavailable:
      "Godziny otwarcia zostaną opublikowane, gdy lokal będzie gotowy do obsługi klientów.",

    servicesLabel:
      "Usługi",

    servicesUnavailable:
      "Dostępne usługi zostaną opublikowane przed uruchomieniem lokalu.",

    order:
      "Zamów online",

    menu:
      "Zobacz menu",

    maps:
      "Otwórz w Mapach Google",

    phone:
      "Zadzwoń",

    email:
      "Napisz do nas",

    statusOpen:
      "Otwarte",

    statusComingSoon:
      "Otwarcie wkrótce",

    statusTemporary:
      "Tymczasowo zamknięte",

    statusClosed:
      "Zamknięte",

    cuisineTitle:
      "Autentyczne smaki Kolumbii w Warszawie",

    cuisineDescription:
      "Rincón Colombiano łączy kolumbijską kuchnię, kulturę i gościnność. Wśród smaków kojarzonych z naszą ofertą są między innymi tamal tolimense, lechona, arepy, bandeja paisa, empanadas, buñuelos i caldo de costilla.",

    locationTitle:
      "Kolumbijska i latynoska atmosfera w Warszawie",

    locationDescription:
      "To miejsce dla osób szukających kolumbijskiego jedzenia, latynoskiej atmosfery, spotkań z rodziną i przyjaciółmi, cateringu oraz doświadczeń związanych z kulturą Kolumbii.",

    availabilityNote:
      "Dostępność dań może zmieniać się w ciągu dnia. Aktualne produkty i ceny sprawdzisz w menu, a szczegóły potwierdzisz przy składaniu zamówienia.",

    services: {
      dineIn:
        "Na miejscu",

      pickup:
        "Odbiór osobisty",

      delivery:
        "Dostawa",

      reservations:
        "Rezerwacje",

      catering:
        "Catering",
    },

    days: {
      monday:
        "Poniedziałek",

      tuesday:
        "Wtorek",

      wednesday:
        "Środa",

      thursday:
        "Czwartek",

      friday:
        "Piątek",

      saturday:
        "Sobota",

      sunday:
        "Niedziela",
    },

    closed:
      "Zamknięte",
  },


  es: {
    back:
      "Volver al inicio",

    eyebrow:
      "Restaurante colombiano • Varsovia",

    addressLabel:
      "Dirección",

    hoursLabel:
      "Horario",

    hoursUnavailable:
      "El horario se publicará cuando esta sede esté lista para atender al público.",

    servicesLabel:
      "Servicios",

    servicesUnavailable:
      "Los servicios disponibles se publicarán antes de la apertura de esta sede.",

    order:
      "Pedir en línea",

    menu:
      "Ver menú",

    maps:
      "Abrir en Google Maps",

    phone:
      "Llamar",

    email:
      "Escribirnos",

    statusOpen:
      "Abierto",

    statusComingSoon:
      "Próximamente",

    statusTemporary:
      "Cerrado temporalmente",

    statusClosed:
      "Cerrado",

    cuisineTitle:
      "Sabores auténticos de Colombia en Varsovia",

    cuisineDescription:
      "Rincón Colombiano reúne gastronomía, cultura y hospitalidad colombiana. Entre los sabores asociados con nuestra propuesta se encuentran tamal tolimense, lechona, arepas, bandeja paisa, empanadas, buñuelos y caldo de costilla.",

    locationTitle:
      "Ambiente colombiano y latino en Varsovia",

    locationDescription:
      "Un espacio para quienes buscan comida colombiana, ambiente latino, reuniones con familia y amigos, catering y experiencias relacionadas con la cultura de Colombia.",

    availabilityNote:
      "La disponibilidad de algunos platos puede variar durante el día. Consulta el menú y confirma el precio y la disponibilidad al hacer tu pedido.",

    services: {
      dineIn:
        "Comer en el restaurante",

      pickup:
        "Recogida",

      delivery:
        "Entrega",

      reservations:
        "Reservas",

      catering:
        "Catering",
    },

    days: {
      monday:
        "Lunes",

      tuesday:
        "Martes",

      wednesday:
        "Miércoles",

      thursday:
        "Jueves",

      friday:
        "Viernes",

      saturday:
        "Sábado",

      sunday:
        "Domingo",
    },

    closed:
      "Cerrado",
  },


  en: {
    back:
      "Back to home",

    eyebrow:
      "Colombian restaurant • Warsaw",

    addressLabel:
      "Address",

    hoursLabel:
      "Opening hours",

    hoursUnavailable:
      "Opening hours will be published when this location is ready to welcome customers.",

    servicesLabel:
      "Services",

    servicesUnavailable:
      "Available services will be published before this location opens.",

    order:
      "Order online",

    menu:
      "View menu",

    maps:
      "Open in Google Maps",

    phone:
      "Call",

    email:
      "Email us",

    statusOpen:
      "Open",

    statusComingSoon:
      "Coming soon",

    statusTemporary:
      "Temporarily closed",

    statusClosed:
      "Closed",

    cuisineTitle:
      "Authentic Colombian flavors in Warsaw",

    cuisineDescription:
      "Rincón Colombiano brings together Colombian food, culture and hospitality. Flavors associated with our offer include tamal tolimense, lechona, arepas, bandeja paisa, empanadas, buñuelos and caldo de costilla.",

    locationTitle:
      "Colombian and Latin atmosphere in Warsaw",

    locationDescription:
      "A place for people looking for Colombian food, a Latin atmosphere, meals with family and friends, catering and experiences connected with Colombian culture.",

    availabilityNote:
      "Some dishes may sell out during the day. Explore our menu and confirm the final price and availability when ordering.",

    services: {
      dineIn:
        "Dine in",

      pickup:
        "Pickup",

      delivery:
        "Delivery",

      reservations:
        "Reservations",

      catering:
        "Catering",
    },

    days: {
      monday:
        "Monday",

      tuesday:
        "Tuesday",

      wednesday:
        "Wednesday",

      thursday:
        "Thursday",

      friday:
        "Friday",

      saturday:
        "Saturday",

      sunday:
        "Sunday",
    },

    closed:
      "Closed",
  },
};


/* ============================================================
   CONSTANTS
   ============================================================ */

const DAYS:
  readonly DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];


const SCHEMA_DAY:
  Readonly<
    Record<
      DayOfWeek,
      string
    >
  > = {
  monday:
    "Mo",

  tuesday:
    "Tu",

  wednesday:
    "We",

  thursday:
    "Th",

  friday:
    "Fr",

  saturday:
    "Sa",

  sunday:
    "Su",
};


/* ============================================================
   ROUTE HELPERS
   ============================================================ */

function getDecodedRouteSegments(
  path:
    string,
): readonly string[] {
  return path
    .split("/")
    .filter(
      Boolean,
    )
    .map(
      (
        segment,
      ) => {
        try {
          return decodeURIComponent(
            segment,
          );
        } catch {
          return segment;
        }
      },
    );
}


function routeSegmentsMatch(
  current:
    readonly string[],
  expected:
    readonly string[],
): boolean {
  return (
    current.length ===
      expected.length &&
    current.every(
      (
        segment,
        index,
      ) =>
        segment ===
        expected[
          index
        ],
    )
  );
}


function isOrderRoute(
  locale:
    AppLocale,
  slugSegments:
    readonly string[],
): boolean {
  const orderPath =
    buildRoutePath(
      "order",
      locale,
    );

  const expectedSegments =
    getDecodedRouteSegments(
      orderPath,
    ).slice(
      1,
    );

  return routeSegmentsMatch(
    slugSegments,
    expectedSegments,
  );
}


/**
 * The existing homepage already contains the public contact surface and
 * genuine WhatsApp/email CTAs. Honor registered /pl/kontakt, /es/contacto
 * and /en/contact URLs without creating a misleading, nonfunctional form.
 */
function isContactRoute(
  locale: AppLocale,
  slugSegments: readonly string[],
): boolean {
  const contactPath = buildRoutePath("contact", locale);
  const expectedSegments = getDecodedRouteSegments(contactPath).slice(1);
  return routeSegmentsMatch(slugSegments, expectedSegments);
}


/**
 * Existing multilingual marketing sections are live on the homepage,
 * whereas some route-registry URLs were only planned and returned 404.
 * Redirect ONLY public informational routes with a REAL equivalent section,
 * without publishing empty landing pages or inventing service guarantees.
 *
 * Legal policies, checkout, authenticated accounts and content with no
 * published equivalent remain untouched and must never be redirected here.
 */
const PUBLISHED_SECTION_SHORTCUTS = [
  ["delivery", "order"],
  ["services", "services"],
  ["catering", "services"],
  ["birthdays", "services"],
  ["corporate", "services"],
  ["families", "services"],
  ["breakfasts", "services"],
  ["surprise_breakfasts", "services"],
  ["table_decorations", "services"],
  ["events", "events"],
  ["locations", "locations"],
  ["reservations", "contact"],
  ["about", "stories"],
  ["reviews", "reviews"],
  ["careers", "contact"],
  ["community", "community"],
  ["loyalty", "rewards"],
] as const;

function getPublishedSectionShortcut(
  locale: AppLocale,
  slugSegments: readonly string[],
): string | null {
  for (const [routeKey, section] of PUBLISHED_SECTION_SHORTCUTS) {
    const route = buildRoutePath(routeKey, locale);
    const expected = getDecodedRouteSegments(route).slice(1);
    if (routeSegmentsMatch(slugSegments, expected)) {
      return `${buildRoutePath("home", locale)}#${section}`;
    }
  }
  return null;
}


function getRestaurantFromRoute(
  locale:
    AppLocale,
  slugSegments:
    readonly string[],
): RestaurantConfig | null {
  if (
    slugSegments.length ===
      0
  ) {
    return null;
  }

  for (
    const restaurant of
      getPublicRestaurants()
  ) {
    const fullPath =
      buildRoutePath(
        "location",
        locale,
        {
          slug:
            restaurant.slug,
        },
      );

    const expectedSegments =
      getDecodedRouteSegments(
        fullPath,
      ).slice(
        1,
      );

    if (
      routeSegmentsMatch(
        slugSegments,
        expectedSegments,
      )
    ) {
      return restaurant;
    }
  }

  return null;
}


/* ============================================================
   RESTAURANT CONTENT
   ============================================================ */

function getRestaurantDescription(
  restaurant:
    RestaurantConfig,
  locale:
    AppLocale,
): string {
  if (
    restaurant.slug ===
      "czapelska"
  ) {
    if (
      locale ===
        "pl"
    ) {
      return "Rincón Colombiano przy Czapelskiej 33 w Warszawie to restauracja z autentyczną kuchnią kolumbijską, zamówieniami online, odbiorem osobistym, dostawą, rezerwacjami i cateringiem.";
    }

    if (
      locale ===
        "es"
    ) {
      return "Rincón Colombiano en Czapelska 33, Varsovia, es un restaurante de gastronomía colombiana con pedidos en línea, recogida, entrega, reservas y catering.";
    }

    return "Rincón Colombiano at Czapelska 33 in Warsaw is a Colombian restaurant offering online ordering, pickup, delivery, reservations and catering.";
  }

  if (
    locale ===
      "pl"
  ) {
    return restaurant
      .seo
      .description;
  }

  if (
    locale ===
      "es"
  ) {
    return `Rincón Colombiano en ${restaurant.address.street}, Varsovia. Nueva sede de nuestra marca colombiana.`;
  }

  return `Rincón Colombiano at ${restaurant.address.street} in Warsaw. A new location for our Colombian brand.`;
}


function getRestaurantMetadataName(
  restaurant:
    RestaurantConfig,
  locale:
    AppLocale,
): string {
  if (
    locale ===
      "pl"
  ) {
    return `${restaurant.shortName} | Restauracja kolumbijska`;
  }

  if (
    locale ===
      "es"
  ) {
    return `${restaurant.shortName} | Restaurante colombiano`;
  }

  return `${restaurant.shortName} | Colombian restaurant`;
}


/* ============================================================
   STATUS
   ============================================================ */

function getStatusLabel(
  status:
    RestaurantStatus,
  copy:
    RestaurantPageCopy,
): string {
  switch (
    status
  ) {
    case "open":
      return copy.statusOpen;

    case "coming_soon":
      return copy
        .statusComingSoon;

    case "temporarily_closed":
      return copy
        .statusTemporary;

    case "closed":
      return copy
        .statusClosed;
  }
}


function getStatusClassName(
  status:
    RestaurantStatus,
): string {
  switch (
    status
  ) {
    case "open":
      return "bg-emerald-100 text-emerald-900";

    case "coming_soon":
      return "bg-[#f7c600] text-[#12100e]";

    case "temporarily_closed":
      return "bg-[#c92d39]/10 text-[#8d2029]";

    case "closed":
      return "bg-[#12100e] text-white";
  }
}


/* ============================================================
   OPENING HOURS
   ============================================================ */

function buildOpeningHours(
  restaurant:
    RestaurantConfig,
): readonly string[] {
  const weeklyHours =
    restaurant
      .weeklyHours;

  if (
    !weeklyHours
  ) {
    return [];
  }

  return DAYS.flatMap(
    (
      day,
    ) => {
      const schedule =
        weeklyHours[
          day
        ];

      if (
        schedule.closed
      ) {
        return [];
      }

      return schedule
        .intervals
        .map(
          (
            interval,
          ) =>
            `${SCHEMA_DAY[day]} ${interval.opensAt}-${interval.closesAt}`,
        );
    },
  );
}


/* ============================================================
   RC ORDERA
   ============================================================ */

function getRcOrderaLocationKey(
  restaurant:
    RestaurantConfig,
): RcOrderaLocationKey | null {
  switch (
    restaurant.slug
  ) {
    case "czapelska":
      return "czapelska";

    case "brzeska":
      return "brzeska";

    default:
      return null;
  }
}


function getRestaurantOrderHref(
  restaurant:
    RestaurantConfig,
): string | null {
  if (
    restaurant.status !==
      "open"
  ) {
    return null;
  }

  const locationKey =
    getRcOrderaLocationKey(
      restaurant,
    );

  if (
    !locationKey
  ) {
    return null;
  }

  return buildRcOrderaOrderUrl(
    locationKey,
  );
}


/* ============================================================
   SERVICES
   ============================================================ */

function getActiveServices(
  restaurant:
    RestaurantConfig,
  copy:
    RestaurantPageCopy,
): readonly string[] {
  return [
    restaurant.services.dineIn
      ? copy.services.dineIn
      : null,

    restaurant.services.pickup
      ? copy.services.pickup
      : null,

    restaurant.services.delivery
      ? copy.services.delivery
      : null,

    restaurant.services.reservations
      ? copy.services.reservations
      : null,

    restaurant.services.catering
      ? copy.services.catering
      : null,
  ].filter(
    (
      service,
    ): service is string =>
      service !==
      null,
  );
}


/* ============================================================
   STATIC PARAMS
   ============================================================ */

/**
 * Next.js 16 exige que generateStaticParams() devuelva
 * un array mutable.
 *
 * RestaurantStaticParam puede seguir teniendo propiedades
 * readonly; únicamente el contenedor exterior debe cumplir
 * el contrato AppPageConfig generado por Next.
 */
export function generateStaticParams():
  RestaurantStaticParam[] {
  return SUPPORTED_LOCALES.flatMap((locale) => {
    // Explicitly prerender every supported public catch-all route. Relying
    // only on location slugs caused the published contact/order URLs to 404
    // in production builds, despite being recognized by the page resolver.
    const restaurantPaths = getPublicRestaurants().map((restaurant) => ({
      locale,
      slug: [
        ...getDecodedRouteSegments(
          buildRoutePath("location", locale, { slug: restaurant.slug }),
        ).slice(1),
      ],
    }));

    const supportedRedirects = ([
      "contact", "order",
      ...PUBLISHED_SECTION_SHORTCUTS.map(([routeKey]) => routeKey),
    ] as const).map((routeKey) => ({
      locale,
      slug: [
        ...getDecodedRouteSegments(buildRoutePath(routeKey, locale)).slice(1),
      ],
    }));

    return [...restaurantPaths, ...supportedRedirects];
  });
}


/* ============================================================
   METADATA
   ============================================================ */

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const {
    locale:
      rawLocale,

    slug,
  } =
    await params;

  if (
    !isSupportedLocale(
      rawLocale,
    )
  ) {
    return {};
  }

  const restaurant =
    getRestaurantFromRoute(
      rawLocale,
      slug,
    );

  if (
    !restaurant
  ) {
    return {};
  }

  const description =
    getRestaurantDescription(
      restaurant,
      rawLocale,
    );

  const indexable =
    restaurant.status ===
      "open";

  // Only the verified, open Czapelska location has a live SEO editor.
  // Brzeska is coming soon and remains intentionally non-indexable.
  const seoKey = "location_czapelska_seo";
  const [publishedSeo, openGraphImage, primaryLogo] = await Promise.all([
    indexable && restaurant.slug === "czapelska"
      ? getPublishedCmsTextContent(seoKey, rawLocale) : Promise.resolve(null),
    getBrandOpenGraphImage(),
    getPrimaryBrandLogo(),
  ]);
  const seoCopy = publishedSeo && validPublishedSeo(seoKey, publishedSeo)
    ? publishedSeo : null;
  const socialImage = openGraphImage ?? primaryLogo;

  return buildRestaurantMetadata({
    locale:
      rawLocale,

    slug:
      restaurant.slug,

    name: getRestaurantMetadataName(
      restaurant,
      rawLocale,
    ),

    ...(seoCopy ? { metadataTitle: seoCopy.title } : {}),

    description: seoCopy?.body ?? description,

    ...(socialImage ? {
      images: [{
        url: socialImage.publicUrl,
        alt: socialImage.altText || "Rincón Colombiano",
        type: socialImage.mimeType,
      }],
    } : {}),

    streetAddress:
      restaurant
        .address
        .street,

    addressLocality:
      restaurant
        .address
        .city,

    countryCode:
      restaurant
        .address
        .countryCode,

    ...(restaurant
      .address
      .postalCode
      ? {
          postalCode:
            restaurant
              .address
              .postalCode,
        }
      : {}),

    ...(restaurant.phone
      ? {
          phone:
            restaurant.phone,
        }
      : {}),

    ...(restaurant.coordinates
      ? {
          latitude:
            restaurant
              .coordinates
              .latitude,

          longitude:
            restaurant
              .coordinates
              .longitude,
        }
      : {}),

    indexable,
  });
}


/* ============================================================
   PAGE
   ============================================================ */

export default async function RestaurantPage({
  params,
}: RestaurantPageProps) {
  const {
    locale:
      rawLocale,

    slug,
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


  if (isContactRoute(locale, slug)) {
    redirect(`${buildRoutePath("home", locale)}#contact`);
  }

  const sectionShortcut = getPublishedSectionShortcut(locale, slug);
  if (sectionShortcut) {
    redirect(sectionShortcut);
  }

  if (
    isOrderRoute(
      locale,
      slug,
    )
  ) {
    redirect(
      buildRcOrderaOrderUrl(
        "czapelska",
      ),
    );
  }

  const restaurant =
    getRestaurantFromRoute(
      locale,
      slug,
    );

  if (
    !restaurant
  ) {
    notFound();
  }

  // Show the same published official brand mark as the homepage/menu.
  // The existing RC fallback remains if the owner has not published a logo.
  const primaryBrandLogo = await getPrimaryBrandLogo();

  const copy =
    restaurantPageContent[
      locale
    ];

  const description =
    getRestaurantDescription(
      restaurant,
      locale,
    );

  const homeHref =
    buildRoutePath(
      "home",
      locale,
    );

  const menuHref =
    buildRoutePath(
      "menu",
      locale,
    );

  const locationHref =
    buildRoutePath(
      "location",
      locale,
      {
        slug:
          restaurant.slug,
      },
    );

  const orderHref =
    getRestaurantOrderHref(
      restaurant,
    );

  const weeklyHours =
    restaurant
      .weeklyHours;

  const openingHours =
    buildOpeningHours(
      restaurant,
    );

  const indexable =
    restaurant.status ===
      "open";

  const activeServices =
    getActiveServices(
      restaurant,
      copy,
    );

  const statusLabel =
    getStatusLabel(
      restaurant.status,
      copy,
    );

  const statusClassName =
    getStatusClassName(
      restaurant.status,
    );

  const restaurantJsonLd =
    indexable
      ? buildRestaurantJsonLd({
          locale,

          slug:
            restaurant.slug,

          name:
            restaurant.name,

          description,

          streetAddress:
            restaurant
              .address
              .street,

          addressLocality:
            restaurant
              .address
              .city,

          countryCode:
            restaurant
              .address
              .countryCode,

          ...(restaurant
            .address
            .postalCode
            ? {
                postalCode:
                  restaurant
                    .address
                    .postalCode,
              }
            : {}),

          ...(restaurant.phone
            ? {
                phone:
                  restaurant.phone,
              }
            : {}),

          ...(restaurant.coordinates
            ? {
                latitude:
                  restaurant
                    .coordinates
                    .latitude,

                longitude:
                  restaurant
                    .coordinates
                    .longitude,
              }
            : {}),

          ...(openingHours.length >
          0
            ? {
                openingHours,
              }
            : {}),

          indexable:
            true,
        })
      : null;

  const breadcrumbJsonLd =
    buildBreadcrumbJsonLd([
      {
        name:
          "Rincón Colombiano",

        url:
          homeHref,
      },
      {
        name:
          restaurant.name,

        url:
          locationHref,
      },
    ]);


  return (
    <main
      id="main-content"
      className="
        min-h-screen
        bg-[#faf9f6]
        text-[#12100e]
      "
    >
      {/* ====================================================
          BRAND STRIPE
          ==================================================== */}

      <div
        className="
          grid
          h-2
          grid-cols-[2fr_1fr_1fr]
        "
        aria-hidden="true"
      >
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>


      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="
          border-b
          border-[#e7e1d7]
          bg-white/95
          backdrop-blur
        "
      >
        <div
          className="
            site-container
            flex
            min-h-20
            items-center
            justify-between
            gap-4
          "
        >
          <Link
            href={
              homeHref
            }
            aria-label="Rincón Colombiano"
            className="
              flex
              items-center min-w-0
              gap-3
              font-black
              text-[#12100e]
            "
          >
            {primaryBrandLogo ? (
              <span
                className="block h-12 w-16 shrink-0 bg-contain bg-left bg-no-repeat sm:h-14 sm:w-20"
                style={{ backgroundImage: `url("${primaryBrandLogo.publicUrl}")` }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f7c600] text-sm font-black text-[#12100e]"
                aria-hidden="true"
              >
                RC
              </span>
            )}

            <span className="hidden min-[480px]:inline">
              Rincón Colombiano
            </span>
          </Link>

          {
            orderHref
              ? (
                  <a
                    href={
                      orderHref
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#123d73]
                      px-5
                      text-sm
                      font-black
                      text-white
                      transition
                      hover:bg-[#0e315d]
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-[#123d73]
                    "
                  >
                    {copy.order}
                  </a>
                )
              : null
          }
        </div>
      </header>


      {/* ====================================================
          HERO
          ==================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-white
          py-16
          sm:py-24
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            size-80
            rounded-full
            bg-[#f7c600]/20
            blur-3xl
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-24
            size-72
            rounded-full
            bg-[#123d73]/10
            blur-3xl
          "
          aria-hidden="true"
        />

        <div className="site-container relative">
          <Link
            href={
              homeHref
            }
            className="
              text-sm
              font-bold
              text-[#123d73]
              hover:underline
            "
          >
            ← {copy.back}
          </Link>

          <div
            className="
              mt-10
              grid
              gap-10
              lg:grid-cols-[1fr_0.72fr]
              lg:items-end
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-[#c92d39]
                  uppercase
                "
              >
                {copy.eyebrow}
              </p>

              <h1
                className="
                  mt-4
                  max-w-4xl
                  font-serif
                  text-4xl
                  font-bold
                  leading-[1.05]
                  tracking-[-0.035em]
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                {restaurant.name}
              </h1>

              <p
                className="
                  mt-6
                  max-w-3xl
                  text-lg
                  leading-8
                  text-[#62594f]
                "
              >
                {description}
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <span
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-xs
                    font-black
                    ${statusClassName}
                  `}
                >
                  {statusLabel}
                </span>

                {
                  restaurant
                    .address
                    .district
                    ? (
                        <span
                          className="
                            rounded-full
                            border
                            border-[#d8d0c5]
                            bg-white
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-[#62594f]
                          "
                        >
                          {
                            restaurant
                              .address
                              .district
                          }
                        </span>
                      )
                    : null
                }
              </div>
            </div>


            {/* ==================================================
                LOCATION CARD
                ================================================== */}

            <aside
              className="
                rounded-[2rem]
                bg-[#12100e]
                p-6
                text-white
                shadow-xl
              "
              aria-label={
                copy.addressLabel
              }
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.14em]
                  text-[#f7c600]
                  uppercase
                "
              >
                {copy.addressLabel}
              </p>

              <address
                className="
                  mt-3
                  not-italic
                  text-xl
                  font-bold
                  leading-8
                "
              >
                {
                  restaurant
                    .address
                    .street
                }
                <br />

                {
                  restaurant
                    .address
                    .postalCode
                    ? `${restaurant.address.postalCode} `
                    : null
                }

                {
                  restaurant
                    .address
                    .city
                }

                {
                  restaurant
                    .address
                    .district
                    ? (
                        <>
                          <br />
                          {
                            restaurant
                              .address
                              .district
                          }
                        </>
                      )
                    : null
                }
              </address>

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {
                  orderHref
                    ? (
                        <a
                          href={
                            orderHref
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-full
                            bg-[#f7c600]
                            px-5
                            text-sm
                            font-black
                            text-[#12100e]
                            transition
                            hover:bg-[#dfb300]
                          "
                        >
                          {copy.order}
                        </a>
                      )
                    : null
                }

                {
                  indexable
                    ? (
                        <Link
                          href={
                            menuHref
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            px-5
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-white/10
                          "
                        >
                          {copy.menu}
                        </Link>
                      )
                    : null
                }

                {
                  restaurant
                    .googleMapsUrl
                    ? (
                        <a
                          href={
                            restaurant
                              .googleMapsUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            px-5
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-white/10
                          "
                        >
                          {copy.maps}
                        </a>
                      )
                    : null
                }
              </div>

              {
                restaurant.phone ||
                restaurant.email
                  ? (
                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-x-5
                          gap-y-2
                          border-t
                          border-white/10
                          pt-5
                          text-sm
                        "
                      >
                        {
                          restaurant.phone
                            ? (
                                <a
                                  href={
                                    `tel:${restaurant.phone.replace(
                                      /\s/g,
                                      "",
                                    )}`
                                  }
                                  className="
                                    font-bold
                                    text-white/80
                                    hover:text-white
                                    hover:underline
                                  "
                                >
                                  {copy.phone}
                                </a>
                              )
                            : null
                        }

                        {
                          restaurant.email
                            ? (
                                <a
                                  href={
                                    `mailto:${restaurant.email}`
                                  }
                                  className="
                                    font-bold
                                    text-white/80
                                    hover:text-white
                                    hover:underline
                                  "
                                >
                                  {copy.email}
                                </a>
                              )
                            : null
                        }
                      </div>
                    )
                  : null
              }
            </aside>
          </div>
        </div>
      </section>


      {/* ====================================================
          LOCAL SEO CONTENT
          ==================================================== */}

      <section
        className="
          py-16
          sm:py-24
        "
      >
        <div
          className="
            site-container
            grid
            gap-6
            lg:grid-cols-2
          "
        >
          <article
            className="
              rounded-[2rem]
              border
              border-[#e7e1d7]
              border-t-4
              border-t-[#f7c600]
              bg-white
              p-7
              shadow-sm
            "
          >
            <h2
              className="
                font-serif
                text-3xl
                font-bold
              "
            >
              {copy.cuisineTitle}
            </h2>

            <p
              className="
                mt-4
                text-base
                leading-7
                text-[#62594f]
              "
            >
              {copy.cuisineDescription}
            </p>

            <p
              className="
                mt-4
                text-sm
                leading-6
                text-[#756b61]
              "
            >
              {copy.availabilityNote}
            </p>

            {
              indexable
                ? (
                    <Link
                      href={
                        menuHref
                      }
                      className="
                        mt-6
                        inline-flex
                        font-bold
                        text-[#123d73]
                        hover:underline
                      "
                    >
                      {copy.menu} →
                    </Link>
                  )
                : null
            }
          </article>

          <article
            className="
              rounded-[2rem]
              border
              border-[#e7e1d7]
              border-t-4
              border-t-[#c92d39]
              bg-white
              p-7
              shadow-sm
            "
          >
            <h2
              className="
                font-serif
                text-3xl
                font-bold
              "
            >
              {copy.locationTitle}
            </h2>

            <p
              className="
                mt-4
                text-base
                leading-7
                text-[#62594f]
              "
            >
              {copy.locationDescription}
            </p>
          </article>
        </div>
      </section>


      {/* ====================================================
          HOURS + SERVICES
          ==================================================== */}

      <section
        className="
          bg-white
          py-16
          sm:py-24
        "
      >
        <div
          className="
            site-container
            grid
            gap-10
            lg:grid-cols-2
          "
        >
          <div>
            <p
              className="
                text-xs
                font-black
                tracking-[0.18em]
                text-[#123d73]
                uppercase
              "
            >
              {copy.hoursLabel}
            </p>

            {
              weeklyHours
                ? (
                    <dl
                      className="
                        mt-6
                        divide-y
                        divide-[#e7e1d7]
                        overflow-hidden
                        rounded-[1.5rem]
                        border
                        border-[#e7e1d7]
                        bg-[#faf9f6]
                      "
                    >
                      {
                        DAYS.map(
                          (
                            day,
                          ) => {
                            const schedule =
                              weeklyHours[
                                day
                              ];

                            return (
                              <div
                                key={
                                  day
                                }
                                className="
                                  flex
                                  items-center
                                  justify-between
                                  gap-5
                                  px-5
                                  py-4
                                "
                              >
                                <dt className="font-bold">
                                  {
                                    copy
                                      .days[
                                        day
                                      ]
                                  }
                                </dt>

                                <dd
                                  className="
                                    text-right
                                    text-sm
                                    text-[#62594f]
                                  "
                                >
                                  {
                                    schedule.closed
                                      ? copy.closed
                                      : schedule
                                          .intervals
                                          .map(
                                            (
                                              interval,
                                            ) =>
                                              `${interval.opensAt}–${interval.closesAt}`,
                                          )
                                          .join(
                                            ", ",
                                          )
                                  }
                                </dd>
                              </div>
                            );
                          },
                        )
                      }
                    </dl>
                  )
                : (
                    <p
                      className="
                        mt-5
                        max-w-xl
                        text-sm
                        leading-6
                        text-[#62594f]
                      "
                    >
                      {copy.hoursUnavailable}
                    </p>
                  )
            }
          </div>


          <div>
            <p
              className="
                text-xs
                font-black
                tracking-[0.18em]
                text-[#c92d39]
                uppercase
              "
            >
              {copy.servicesLabel}
            </p>

            {
              activeServices.length >
                0
                ? (
                    <div
                      className="
                        mt-6
                        flex
                        flex-wrap
                        gap-3
                      "
                    >
                      {
                        activeServices.map(
                          (
                            service,
                          ) => (
                            <span
                              key={
                                service
                              }
                              className="
                                rounded-full
                                border
                                border-[#d8d0c5]
                                bg-[#faf9f6]
                                px-4
                                py-3
                                text-sm
                                font-bold
                              "
                            >
                              {service}
                            </span>
                          ),
                        )
                      }
                    </div>
                  )
                : (
                    <p
                      className="
                        mt-5
                        max-w-xl
                        text-sm
                        leading-6
                        text-[#62594f]
                      "
                    >
                      {
                        copy
                          .servicesUnavailable
                      }
                    </p>
                  )
            }
          </div>
        </div>
      </section>


      {/* ====================================================
          CONVERSION
          ==================================================== */}

      {
        orderHref
          ? (
              <section
                className="
                  bg-[#123d73]
                  py-14
                  text-white
                  sm:py-16
                "
              >
                <div
                  className="
                    site-container
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-black
                        tracking-[0.16em]
                        text-[#f7c600]
                        uppercase
                      "
                    >
                      Rincón Colombiano
                    </p>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        font-serif
                        text-2xl
                        font-bold
                        sm:text-3xl
                      "
                    >
                      {restaurant.name}
                    </p>
                  </div>

                  <a
                    href={
                      orderHref
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f7c600]
                      px-7
                      text-sm
                      font-black
                      text-[#12100e]
                      shadow-lg
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#dfb300]
                    "
                  >
                    {copy.order}
                    <span
                      className="ml-2"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </a>
                </div>
              </section>
            )
          : null
      }


      {/* ====================================================
          BRAND STRIPE
          ==================================================== */}

      <div
        className="
          grid
          h-3
          grid-cols-[2fr_1fr_1fr]
        "
        aria-hidden="true"
      >
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>


      {/* ====================================================
          STRUCTURED DATA
          ==================================================== */}

      {
        restaurantJsonLd
          ? (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html:
                    serializeJsonLd(
                      restaurantJsonLd,
                    ),
                }}
              />
            )
          : null
      }

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            serializeJsonLd(
              breadcrumbJsonLd,
            ),
        }}
      />
    </main>
  );
}
