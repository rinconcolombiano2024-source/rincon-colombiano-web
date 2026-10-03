import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buildMenuMetadata,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/config";

import {
  buildRcOrderaOrderUrl,
} from "@/integrations/rc-ordera/config";

import {
  getRcOrderaPublicCatalog,
  type RcOrderaPublicCatalog,
} from "@/integrations/rc-ordera/public-catalog";


/* ============================================================
   CACHE
   ============================================================ */

/**
 * La oferta pública puede cambiar durante el día.
 *
 * Permitimos actualizar esta página periódicamente
 * sin convertir cada request público en una consulta nueva.
 */
export const revalidate =
  300;


/* ============================================================
   TYPES
   ============================================================ */

interface MenuPageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;
    }>;
}


interface FeaturedDish {
  readonly name:
    string;

  readonly description:
    string;
}


interface MenuPageCopy {
  readonly back:
    string;

  readonly eyebrow:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly order:
    string;

  readonly liveLabel:
    string;

  readonly unavailableLabel:
    string;

  readonly unavailableDescription:
    string;

  readonly featuredEyebrow:
    string;

  readonly featuredTitle:
    string;

  readonly featuredDescription:
    string;

  readonly featuredDishes:
    readonly FeaturedDish[];

  readonly liveEyebrow:
    string;

  readonly liveTitle:
    string;

  readonly liveDescription:
    string;

  readonly available:
    string;

  readonly footerTitle:
    string;

  readonly footerDescription:
    string;

  readonly footerAction:
    string;
}


/* ============================================================
   CONTENT
   ============================================================ */

const menuPageContent:
  Readonly<
    Record<
      AppLocale,
      MenuPageCopy
    >
  > = {
  pl: {
    back:
      "Wróć do strony głównej",

    eyebrow:
      "Autentyczna kuchnia kolumbijska • Warszawa",

    title:
      "Kolumbijskie menu Rincón Colombiano",

    description:
      "Poznaj smaki Kolumbii w Warszawie. W Rincón Colombiano znajdziesz tradycyjne dania, przekąski i wyjątkowe kolumbijskie propozycje. Aktualne ceny i dostępność produktów są synchronizowane z naszym systemem zamówień RC ORDERA.",

    order:
      "Zamów online",

    liveLabel:
      "Menu połączone z RC ORDERA",

    unavailableLabel:
      "Aktualne menu jest chwilowo niedostępne online",

    unavailableDescription:
      "Możesz nadal poznać nasze najbardziej charakterystyczne kolumbijskie dania. Aktualną dostępność potwierdzisz podczas składania zamówienia.",

    featuredEyebrow:
      "Smaki Kolumbii",

    featuredTitle:
      "Kolumbijskie dania, których warto spróbować",

    featuredDescription:
      "Oferta może zmieniać się w zależności od dnia i dostępności. Aktualne produkty oraz ceny znajdziesz w menu połączonym z RC ORDERA.",

    featuredDishes: [
      {
        name:
          "Tamal Tolimense",

        description:
          "Tradycyjny tamal z regionu Tolima, zawijany w liść bananowca i długo gotowany. Przygotowujemy go z ryżu, kurczaka, wieprzowiny, skwarków, jajka, ziemniaków, marchwi, groszku i niewielkiej ilości mąki kukurydzianej.",
      },
      {
        name:
          "Lechona Tolimense",

        description:
          "Tradycyjne danie z Tolimy: wieprzowina z groszkiem przygotowywana przez wiele godzin, z soczystym wnętrzem i chrupiącą wieprzową skórką.",
      },
      {
        name:
          "Bandeja Paisa",

        description:
          "Kompletne kolumbijskie danie z ryżem, fasolą, mieloną wołowiną, chorizo, patacónem, jajkiem i arepą.",
      },
      {
        name:
          "Sancocho Trifásico",

        description:
          "Tradycyjna kolumbijska zupa z ziemniakami, maniokiem, zielonym bananem, żeberkami wołowymi i wieprzowymi oraz kurczakiem. Podawana z białym ryżem i awokado.",
      },
      {
        name:
          "Empanada Colombiana",

        description:
          "Smażona empanada z ciasta kukurydzianego, nadziewana wołowiną i ziemniakami. Podawana z guacamole lub domową salsą kolumbijską.",
      },
      {
        name:
          "Arepa con Queso",

        description:
          "Kukurydziana arepa przygotowana z serem mozzarella i dodatkowym nadzieniem z roztopionego sera.",
      },
      {
        name:
          "Chocolate con Queso",

        description:
          "Gorąca kolumbijska czekolada przygotowana z kakao i podawana z kawałkami sera, które delikatnie roztapiają się w napoju.",
      },
      {
        name:
          "Limonada de Panela",

        description:
          "Orzeźwiająca kolumbijska lemoniada przygotowana z paneli, czyli nierafinowanego cukru trzcinowego, oraz świeżego soku z limonki.",
      },
    ],

    liveEyebrow:
      "Aktualna oferta",

    liveTitle:
      "Menu dostępne teraz",

    liveDescription:
      "Poniższe produkty pochodzą bezpośrednio z publicznego katalogu RC ORDERA.",

    available:
      "Dostępne",

    footerTitle:
      "Masz ochotę na kolumbijskie jedzenie w Warszawie?",

    footerDescription:
      "Zamów bezpośrednio w Rincón Colombiano i sprawdź aktualną dostępność odbioru lub dostawy.",

    footerAction:
      "Przejdź do zamówienia",
  },


  es: {
    back:
      "Volver al inicio",

    eyebrow:
      "Gastronomía colombiana auténtica • Varsovia",

    title:
      "Menú colombiano de Rincón Colombiano",

    description:
      "Descubre los sabores de Colombia en Varsovia. En Rincón Colombiano encontrarás platos tradicionales, entradas y propuestas colombianas. Los precios y la disponibilidad actual se sincronizan con nuestro sistema de pedidos RC ORDERA.",

    order:
      "Pedir en línea",

    liveLabel:
      "Menú conectado con RC ORDERA",

    unavailableLabel:
      "El menú actualizado no está disponible temporalmente en línea",

    unavailableDescription:
      "Puedes seguir descubriendo algunos de nuestros platos colombianos más representativos. La disponibilidad actual se confirma al realizar el pedido.",

    featuredEyebrow:
      "Sabores de Colombia",

    featuredTitle:
      "Platos colombianos que vale la pena descubrir",

    featuredDescription:
      "La oferta puede cambiar según el día y la disponibilidad. Los productos y precios actuales aparecen en el menú conectado con RC ORDERA.",

    featuredDishes: [
      {
        name:
          "Tamal Tolimense",

        description:
          "Tamal tradicional del Tolima envuelto en hoja de plátano y cocinado durante varias horas. Lo preparamos con arroz, pollo, cerdo, chicharrón, huevo, papa, zanahoria, arveja y un toque de harina de maíz.",
      },
      {
        name:
          "Lechona Tolimense",

        description:
          "Preparación tradicional del Tolima elaborada con cerdo y arvejas, horneada lentamente durante varias horas para conseguir un interior jugoso y una piel bien crujiente.",
      },
      {
        name:
          "Bandeja Paisa",

        description:
          "Plato colombiano completo con arroz, fríjoles, carne molida, chorizo, patacón, huevo y arepa.",
      },
      {
        name:
          "Sancocho Trifásico",

        description:
          "Sopa tradicional colombiana con papa, yuca, plátano verde, costilla de res, costilla de cerdo y pollo. Se sirve con arroz blanco y aguacate.",
      },
      {
        name:
          "Empanada Colombiana",

        description:
          "Empanada frita de masa de maíz, rellena de carne de res y papa. Se acompaña con guacamole o salsa colombiana casera.",
      },
      {
        name:
          "Arepa con Queso",

        description:
          "Arepa de maíz preparada con queso mozzarella y un relleno adicional de queso fundido.",
      },
      {
        name:
          "Chocolate con Queso",

        description:
          "Chocolate caliente de cacao servido al estilo colombiano con trozos de queso que se derriten ligeramente dentro de la bebida.",
      },
      {
        name:
          "Limonada de Panela",

        description:
          "Bebida refrescante preparada con panela, azúcar de caña sin refinar, y jugo recién exprimido de lima.",
      },
    ],

    liveEyebrow:
      "Oferta actual",

    liveTitle:
      "Menú disponible ahora",

    liveDescription:
      "Los siguientes productos proceden directamente del catálogo público de RC ORDERA.",

    available:
      "Disponible",

    footerTitle:
      "¿Quieres comida colombiana en Varsovia?",

    footerDescription:
      "Pide directamente a Rincón Colombiano y consulta las opciones actuales de recogida o entrega.",

    footerAction:
      "Ir a realizar pedido",
  },


  en: {
    back:
      "Back to home",

    eyebrow:
      "Authentic Colombian food • Warsaw",

    title:
      "Rincón Colombiano Colombian menu",

    description:
      "Discover Colombian flavors in Warsaw. Rincón Colombiano brings together traditional dishes, snacks and Colombian specialties. Current prices and availability are synchronized with our RC ORDERA ordering system.",

    order:
      "Order online",

    liveLabel:
      "Menu connected to RC ORDERA",

    unavailableLabel:
      "The current online menu is temporarily unavailable",

    unavailableDescription:
      "You can still discover some of our signature Colombian dishes. Current availability is confirmed when ordering.",

    featuredEyebrow:
      "Flavors of Colombia",

    featuredTitle:
      "Colombian dishes worth discovering",

    featuredDescription:
      "The offer may change depending on the day and availability. Current products and prices are shown through the menu connected to RC ORDERA.",

    featuredDishes: [
      {
        name:
          "Tamal Tolimense",

        description:
          "A traditional tamal from Colombia's Tolima region, wrapped in a banana leaf and cooked for several hours. Made with rice, chicken, pork, pork crackling, egg, potato, carrot, peas and a touch of corn flour.",
      },
      {
        name:
          "Lechona Tolimense",

        description:
          "A traditional Tolima preparation made with pork and peas, slowly roasted for several hours to create a juicy filling and crisp pork skin.",
      },
      {
        name:
          "Bandeja Paisa",

        description:
          "A complete Colombian plate with rice, beans, ground beef, chorizo, fried plantain, egg and arepa.",
      },
      {
        name:
          "Sancocho Trifásico",

        description:
          "Traditional Colombian soup with potato, cassava, green plantain, beef ribs, pork ribs and chicken. Served with white rice and avocado.",
      },
      {
        name:
          "Colombian Empanada",

        description:
          "A fried corn-dough empanada filled with beef and potato, served with guacamole or homemade Colombian salsa.",
      },
      {
        name:
          "Arepa con Queso",

        description:
          "A corn arepa prepared with mozzarella and an additional melted-cheese filling.",
      },
      {
        name:
          "Chocolate con Queso",

        description:
          "Colombian-style hot chocolate made with cocoa and served with pieces of cheese that soften and melt slightly in the hot drink.",
      },
      {
        name:
          "Limonada de Panela",

        description:
          "A refreshing drink made with panela, unrefined cane sugar, and freshly squeezed lime juice.",
      },
    ],

    liveEyebrow:
      "Current offer",

    liveTitle:
      "Menu available now",

    liveDescription:
      "The products below come directly from the public RC ORDERA catalog.",

    available:
      "Available",

    footerTitle:
      "Looking for Colombian food in Warsaw?",

    footerDescription:
      "Order directly from Rincón Colombiano and check the currently available pickup or delivery options.",

    footerAction:
      "Start your order",
  },
};


/* ============================================================
   METADATA
   ============================================================ */

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
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
    return {};
  }

  return buildMenuMetadata(
    rawLocale,
  );
}


/* ============================================================
   PRICE
   ============================================================ */

function formatProductPrice(
  catalog:
    RcOrderaPublicCatalog,
  price:
    number,
  locale:
    AppLocale,
): string {
  const numberLocale =
    locale ===
      "pl"
      ? "pl-PL"
      : locale ===
          "es"
        ? "es-CO"
        : "en-GB";

  const formatted =
    new Intl.NumberFormat(
      numberLocale,
      {
        maximumFractionDigits:
          2,

        minimumFractionDigits:
          Number.isInteger(
            price,
          )
            ? 0
            : 2,
      },
    ).format(
      price,
    );

  return catalog
    .settings
    .currencyPosition ===
    "before"
      ? `${catalog.settings.currencySymbol}${formatted}`
      : `${formatted} ${catalog.settings.currencySymbol}`;
}


/* ============================================================
   SECTION ID
   ============================================================ */

function buildCategoryId(
  category:
    string,
): string {
  const normalized =
    category
      .normalize(
        "NFD",
      )
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  return normalized.length >
    0
    ? `category-${normalized}`
    : "category-menu";
}


/* ============================================================
   MENU PAGE
   ============================================================ */

export default async function MenuPage({
  params,
}: MenuPageProps) {
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

  const copy =
    menuPageContent[
      locale
    ];

  const catalog =
    await getRcOrderaPublicCatalog(
      "czapelska",
    );

  const orderHref =
    buildRcOrderaOrderUrl(
      "czapelska",
    );

  const homeHref =
    buildRoutePath(
      "home",
      locale,
    );

  const categories =
    catalog
      ? catalog
          .categories
          .map(
            (
              category,
            ) => ({
              ...category,

              products:
                category
                  .products
                  .filter(
                    (
                      product,
                    ) =>
                      product
                        .available,
                  ),
            }),
          )
          .filter(
            (
              category,
            ) =>
              category
                .products
                .length >
              0,
          )
      : [];

  const hasLiveMenu =
    Boolean(
      catalog,
    ) &&
    categories.length >
      0;


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
          TOP BRAND BAR
          ==================================================== */}

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
              text-[#12100e]
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

            <span>
              Rincón Colombiano
            </span>
          </Link>

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
            "
          >
            {copy.order}
          </a>
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
            size-72
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
                  text-[#123d73]
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
                {copy.title}
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
                {copy.description}
              </p>
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
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className={`
                    size-3
                    rounded-full
                    ${
                      hasLiveMenu
                        ? "bg-emerald-400"
                        : "bg-[#f7c600]"
                    }
                  `}
                  aria-hidden="true"
                />

                <p
                  className="
                    text-sm
                    font-black
                  "
                >
                  {
                    hasLiveMenu
                      ? copy.liveLabel
                      : copy.unavailableLabel
                  }
                </p>
              </div>

              {
                !hasLiveMenu
                  ? (
                      <p
                        className="
                          mt-4
                          text-sm
                          leading-6
                          text-white/65
                        "
                      >
                        {
                          copy
                            .unavailableDescription
                        }
                      </p>
                    )
                  : null
              }

              <a
                href={
                  orderHref
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-6
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
          </div>
        </div>
      </section>


      {/* ====================================================
          FEATURED COLOMBIAN DISHES
          ==================================================== */}

      <section
        className="
          py-16
          sm:py-24
        "
      >
        <div className="site-container">
          <p
            className="
              text-xs
              font-black
              tracking-[0.18em]
              text-[#c92d39]
              uppercase
            "
          >
            {copy.featuredEyebrow}
          </p>

          <h2
            className="
              mt-4
              max-w-3xl
              font-serif
              text-3xl
              font-bold
              tracking-[-0.025em]
              sm:text-4xl
            "
          >
            {copy.featuredTitle}
          </h2>

          <p
            className="
              mt-4
              max-w-3xl
              text-base
              leading-7
              text-[#62594f]
            "
          >
            {copy.featuredDescription}
          </p>

          <div
            className="
              mt-10
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {
              copy
                .featuredDishes
                .map(
                  (
                    dish,
                    index,
                  ) => (
                    <article
                      key={
                        dish.name
                      }
                      className={`
                        rounded-[1.5rem]
                        border
                        border-[#e7e1d7]
                        border-t-4
                        bg-white
                        p-5
                        shadow-sm
                        ${
                          index %
                            3 ===
                          0
                            ? "border-t-[#f7c600]"
                            : index %
                                  3 ===
                                1
                              ? "border-t-[#123d73]"
                              : "border-t-[#c92d39]"
                        }
                      `}
                    >
                      <h3
                        className="
                          font-serif
                          text-xl
                          font-bold
                        "
                      >
                        {dish.name}
                      </h3>

                      <p
                        className="
                          mt-3
                          text-sm
                          leading-6
                          text-[#62594f]
                        "
                      >
                        {dish.description}
                      </p>
                    </article>
                  ),
                )
            }
          </div>
        </div>
      </section>


      {/* ====================================================
          LIVE RC ORDERA MENU
          ==================================================== */}

      {
        hasLiveMenu &&
        catalog
          ? (
              <section
                className="
                  bg-white
                  py-16
                  sm:py-24
                "
              >
                <div className="site-container">
                  <p
                    className="
                      text-xs
                      font-black
                      tracking-[0.18em]
                      text-[#123d73]
                      uppercase
                    "
                  >
                    {copy.liveEyebrow}
                  </p>

                  <h2
                    className="
                      mt-4
                      font-serif
                      text-3xl
                      font-bold
                      tracking-[-0.025em]
                      sm:text-4xl
                    "
                  >
                    {copy.liveTitle}
                  </h2>

                  <p
                    className="
                      mt-4
                      max-w-3xl
                      text-base
                      leading-7
                      text-[#62594f]
                    "
                  >
                    {copy.liveDescription}
                  </p>


                  {/* CATEGORY NAVIGATION */}

                  <nav
                    className="
                      mt-8
                      flex
                      flex-wrap
                      gap-2
                    "
                    aria-label={
                      copy.liveTitle
                    }
                  >
                    {
                      categories.map(
                        (
                          category,
                        ) => (
                          <a
                            key={
                              category.name
                            }
                            href={
                              `#${buildCategoryId(
                                category.name,
                              )}`
                            }
                            className="
                              rounded-full
                              border
                              border-[#d8d0c5]
                              bg-[#faf9f6]
                              px-4
                              py-2
                              text-xs
                              font-bold
                              transition
                              hover:border-[#123d73]
                              hover:text-[#123d73]
                            "
                          >
                            {category.name}
                          </a>
                        ),
                      )
                    }
                  </nav>


                  {/* CATEGORIES */}

                  <div
                    className="
                      mt-12
                      space-y-14
                    "
                  >
                    {
                      categories.map(
                        (
                          category,
                        ) => (
                          <section
                            key={
                              category.name
                            }
                            id={
                              buildCategoryId(
                                category.name,
                              )
                            }
                            className="
                              scroll-mt-24
                            "
                          >
                            <div
                              className="
                                flex
                                items-end
                                justify-between
                                gap-4
                                border-b
                                border-[#e7e1d7]
                                pb-4
                              "
                            >
                              <h3
                                className="
                                  font-serif
                                  text-2xl
                                  font-bold
                                  sm:text-3xl
                                "
                              >
                                {category.name}
                              </h3>

                              <span
                                className="
                                  text-xs
                                  font-bold
                                  text-[#756b61]
                                "
                              >
                                {
                                  category
                                    .products
                                    .length
                                }
                              </span>
                            </div>

                            <div
                              className="
                                mt-6
                                grid
                                gap-4
                                md:grid-cols-2
                              "
                            >
                              {
                                category
                                  .products
                                  .map(
                                    (
                                      product,
                                    ) => (
                                      <article
                                        key={
                                          product.id ??
                                          `${category.name}:${product.name}`
                                        }
                                        className="
                                          flex
                                          flex-col
                                          justify-between
                                          rounded-[1.5rem]
                                          border
                                          border-[#e7e1d7]
                                          bg-[#faf9f6]
                                          p-5
                                        "
                                      >
                                        <div>
                                          <div
                                            className="
                                              flex
                                              items-start
                                              justify-between
                                              gap-5
                                            "
                                          >
                                            <h4
                                              className="
                                                font-serif
                                                text-xl
                                                font-bold
                                              "
                                            >
                                              {
                                                product
                                                  .name
                                              }
                                            </h4>

                                            <span
                                              className="
                                                shrink-0
                                                rounded-full
                                                bg-[#f7c600]
                                                px-3
                                                py-1.5
                                                text-sm
                                                font-black
                                                text-[#12100e]
                                              "
                                            >
                                              {
                                                formatProductPrice(
                                                  catalog,
                                                  product
                                                    .price,
                                                  locale,
                                                )
                                              }
                                            </span>
                                          </div>

                                          {
                                            product
                                              .description
                                              ? (
                                                  <p
                                                    className="
                                                      mt-3
                                                      text-sm
                                                      leading-6
                                                      text-[#62594f]
                                                    "
                                                  >
                                                    {
                                                      product
                                                        .description
                                                    }
                                                  </p>
                                                )
                                              : null
                                          }
                                        </div>

                                        <div
                                          className="
                                            mt-5
                                          "
                                        >
                                          <span
                                            className="
                                              inline-flex
                                              rounded-full
                                              bg-emerald-50
                                              px-3
                                              py-1
                                              text-xs
                                              font-bold
                                              text-emerald-800
                                            "
                                          >
                                            {
                                              copy
                                                .available
                                            }
                                          </span>
                                        </div>
                                      </article>
                                    ),
                                  )
                              }
                            </div>
                          </section>
                        ),
                      )
                    }
                  </div>
                </div>
              </section>
            )
          : null
      }


      {/* ====================================================
          CONVERSION
          ==================================================== */}

      <section
        className="
          bg-[#123d73]
          py-16
          text-white
          sm:py-20
        "
      >
        <div
          className="
            site-container
            grid
            gap-8
            lg:grid-cols-[1fr_auto]
            lg:items-center
          "
        >
          <div>
            <h2
              className="
                max-w-3xl
                font-serif
                text-3xl
                font-bold
                sm:text-4xl
              "
            >
              {copy.footerTitle}
            </h2>

            <p
              className="
                mt-4
                max-w-2xl
                text-base
                leading-7
                text-white/70
              "
            >
              {copy.footerDescription}
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
            "
          >
            {copy.footerAction}
            <span
              className="ml-2"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </section>


      {/* ====================================================
          COLOMBIAN BRAND STRIPE
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
    </main>
  );
}
