/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * Home Page
 * ============================================================
 *
 * Esta es la página pública principal del restaurante.
 *
 * Principios:
 * - Server Component por defecto.
 * - Cero JavaScript innecesario en el navegador.
 * - HTML semántico.
 * - Accesibilidad.
 * - Mobile-first.
 * - SEO-friendly.
 * - Preparada para extraer cada sección a componentes.
 * - Preparada para futura internacionalización.
 *
 * IMPORTANTE:
 * Este archivo NO debe convertirse en un archivo gigante.
 * La lógica compleja será extraída progresivamente a:
 *
 * src/components/home/
 * src/components/layout/
 * src/components/ui/
 */

const features = [
  {
    title: "Autentyczna kuchnia kolumbijska",
    description:
      "Tradycyjne smaki Kolumbii przygotowywane z sercem w Warszawie.",
  },
  {
    title: "Zamówienia online",
    description:
      "Własny system zamówień Rincón Colombiano zintegrowany z RC ORDERA.",
  },
  {
    title: "Dostawa i odbiór",
    description:
      "Sprawdzanie obszaru dostawy oraz możliwość odbioru osobistego.",
  },
] as const;

const services = [
  {
    title: "Menu",
    description:
      "Poznaj nasze kolumbijskie dania, przekąski, napoje i specjalności.",
    href: "#menu",
  },
  {
    title: "Zamów online",
    description:
      "Złóż zamówienie bezpośrednio w Rincón Colombiano.",
    href: "#zamow",
  },
  {
    title: "Catering",
    description:
      "Kolumbijska gastronomia na wydarzenia, firmy i prywatne uroczystości.",
    href: "#catering",
  },
  {
    title: "Nasze lokale",
    description:
      "Poznaj lokalizacje Rincón Colombiano w Warszawie.",
    href: "#lokale",
  },
] as const;

export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
    >
      {/* ======================================================
          HERO
          ====================================================== */}

      <section
        className="section"
        aria-labelledby="home-hero-title"
      >
        <div className="site-container">
          <div
            style={{
              display: "grid",
              gap: "2rem",
              alignItems: "center",
              minHeight: "min(48rem, calc(100vh - var(--header-height)))",
            }}
          >
            <div
              style={{
                maxWidth: "54rem",
                display: "grid",
                gap: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "var(--brand-red)",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "var(--text-sm)",
                }}
              >
                Kolumbia w sercu Warszawy
              </p>

              <h1 id="home-hero-title">
                Prawdziwy smak
                <br />
                Kolumbii
              </h1>

              <p
                style={{
                  maxWidth: "46rem",
                  fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Rincón Colombiano to miejsce, w którym tradycyjna kuchnia
                kolumbijska spotyka się z domową atmosferą, autentycznymi
                recepturami i smakiem naszej kultury.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <a
                  className="button-base button-primary"
                  href="#zamow"
                >
                  Zamów online
                </a>

                <a
                  className="button-base button-secondary"
                  href="#menu"
                >
                  Zobacz menu
                </a>

                <a
                  className="button-base button-outline"
                  href="#lokale"
                >
                  Nasze lokale
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TRUST / VALUE PROPOSITION
          ====================================================== */}

      <section
        className="section-compact"
        aria-labelledby="why-rincon-title"
        style={{
          background: "var(--surface)",
          borderBlock: "1px solid var(--border)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gap: "2rem",
            }}
          >
            <div
              style={{
                maxWidth: "44rem",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <p
                style={{
                  color: "var(--brand-blue)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "var(--text-sm)",
                }}
              >
                Rincón Colombiano
              </p>

              <h2 id="why-rincon-title">
                Więcej niż restauracja
              </h2>

              <p>
                Chcemy przybliżać Warszawie prawdziwą kolumbijską gastronomię,
                kulturę i gościnność.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
                gap: "1rem",
              }}
            >
              {features.map((feature) => (
                <article
                  className="surface"
                  key={feature.title}
                  style={{
                    padding: "1.5rem",
                    display: "grid",
                    gap: "0.75rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "var(--text-xl)",
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SERVICES / NAVIGATION HUB
          ====================================================== */}

      <section
        className="section"
        aria-labelledby="services-title"
      >
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gap: "2.5rem",
            }}
          >
            <div
              style={{
                maxWidth: "46rem",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <p
                style={{
                  color: "var(--brand-red)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "var(--text-sm)",
                }}
              >
                Wszystko w jednym miejscu
              </p>

              <h2 id="services-title">
                Rincón Colombiano online
              </h2>

              <p>
                Menu, zamówienia, dostawa, catering i informacje o naszych
                lokalach będą dostępne bezpośrednio na naszej własnej stronie.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
                gap: "1rem",
              }}
            >
              {services.map((service) => (
                <a
                  className="surface-elevated interactive"
                  href={service.href}
                  key={service.title}
                  style={{
                    minHeight: "13rem",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "0.75rem",
                    }}
                  >
                    <h3>{service.title}</h3>

                    <p>{service.description}</p>
                  </div>

                  <span
                    aria-hidden="true"
                    style={{
                      fontWeight: 800,
                      fontSize: "1.25rem",
                    }}
                  >
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MENU
          ====================================================== */}

      <section
        id="menu"
        className="section"
        aria-labelledby="menu-title"
        style={{
          background: "var(--stone-950)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              maxWidth: "48rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <p
              style={{
                color: "var(--brand-yellow)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "var(--text-sm)",
              }}
            >
              Nasze menu
            </p>

            <h2
              id="menu-title"
              style={{
                color: "var(--white)",
              }}
            >
              Smaki Kolumbii
            </h2>

            <p
              style={{
                color: "var(--stone-300)",
                fontSize: "var(--text-lg)",
              }}
            >
              Menu zostanie połączone bezpośrednio z systemem RC ORDERA, dzięki
              czemu ceny, dostępność i produkty będą zarządzane z jednego
              miejsca.
            </p>

            <div>
              <a
                className="button-base button-primary"
                href="#zamow"
              >
                Przejdź do zamówień
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ORDER / RC ORDERA
          ====================================================== */}

      <section
        id="zamow"
        className="section"
        aria-labelledby="order-title"
      >
        <div className="content-container">
          <div
            className="surface-elevated"
            style={{
              padding: "clamp(1.5rem, 5vw, 4rem)",
              display: "grid",
              gap: "1.5rem",
            }}
          >
            <p
              style={{
                color: "var(--brand-blue)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "var(--text-sm)",
              }}
            >
              RC ORDERA
            </p>

            <h2 id="order-title">
              Zamawiaj bezpośrednio u nas
            </h2>

            <p
              style={{
                maxWidth: "46rem",
                fontSize: "var(--text-lg)",
              }}
            >
              Własny system zamówień pozwoli nam kontrolować menu, obszar
              dostawy, odbiór osobisty i obsługę zamówień bez ograniczeń
              zewnętrznej platformy.
            </p>

            <p
              style={{
                color: "var(--text-muted)",
              }}
            >
              System zamówień jest obecnie przygotowywany do integracji z tą
              stroną.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          LOCATIONS
          ====================================================== */}

      <section
        id="lokale"
        className="section"
        aria-labelledby="locations-title"
        style={{
          background: "var(--surface-secondary)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gap: "2rem",
            }}
          >
            <div
              style={{
                maxWidth: "44rem",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <p
                style={{
                  color: "var(--brand-red)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "var(--text-sm)",
                }}
              >
                Warszawa
              </p>

              <h2 id="locations-title">
                Nasze lokale
              </h2>

              <p>
                Platforma została zaprojektowana od początku tak, aby obsługiwać
                wiele lokalizacji Rincón Colombiano.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))",
                gap: "1rem",
              }}
            >
              <article
                className="surface-elevated"
                style={{
                  padding: "1.5rem",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "var(--radius-full)",
                      background: "var(--success-soft)",
                      color: "var(--success)",
                      fontWeight: 800,
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    Otwarte
                  </span>
                </div>

                <h3>Czapelska 33</h3>

                <p>Praga Południe, Warszawa</p>
              </article>

              <article
                className="surface"
                style={{
                  padding: "1.5rem",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "var(--radius-full)",
                      background: "var(--warning-soft)",
                      color: "var(--warning)",
                      fontWeight: 800,
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    Wkrótce
                  </span>
                </div>

                <h3>Brzeska 10</h3>

                <p>Praga Północ, Warszawa</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CATERING
          ====================================================== */}

      <section
        id="catering"
        className="section"
        aria-labelledby="catering-title"
      >
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gap: "1rem",
              maxWidth: "50rem",
            }}
          >
            <p
              style={{
                color: "var(--brand-blue)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "var(--text-sm)",
              }}
            >
              Catering
            </p>

            <h2 id="catering-title">
              Kolumbijska gastronomia na Twoje wydarzenie
            </h2>

            <p
              style={{
                fontSize: "var(--text-lg)",
              }}
            >
              Catering dla firm, wydarzeń kulturalnych, spotkań prywatnych,
              festiwali i większych zamówień.
            </p>

            <div>
              <a
                className="button-base button-secondary"
                href="#kontakt"
              >
                Zapytaj o catering
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTACT CTA
          ====================================================== */}

      <section
        id="kontakt"
        className="section"
        aria-labelledby="contact-title"
        style={{
          background: "var(--brand-yellow)",
        }}
      >
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gap: "1rem",
              maxWidth: "52rem",
            }}
          >
            <h2 id="contact-title">
              Do zobaczenia w Rincón Colombiano
            </h2>

            <p
              style={{
                color: "var(--stone-800)",
                fontSize: "var(--text-lg)",
              }}
            >
              Budujemy nową cyfrową przestrzeń Rincón Colombiano, aby kontakt,
              menu i zamówienia były prostsze, szybsze i dostępne w jednym
              miejscu.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
