import Link from "next/link";

import {
  requireAdminIdentity,
} from "@/lib/admin/auth";


/* ============================================================
   RUNTIME
   ============================================================ */

/**
 * El panel administrativo depende de la sesión actual.
 *
 * Nunca debe generarse como contenido estático compartido.
 */
export const dynamic =
  "force-dynamic";

export const revalidate =
  0;


/* ============================================================
   TYPES
   ============================================================ */

type AdminModuleStatus =
  | "active"
  | "planned";


interface AdminModule {
  readonly key:
    string;

  readonly eyebrow:
    string;

  readonly title:
    string;

  readonly description:
    string;

  readonly status:
    AdminModuleStatus;

  readonly href?:
    `/admin${string}`;
}


/* ============================================================
   ADMIN MODULES
   ============================================================ */

const ADMIN_MODULES = [
  {
    key:
      "brand",

    eyebrow:
      "MARCA",

    title:
      "Logo e identidad",

    description:
      "Logo oficial, favicon, imágenes sociales, colores y recursos visuales de Rincón Colombiano.",

    status:
      "active",

    href:
      "/admin/brand",
  },

 {
  key:
    "content",

  eyebrow:
    "CONTENIDO",

  title:
    "Contenido y páginas",

  description:
    "Administra textos, páginas, historias, promociones, servicios y contenido publicado sin modificar código.",

  status:
    "active",

  href:
    "/admin/content",
},

  {
    key:
      "media",

    eyebrow:
      "MULTIMEDIA",

    title:
      "Fotos y videos",

    description:
      "Biblioteca central para fotografías, videos, platos, eventos, campañas e historias.",

    status:
      "planned",
  },

  {
    key:
      "restaurants",

    eyebrow:
      "RESTAURANTES",

    title:
      "Sedes",

    description:
      "Administración de Czapelska, Brzeska y futuras ubicaciones de Rincón Colombiano.",

    status:
      "planned",
  },

  {
    key:
      "menu",

    eyebrow:
      "RC ORDERA",

    title:
      "Menú y pedidos",

    description:
      "Integración del catálogo, disponibilidad y pedidos directamente con RC ORDERA.",

    status:
      "planned",
  },

  {
    key:
      "seo",

    eyebrow:
      "SEO",

    title:
      "Posicionamiento",

    description:
      "Páginas locales, metadatos, indexación, contenido gastronómico y crecimiento orgánico.",

    status:
      "planned",
  },

  {
    key:
      "events",

    eyebrow:
      "VENTAS",

    title:
      "Eventos y catering",

    description:
      "Empresas, familias, cumpleaños, desayunos, sorpresas, decoración y eventos especiales.",

    status:
      "planned",
  },

  {
    key:
      "customers",

    eyebrow:
      "CLIENTES",

    title:
      "CRM y atención",

    description:
      "Consultas, solicitudes, seguimiento, soporte y relación directa con los clientes.",

    status:
      "planned",
  },

  {
    key:
      "rewards",

    eyebrow:
      "FIDELIZACIÓN",

    title:
      "Recompensas y referidos",

    description:
      "Puntos, beneficios, referidos, códigos QR, validaciones y recompensas.",

    status:
      "planned",
  },

  {
    key:
      "community",

    eyebrow:
      "COMUNIDAD",

    title:
      "Red social",

    description:
      "Perfiles, publicaciones, historias, comentarios, reacciones y moderación.",

    status:
      "planned",
  },

  {
    key:
      "ai",

    eyebrow:
      "RINCÓN AI",

    title:
      "Asistente inteligente",

    description:
      "Atención, conocimiento del restaurante, soporte y futura automatización inteligente.",

    status:
      "planned",
  },

  {
    key:
      "analytics",

    eyebrow:
      "DATOS",

    title:
      "Analítica",

    description:
      "Tráfico, conversiones, campañas, SEO, pedidos y comportamiento de los usuarios.",

    status:
      "planned",
  },

  {
    key:
      "security",

    eyebrow:
      "SEGURIDAD",

    title:
      "Administradores",

    description:
      "Usuarios, roles, permisos, sesiones, auditoría y futura autenticación multifactor.",

    status:
      "planned",
  },
] as const satisfies readonly AdminModule[];


/* ============================================================
   SECURITY CONTROLS
   ============================================================ */

const SECURITY_CONTROLS = [
  "Supabase Auth",
  "Autorización servidor",
  "Noindex / nofollow",
  "Deny by default",
] as const;


/* ============================================================
   ADMIN MODULE CARD
   ============================================================ */

function AdminModuleCard({
  module,
}: {
  readonly module:
    AdminModule;
}) {
  const isActive =
    module.status ===
      "active";

  return (
    <article
      className={`
        flex
        min-h-full
        flex-col
        rounded-[1.5rem]
        border
        bg-white
        p-5
        shadow-sm
        transition
        ${
          isActive
            ? "border-[#f7c600] ring-2 ring-[#f7c600]/15"
            : "border-black/5"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[0.65rem]
            font-black
            tracking-[0.13em]
            text-[#123d73]
            uppercase
          "
        >
          {module.eyebrow}
        </span>

        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-[0.6rem]
            font-black
            tracking-[0.08em]
            uppercase
            ${
              isActive
                ? "bg-[#f7c600] text-[#12100e]"
                : "bg-[#f4f1eb] text-[#756b61]"
            }
          `}
        >
          {
            isActive
              ? "Activo"
              : "Planificado"
          }
        </span>
      </div>

      <h3
        className="
          mt-4
          font-serif
          text-xl
          font-bold
        "
      >
        {module.title}
      </h3>

      <p
        className="
          mt-2
          flex-1
          text-sm
          leading-6
          text-[#62594f]
        "
      >
        {module.description}
      </p>

      {
        module.href
          ? (
              <Link
                href={
                  module.href
                }
                className="
                  mt-5
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  self-start
                  rounded-full
                  bg-[#123d73]
                  px-4
                  text-xs
                  font-black
                  text-white
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#0e315d]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#123d73]
                "
              >
                Abrir módulo

                <span
                  className="ml-2"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            )
          : null
      }
    </article>
  );
}


/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */

export default async function AdminDashboardPage() {
  /**
   * Barrera real de autorización.
   *
   * Si no existe una sesión administrativa válida,
   * requireAdminIdentity() redirige al login.
   */
  const admin =
    await requireAdminIdentity();


  return (
    <main
      className="
        min-h-screen
        bg-[#f4f1eb]
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
          ADMIN HEADER
          ==================================================== */}

      <header
        className="
          border-b
          border-white/10
          bg-[#12100e]
          text-white
        "
      >
        <div
          className="
            site-container
            flex
            min-h-20
            flex-wrap
            items-center
            justify-between
            gap-4
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                grid
                size-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#f7c600]
                text-sm
                font-black
                text-[#12100e]
              "
              aria-hidden="true"
            >
              RC
            </div>

            <div>
              <p
                className="
                  font-serif
                  text-lg
                  font-bold
                "
              >
                Rincón Admin
              </p>

              <p
                className="
                  text-xs
                  text-white/50
                "
              >
                Centro de administración
              </p>
            </div>
          </div>


          <Link
            href="/pl"
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              rounded-full
              border
              border-white/15
              px-4
              text-xs
              font-bold
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#f7c600]
            "
          >
            Ver sitio público
          </Link>
        </div>
      </header>


      {/* ====================================================
          MAIN CONTENT
          ==================================================== */}

      <div
        className="
          site-container
          py-8
          sm:py-12
        "
      >
        {/* ==================================================
            WELCOME
            ================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-[#123d73]
            p-6
            text-white
            shadow-xl
            sm:p-9
            lg:p-10
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              size-72
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
              -bottom-28
              -left-20
              size-64
              rounded-full
              bg-[#c92d39]/20
              blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              relative
              grid
              gap-8
              lg:grid-cols-[1fr_auto]
              lg:items-end
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
                Administración privada
              </p>

              <h1
                className="
                  mt-4
                  max-w-4xl
                  font-serif
                  text-3xl
                  font-bold
                  leading-tight
                  tracking-[-0.025em]
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Centro digital de Rincón Colombiano
              </h1>

              <p
                className="
                  mt-4
                  max-w-3xl
                  text-base
                  leading-7
                  text-white/70
                  sm:text-lg
                "
              >
                La administración central para gestionar
                identidad, contenido, restaurantes, menú,
                multimedia, posicionamiento, clientes,
                comunidad, recompensas y tecnología de
                Rincón Colombiano.
              </p>
            </div>


            {/* ADMIN IDENTITY */}

            <div
              className="
                max-w-sm
                rounded-2xl
                border
                border-white/10
                bg-white/10
                px-5
                py-4
                backdrop-blur
              "
            >
              <p
                className="
                  text-[0.65rem]
                  font-black
                  tracking-[0.12em]
                  text-white/50
                  uppercase
                "
              >
                Sesión autorizada
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  font-bold
                "
                title={
                  admin.email
                }
              >
                {admin.email}
              </p>
            </div>
          </div>
        </section>


        {/* ==================================================
            ACTIVE MODULE
            ================================================== */}

        <section
          className="
            mt-8
            overflow-hidden
            rounded-[2rem]
            border
            border-[#e4dccf]
            bg-white
            shadow-sm
          "
          aria-labelledby="active-brand-module"
        >
          <div
            className="
              grid
              lg:grid-cols-[0.82fr_1.18fr]
            "
          >
            <div
              className="
                bg-[#f7c600]
                p-7
                sm:p-9
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.15em]
                  uppercase
                "
              >
                Módulo activo
              </p>

              <h2
                id="active-brand-module"
                className="
                  mt-4
                  font-serif
                  text-3xl
                  font-bold
                "
              >
                Marca y logo
              </h2>

              <p
                className="
                  mt-4
                  max-w-lg
                  text-sm
                  font-medium
                  leading-6
                  text-[#4b4238]
                "
              >
                Administra el logo oficial, favicon,
                variantes, imágenes sociales y recursos
                visuales de Rincón Colombiano desde una
                zona privada.
              </p>
            </div>


            <div
              className="
                flex
                items-center
                p-7
                sm:p-9
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    tracking-[0.14em]
                    text-[#123d73]
                    uppercase
                  "
                >
                  Identidad central
                </p>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-[#62594f]
                  "
                >
                  El módulo de identidad visual ya está
                  construido. Desde aquí podrás administrar
                  el logo principal, variantes, favicon e
                  imágenes sociales sin editar el código
                  fuente.
                </p>

                <Link
                  href="/admin/brand"
                  className="
                    mt-5
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-full
                    bg-[#123d73]
                    px-5
                    text-xs
                    font-black
                    text-white
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#0e315d]
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#123d73]
                  "
                >
                  Abrir Marca e identidad

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            MODULES
            ================================================== */}

        <section
          className="mt-10"
          aria-labelledby="admin-modules-title"
        >
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.16em]
                  text-[#756b61]
                  uppercase
                "
              >
                Plataforma
              </p>

              <h2
                id="admin-modules-title"
                className="
                  mt-2
                  font-serif
                  text-3xl
                  font-bold
                "
              >
                Módulos administrativos
              </h2>
            </div>

            <p
              className="
                text-xs
                font-bold
                text-[#756b61]
              "
            >
              Acceso privado • no indexado
            </p>
          </div>


          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {
              ADMIN_MODULES.map(
                (
                  module,
                ) => (
                  <AdminModuleCard
                    key={
                      module.key
                    }
                    module={
                      module
                    }
                  />
                ),
              )
            }
          </div>
        </section>


        {/* ==================================================
            SYSTEM STATUS
            ================================================== */}

        <section
          className="
            mt-10
            rounded-[2rem]
            bg-[#12100e]
            p-6
            text-white
            sm:p-8
          "
          aria-labelledby="admin-security-title"
        >
          <p
            className="
              text-xs
              font-black
              tracking-[0.15em]
              text-[#f7c600]
              uppercase
            "
          >
            Seguridad
          </p>

          <h2
            id="admin-security-title"
            className="
              mt-3
              font-serif
              text-2xl
              font-bold
            "
          >
            Base administrativa protegida
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-white/60
            "
          >
            El panel utiliza autenticación y autorización
            del lado del servidor. La metadata de robots
            evita indexación, pero no se utiliza como
            mecanismo de seguridad.
          </p>

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {
              SECURITY_CONTROLS.map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-white/80
                      "
                    >
                      {item}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        font-black
                        text-emerald-300
                      "
                    >
                      Configurado
                    </p>
                  </div>
                ),
              )
            }
          </div>
        </section>


        {/* ==================================================
            FOOTER
            ================================================== */}

        <footer
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            border-black/10
            pt-6
            text-xs
            text-[#756b61]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            Rincón Colombiano • Administración privada
          </span>

          <div
            className="
              flex
              flex-wrap
              gap-4
            "
          >
            <Link
              href="/admin/brand"
              className="
                font-bold
                text-[#123d73]
                hover:underline
              "
            >
              Marca e identidad
            </Link>

            <Link
              href="/pl"
              className="
                font-bold
                text-[#123d73]
                hover:underline
              "
            >
              Ver sitio público →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
