import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  buildHomeMetadata,
} from "@/config/seo";

import {
  buildRoutePath,
} from "@/config/routes";

import {
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type AppLocale,
} from "@/i18n/config";


/* ============================================================
   HOME COPY
   ============================================================ */

interface HomeCopy {
  readonly eyebrow:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly primaryAction:
    string;

  readonly secondaryAction:
    string;

  readonly ecosystemEyebrow:
    string;

  readonly ecosystemTitle:
    string;

  readonly ecosystemDescription:
    string;

  readonly gastronomyTitle:
    string;

  readonly gastronomyDescription:
    string;

  readonly experiencesTitle:
    string;

  readonly experiencesDescription:
    string;

  readonly communityTitle:
    string;

  readonly communityDescription:
    string;

  readonly aiTitle:
    string;

  readonly aiDescription:
    string;

  readonly locationsEyebrow:
    string;

  readonly locationsTitle:
    string;

  readonly czapelskaStatus:
    string;

  readonly brzeskaStatus:
    string;

  readonly finalTitle:
    string;

  readonly finalDescription:
    string;
}


const homeCopy:
  Readonly<
    Record<
      AppLocale,
      HomeCopy
    >
  > = {

  pl: {
    eyebrow:
      "Kolumbia w sercu Warszawy",

    title:
      "Smak, kultura i wspólnota Kolumbii.",

    description:
      "Rincón Colombiano łączy autentyczną gastronomię, wydarzenia, catering, społeczność, nagrody i własne doświadczenie cyfrowe w jednym miejscu.",

    primaryAction:
      "Poznaj Rincón",

    secondaryAction:
      "Nasze lokale",

    ecosystemEyebrow:
      "Więcej niż restauracja",

    ecosystemTitle:
      "Jedna marka. Jeden cyfrowy dom.",

    ecosystemDescription:
      "Budujemy miejsce, w którym nasi goście mogą odkrywać kuchnię, zamawiać, rezerwować, organizować wydarzenia, korzystać z nagród i być częścią społeczności Rincón Colombiano.",

    gastronomyTitle:
      "Kolumbijska gastronomia",

    gastronomyDescription:
      "Tradycyjne smaki, specjalności i doświadczenia inspirowane Kolumbią.",

    experiencesTitle:
      "Catering i wydarzenia",

    experiencesDescription:
      "Firmy, rodziny, urodziny, śniadania, niespodzianki, dekoracje i wydarzenia specjalne.",

    communityTitle:
      "Społeczność i nagrody",

    communityDescription:
      "Historie, opinie, rekomendacje, program lojalnościowy i nagrody za zakupy oraz polecenia.",

    aiTitle:
      "Rincón AI",

    aiDescription:
      "Inteligentny asystent przygotowany do pomocy w menu, zamówieniach, rezerwacjach, wydarzeniach i nagrodach.",

    locationsEyebrow:
      "Warszawa",

    locationsTitle:
      "Nasze lokale",

    czapelskaStatus:
      "Otwarte",

    brzeskaStatus:
      "Wkrótce",

    finalTitle:
      "Rincón Colombiano rośnie razem z naszą społecznością.",

    finalDescription:
      "Tworzymy własną platformę, aby relacja z klientem, marka i doświadczenie Rincón Colombiano pozostały w naszym cyfrowym domu.",
  },


  es: {
    eyebrow:
      "Colombia en el corazón de Varsovia",

    title:
      "Sabor, cultura y comunidad colombiana.",

    description:
      "Rincón Colombiano reúne gastronomía auténtica, eventos, catering, comunidad, recompensas y nuestra propia experiencia digital en un solo lugar.",

    primaryAction:
      "Descubre Rincón",

    secondaryAction:
      "Nuestros restaurantes",

    ecosystemEyebrow:
      "Más que un restaurante",

    ecosystemTitle:
      "Una marca. Un hogar digital.",

    ecosystemDescription:
      "Estamos construyendo un lugar donde nuestros clientes puedan descubrir nuestra gastronomía, pedir, reservar, organizar eventos, recibir recompensas y formar parte de la comunidad Rincón Colombiano.",

    gastronomyTitle:
      "Gastronomía colombiana",

    gastronomyDescription:
      "Sabores tradicionales, especialidades y experiencias inspiradas en Colombia.",

    experiencesTitle:
      "Catering y eventos",

    experiencesDescription:
      "Empresas, familias, cumpleaños, desayunos, sorpresas, decoración y celebraciones especiales.",

    communityTitle:
      "Comunidad y recompensas",

    communityDescription:
      "Historias, opiniones, recomendaciones, fidelización y premios por compras y referidos.",

    aiTitle:
      "Rincón AI",

    aiDescription:
      "Un asistente inteligente preparado para ayudarte con menú, pedidos, reservas, eventos y recompensas.",

    locationsEyebrow:
      "Varsovia",

    locationsTitle:
      "Nuestros restaurantes",

    czapelskaStatus:
      "Abierto",

    brzeskaStatus:
      "Próximamente",

    finalTitle:
      "Rincón Colombiano crece junto a nuestra comunidad.",

    finalDescription:
      "Construimos nuestra propia plataforma para que la relación con nuestros clientes, nuestra marca y la experiencia Rincón Colombiano vivan en nuestro propio hogar digital.",
  },


  en: {
    eyebrow:
      "Colombia in the heart of Warsaw",

    title:
      "Colombian flavor, culture and community.",

    description:
      "Rincón Colombiano brings together authentic food, events, catering, community, rewards and our own digital experience in one place.",

    primaryAction:
      "Discover Rincón",

    secondaryAction:
      "Our locations",

    ecosystemEyebrow:
      "More than a restaurant",

    ecosystemTitle:
      "One brand. One digital home.",

    ecosystemDescription:
      "We are building a place where guests can discover our food, order, reserve, organize events, earn rewards and become part of the Rincón Colombiano community.",

    gastronomyTitle:
      "Colombian food",

    gastronomyDescription:
      "Traditional flavors, specialties and experiences inspired by Colombia.",

    experiencesTitle:
      "Catering and events",

    experiencesDescription:
      "Companies, families, birthdays, breakfasts, surprises, decorations and special celebrations.",

    communityTitle:
      "Community and rewards",

    communityDescription:
      "Stories, reviews, recommendations, loyalty and rewards for purchases and referrals.",

    aiTitle:
      "Rincón AI",

    aiDescription:
      "An intelligent assistant designed to help with menus, orders, reservations, events and rewards.",

    locationsEyebrow:
      "Warsaw",

    locationsTitle:
      "Our locations",

    czapelskaStatus:
      "Open",

    brzeskaStatus:
      "Coming soon",

    finalTitle:
      "Rincón Colombiano grows with our community.",

    finalDescription:
      "We are building our own platform so our customer relationships, brand and Rincón Colombiano experience remain in our own digital home.",
  },
};


/* ============================================================
   PAGE PROPS
   ============================================================ */

interface HomePageProps {
  readonly params:
    Promise<{
      readonly locale:
        string;
    }>;
}


/* ============================================================
   STATIC PARAMS
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


/* ============================================================
   METADATA
   ============================================================ */

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
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

  return buildHomeMetadata(
    rawLocale,
  );
}


/* ============================================================
   HOME
   ============================================================ */

export default async function HomePage({
  params,
}: HomePageProps) {
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
    homeCopy[
      locale
    ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
    >
      {/* ====================================================
          TEMPORARY TOP BAR
          Will be replaced by the enterprise Header component.
          ==================================================== */}

      <div
        style={{
          borderBottom:
            "1px solid var(--border)",
          background:
            "var(--surface)",
        }}
      >
        <div
          className="site-container"
          style={{
            minHeight:
              "4.5rem",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              "1rem",

            flexWrap:
              "wrap",
          }}
        >
          <strong
            style={{
              color:
                "var(--brand-blue)",

              fontSize:
                "1.05rem",
            }}
          >
            Rincón Colombiano
          </strong>

          <nav
            aria-label="Language"
            style={{
              display:
                "flex",

              gap:
                "0.5rem",
            }}
          >
            {SUPPORTED_LOCALES.map(
              (
                language,
              ) => (
                <Link
                  key={
                    language
                  }
                  href={
                    buildRoutePath(
                      "home",
                      language,
                    )
                  }
                  aria-current={
                    language ===
                    locale
                      ? "page"
                      : undefined
                  }
                  style={{
                    fontWeight:
                      language ===
                      locale
                        ? 800
                        : 500,

                    padding:
                      "0.45rem 0.6rem",

                    borderRadius:
                      "var(--radius-md)",
                  }}
                >
                  {
                    language
                      .toUpperCase()
                  }
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>


      {/* ====================================================
          HERO
          ==================================================== */}

      <section
        className="section"
        aria-labelledby="home-title"
      >
        <div className="site-container">
          <div
            style={{
              minHeight:
                "min(44rem, calc(100vh - 4.5rem))",

              display:
                "grid",

              alignItems:
                "center",

              paddingBlock:
                "2rem",
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gap:
                  "1.5rem",

                maxWidth:
                  "58rem",
              }}
            >
              <p
                style={{
                  color:
                    "var(--brand-red)",

                  fontWeight:
                    800,

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "0.08em",
                }}
              >
                {copy.eyebrow}
              </p>

              <h1
                id="home-title"
                style={{
                  maxWidth:
                    "52rem",
                }}
              >
                {copy.title}
              </h1>

              <p
                style={{
                  maxWidth:
                    "48rem",

                  fontSize:
                    "clamp(1.1rem, 2vw, 1.35rem)",

                  lineHeight:
                    "var(--leading-relaxed)",
                }}
              >
                {
                  copy.description
                }
              </p>

              <div
                style={{
                  display:
                    "flex",

                  gap:
                    "0.75rem",

                  flexWrap:
                    "wrap",
                }}
              >
                <a
                  className="button-base button-primary"
                  href="#ecosystem"
                >
                  {
                    copy
                      .primaryAction
                  }
                </a>

                <a
                  className="button-base button-outline"
                  href="#locations"
                >
                  {
                    copy
                      .secondaryAction
                  }
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
          ECOSYSTEM
          ==================================================== */}

      <section
        id="ecosystem"
        className="section"
        aria-labelledby="ecosystem-title"
        style={{
          background:
            "var(--surface-secondary)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              display:
                "grid",

              gap:
                "2.5rem",
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gap:
                  "0.75rem",

                maxWidth:
                  "52rem",
              }}
            >
              <p
                style={{
                  color:
                    "var(--brand-blue)",

                  fontWeight:
                    800,

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "0.08em",
                }}
              >
                {
                  copy
                    .ecosystemEyebrow
                }
              </p>

              <h2
                id="ecosystem-title"
              >
                {
                  copy
                    .ecosystemTitle
                }
              </h2>

              <p>
                {
                  copy
                    .ecosystemDescription
                }
              </p>
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(15rem, 1fr))",

                gap:
                  "1rem",
              }}
            >
              <article
                className="surface-elevated"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <h3>
                  {
                    copy
                      .gastronomyTitle
                  }
                </h3>

                <p>
                  {
                    copy
                      .gastronomyDescription
                  }
                </p>
              </article>

              <article
                className="surface-elevated"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <h3>
                  {
                    copy
                      .experiencesTitle
                  }
                </h3>

                <p>
                  {
                    copy
                      .experiencesDescription
                  }
                </p>
              </article>

              <article
                className="surface-elevated"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <h3>
                  {
                    copy
                      .communityTitle
                  }
                </h3>

                <p>
                  {
                    copy
                      .communityDescription
                  }
                </p>
              </article>

              <article
                className="surface-elevated"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <h3>
                  {
                    copy.aiTitle
                  }
                </h3>

                <p>
                  {
                    copy
                      .aiDescription
                  }
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
          LOCATIONS
          ==================================================== */}

      <section
        id="locations"
        className="section"
        aria-labelledby="locations-title"
      >
        <div className="content-container">
          <div
            style={{
              display:
                "grid",

              gap:
                "2rem",
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gap:
                  "0.75rem",
              }}
            >
              <p
                style={{
                  color:
                    "var(--brand-red)",

                  fontWeight:
                    800,

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "0.08em",
                }}
              >
                {
                  copy
                    .locationsEyebrow
                }
              </p>

              <h2
                id="locations-title"
              >
                {
                  copy
                    .locationsTitle
                }
              </h2>
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(17rem, 1fr))",

                gap:
                  "1rem",
              }}
            >
              <article
                className="surface-elevated"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <strong
                  style={{
                    color:
                      "var(--success)",
                  }}
                >
                  {
                    copy
                      .czapelskaStatus
                  }
                </strong>

                <h3>
                  Czapelska 33
                </h3>

                <p>
                  Praga-Południe,
                  Warszawa
                </p>
              </article>

              <article
                className="surface"
                style={{
                  padding:
                    "1.5rem",

                  display:
                    "grid",

                  gap:
                    "0.75rem",
                }}
              >
                <strong
                  style={{
                    color:
                      "var(--warning)",
                  }}
                >
                  {
                    copy
                      .brzeskaStatus
                  }
                </strong>

                <h3>
                  Brzeska 10
                </h3>

                <p>
                  Praga-Północ,
                  Warszawa
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
          BRAND CTA
          ==================================================== */}

      <section
        className="section"
        style={{
          background:
            "var(--stone-950)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              maxWidth:
                "54rem",

              display:
                "grid",

              gap:
                "1rem",
            }}
          >
            <h2
              style={{
                color:
                  "var(--white)",
              }}
            >
              {
                copy
                  .finalTitle
              }
            </h2>

            <p
              style={{
                color:
                  "var(--stone-300)",

                fontSize:
                  "var(--text-lg)",
              }}
            >
              {
                copy
                  .finalDescription
              }
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
