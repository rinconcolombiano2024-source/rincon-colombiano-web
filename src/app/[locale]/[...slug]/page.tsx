import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

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
  getRestaurantBySlug,
  type DayOfWeek,
  type Restaurant,
} from "@/config/restaurants";

import {
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
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

  readonly servicesLabel:
    string;

  readonly order:
    string;

  readonly menu:
    string;

  readonly statusOpen:
    string;

  readonly statusComingSoon:
    string;

  readonly statusTemporary:
    string;

  readonly cuisineTitle:
    string;

  readonly cuisineDescription:
    string;

  readonly locationTitle:
    string;

  readonly locationDescription:
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

    servicesLabel:
      "Usługi",

    order:
      "Zamów online",

    menu:
      "Zobacz menu",

    statusOpen:
      "Otwarte",

    statusComingSoon:
      "Otwarcie wkrótce",

    statusTemporary:
      "Tymczasowo zamknięte",

    cuisineTitle:
      "Autentyczne smaki Kolumbii w Warszawie",

    cuisineDescription:
      "Rincón Colombiano łączy kolumbijską kuchnię, kulturę i gościnność. W naszej ofercie znajdziesz między innymi tamal tolimense, lechonę, arepy, bandeję paisa, empanadas, buñuelos, caldo de costilla oraz inne smaki Kolumbii.",

    locationTitle:
      "Kolumbijska atmosfera w Warszawie",

    locationDescription:
      "To miejsce dla osób szukających kolumbijskiego jedzenia, latynoskiej atmosfery, spotkań z rodziną i przyjaciółmi, cateringu oraz wydarzeń związanych z kulturą Kolumbii.",

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

    servicesLabel:
      "Servicios",

    order:
      "Pedir en línea",

    menu:
      "Ver menú",

    statusOpen:
      "Abierto",

    statusComingSoon:
      "Próximamente",

    statusTemporary:
      "Cerrado temporalmente",

    cuisineTitle:
      "Sabores auténticos de Colombia en Varsovia",

    cuisineDescription:
      "Rincón Colombiano reúne gastronomía, cultura y hospitalidad colombiana. Nuestra propuesta incluye sabores como tamal tolimense, lechona, arepas, bandeja paisa, empanadas, buñuelos, caldo de costilla y otras preparaciones colombianas.",

    locationTitle:
      "Ambiente colombiano y latino en Varsovia",

    locationDescription:
      "Un espacio para quienes buscan comida colombiana, ambiente latino, reuniones con familia y amigos, catering y experiencias relacionadas con la cultura de Colombia.",

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

    servicesLabel:
      "Services",

    order:
      "Order online",

    menu:
      "View menu",

    statusOpen:
      "Open",

    statusComingSoon:
      "Coming soon",

    statusTemporary:
      "Temporarily closed",

    cuisineTitle:
      "Authentic Colombian flavors in Warsaw",

    cuisineDescription:
      "Rincón Colombiano brings together Colombian food, culture and hospitality. Our offer includes flavors such as tamal tolimense, lechona, arepas, bandeja paisa, empanadas, buñuelos, caldo de costilla and other Colombian dishes.",

    locationTitle:
      "Colombian and Latin atmosphere in Warsaw",

    locationDescription:
      "A place for people looking for Colombian food, a Latin atmosphere, meals with family and friends, catering and experiences connected with Colombian culture.",

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
   DAYS
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


/* ============================================================
   DESCRIPTION
   ============================================================ */

function getRestaurantDescription(
  restaurant:
    Restaurant,
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


/* ============================================================
   ROUTE MATCH
   ============================================================ */

function getRestaurantFromRoute(
  locale:
    AppLocale,
  slugSegments:
    readonly string[],
): Restaurant | null {
  const requestedPath =
    `/${locale}/${slugSegments.join(
      "/",
    )}`;

  for (
    const restaurant of
      getPublicRestaurants()
  ) {
    const expectedPath =
      buildRoutePath(
        "location",
        locale,
        {
          slug:
            restaurant.slug,
        },
      );

    if (
      requestedPath ===
      expectedPath
    ) {
      return restaurant;
    }
  }

  return null;
}


/* ============================================================
   STATIC PARAMS
   ============================================================ */

export function generateStaticParams() {
  return SUPPORTED_LOCALES
    .flatMap(
      (
        locale,
      ) =>
        getPublicRestaurants()
          .map(
            (
              restaurant,
            ) => {
              const fullPath =
                buildRoutePath(
                  "location",
                  locale,
                  {
                    slug:
                      restaurant.slug,
                  },
                );

              const segments =
                fullPath
                  .split("/")
                  .filter(
                    Boolean,
                  );

              return {
                locale,

                slug:
                  segments.slice(
                    1,
                  ),
              };
            },
          ),
    );
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

  return buildRestaurantMetadata({
    locale:
      rawLocale,

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

    indexable:
      restaurant.status ===
      "open",
  });
}


/* ============================================================
   OPENING HOURS JSON-LD
   ============================================================ */

function buildOpeningHours(
  restaurant:
    Restaurant,
): readonly string[] {
  if (
    !restaurant.weeklyHours
  ) {
    return [];
  }

  const schemaDay:
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

  return DAYS
    .flatMap(
      (
        day,
      ) => {
        const schedule =
          restaurant
            .weeklyHours?.[
              day
            ];

        if (
          !schedule ||
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
              `${schemaDay[day]} ${interval.opensAt}-${interval.closesAt}`,
          );
      },
    );
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

  const orderHref =
    buildRcOrderaOrderUrl(
      restaurant.slug,
    );

  const restaurantJsonLd =
    buildRestaurantJsonLd({
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

      openingHours:
        buildOpeningHours(
          restaurant,
        ),

      indexable:
        restaurant.status ===
        "open",
    });

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
          buildRoutePath(
            "location",
            locale,
            {
              slug:
                restaurant.slug,
            },
          ),
      },
    ]);

  const statusLabel =
    restaurant.status ===
      "open"
      ? copy.statusOpen
      : restaurant.status ===
          "coming_soon"
        ? copy.statusComingSoon
        : copy.statusTemporary;

  const activeServices = [
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


  return (
    <main
      id="main-content"
      className="
        min-h-screen
        bg-[#faf9f6]
        text-[#12100e]
      "
    >
      <div
        className="
          h-2
          bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
        "
        aria-hidden="true"
      />


      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="
          border-b
          border-[#e7e1d7]
          bg-white
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
            className="
              flex
              items-center
              gap-3
              font-black
            "
          >
            <span
              className="
                grid
                size-11
                place-items-center
                rounded-2xl
                bg-[#f7c600]
                text-sm
                font-black
              "
              aria-hidden="true"
            >
              RC
            </span>

            Rincón Colombiano
          </Link>

          {
            restaurant.status ===
              "open"
              ? (
                  <a
                    href={
                      orderHref
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      rounded-full
                      bg-[#123d73]
                      px-5
                      py-3
                      text-sm
                      font-black
                      text-white
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
                  className="
                    rounded-full
                    bg-[#f7c600]
                    px-4
                    py-2
                    text-xs
                    font-black
                  "
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


            <div
              className="
                rounded-[2rem]
                bg-[#12100e]
                p-6
                text-white
                shadow-xl
              "
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

              {
                restaurant.status ===
                  "open"
                  ? (
                      <div
                        className="
                          mt-6
                          flex
                          flex-wrap
                          gap-3
                        "
                      >
                        <a
                          href={
                            orderHref
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            rounded-full
                            bg-[#f7c600]
                            px-5
                            py-3
                            text-sm
                            font-black
                            text-[#12100e]
                          "
                        >
                          {copy.order}
                        </a>

                        <Link
                          href={
                            menuHref
                          }
                          className="
                            rounded-full
                            border
                            border-white/20
                            px-5
                            py-3
                            text-sm
                            font-bold
                            text-white
                          "
                        >
                          {copy.menu}
                        </Link>
                      </div>
                    )
                  : null
              }
            </div>
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
              restaurant.weeklyHours
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
                              restaurant
                                .weeklyHours?.[
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
                                <dt
                                  className="
                                    font-bold
                                  "
                                >
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
                                    !schedule ||
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
                        text-[#62594f]
                      "
                    >
                      {statusLabel}
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
          </div>
        </div>
      </section>


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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            serializeJsonLd(
              restaurantJsonLd,
            ),
        }}
      />

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
