import {
  redirect,
} from "next/navigation";

import {
  getAdminAccess,
} from "@/lib/admin/auth";

import {
  loginAdmin,
} from "./actions";


/* ============================================================
   TYPES
   ============================================================ */

interface AdminLoginPageProps {
  readonly searchParams:
    Promise<{
      readonly error?:
        string | string[];
    }>;
}


/* ============================================================
   ERROR COPY
   ============================================================ */

const LOGIN_ERROR_MESSAGES:
  Readonly<
    Record<
      string,
      string
    >
  > = {
  missing:
    "Escribe el correo administrativo y la contraseña.",

  invalid:
    "No fue posible iniciar sesión. Verifica tus credenciales e inténtalo nuevamente.",

  forbidden:
    "Esta cuenta no tiene autorización para acceder al administrador.",

  configuration:
    "El acceso administrativo todavía no está disponible en este entorno.",
};


/* ============================================================
   HELPERS
   ============================================================ */

function getErrorMessage(
  error:
    string | string[] | undefined,
): string | null {
  if (
    typeof error !==
      "string"
  ) {
    return null;
  }

  return LOGIN_ERROR_MESSAGES[
    error
  ] ??
    null;
}


/* ============================================================
   ADMIN LOGIN
   ============================================================ */

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  /*
   * Si ya existe una sesión administrativa válida,
   * no mostramos nuevamente el formulario.
   */
  const access =
    await getAdminAccess();

  if (
    access.status ===
      "authorized"
  ) {
    redirect(
      "/admin",
    );
  }

  const {
    error,
  } =
    await searchParams;

  const errorMessage =
    getErrorMessage(
      error,
    );


  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#12100e]
        px-4
        py-8
        text-[#12100e]
        sm:px-6
        sm:py-10
      "
    >
      {/* ====================================================
          BRAND BACKGROUND
          ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-2
          bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -top-40
          -right-40
          size-[30rem]
          rounded-full
          bg-[#123d73]/25
          blur-3xl
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-48
          -left-40
          size-[32rem]
          rounded-full
          bg-[#c92d39]/15
          blur-3xl
        "
        aria-hidden="true"
      />


      {/* ====================================================
          CONTENT
          ==================================================== */}

      <div
        className="
          relative
          mx-auto
          grid
          min-h-[calc(100vh-4rem)]
          max-w-6xl
          items-center
          gap-10
          lg:grid-cols-[1.05fr_0.95fr]
          lg:gap-16
        "
      >
        {/* ==================================================
            BRAND SIDE
            ================================================== */}

        <section
          className="
            text-white
          "
          aria-labelledby="admin-login-title"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-xs
              font-black
              tracking-[0.14em]
              text-white/80
              uppercase
              backdrop-blur
            "
          >
            <span
              className="
                size-2
                rounded-full
                bg-[#f7c600]
              "
              aria-hidden="true"
            />

            Rincón Admin
          </div>

          <h1
            id="admin-login-title"
            className="
              mt-7
              max-w-3xl
              font-serif
              text-4xl
              font-bold
              leading-[1.05]
              tracking-[-0.03em]
              sm:text-5xl
              lg:text-6xl
            "
          >
            El centro privado
            para construir y
            administrar Rincón
            Colombiano.
          </h1>

          <p
            className="
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-white/65
              sm:text-lg
            "
          >
            Una plataforma preparada para administrar
            contenido, restaurantes, multimedia, SEO,
            clientes, eventos, comunidad, recompensas,
            Rincón AI y las futuras operaciones digitales
            de la marca.
          </p>

          <div
            className="
              mt-8
              flex
              flex-wrap
              gap-2
            "
          >
            {
              [
                "Acceso privado",
                "Supabase Auth",
                "Deny by default",
                "No indexado",
              ].map(
                (
                  item,
                ) => (
                  <span
                    key={
                      item
                    }
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-white/60
                    "
                  >
                    {item}
                  </span>
                ),
              )
            }
          </div>
        </section>


        {/* ==================================================
            LOGIN CARD
            ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-white
            shadow-[0_30px_100px_rgba(0,0,0,0.35)]
          "
          aria-label="Inicio de sesión administrativo"
        >
          <div
            className="
              h-1.5
              bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]
            "
            aria-hidden="true"
          />

          <div
            className="
              p-6
              sm:p-9
            "
          >
            {/* ==============================================
                IDENTITY
                ============================================== */}

            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  grid
                  size-14
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-[#f7c600]
                  text-base
                  font-black
                  text-[#12100e]
                  shadow-sm
                "
                aria-hidden="true"
              >
                RC
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-black
                    tracking-[0.14em]
                    text-[#756b61]
                    uppercase
                  "
                >
                  Rincón Colombiano
                </p>

                <h2
                  className="
                    mt-1
                    font-serif
                    text-2xl
                    font-bold
                    tracking-[-0.02em]
                    text-[#12100e]
                  "
                >
                  Iniciar sesión
                </h2>
              </div>
            </div>


            {/* ==============================================
                SECURITY NOTICE
                ============================================== */}

            <div
              className="
                mt-7
                rounded-2xl
                border
                border-[#123d73]/10
                bg-[#123d73]/5
                px-4
                py-3
              "
            >
              <p
                className="
                  text-xs
                  font-bold
                  leading-5
                  text-[#123d73]
                "
              >
                Área exclusiva para personal administrativo
                autorizado de Rincón Colombiano.
              </p>
            </div>


            {/* ==============================================
                ERROR
                ============================================== */}

            {
              errorMessage
                ? (
                    <div
                      role="alert"
                      className="
                        mt-5
                        rounded-2xl
                        border
                        border-[#c92d39]/20
                        bg-[#c92d39]/5
                        px-4
                        py-3
                        text-sm
                        font-medium
                        leading-6
                        text-[#8d2029]
                      "
                    >
                      {errorMessage}
                    </div>
                  )
                : null
            }


            {/* ==============================================
                FORM
                ============================================== */}

            <form
              action={
                loginAdmin
              }
              className="
                mt-7
                space-y-5
              "
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-[#2d2925]
                  "
                >
                  Correo administrativo
                </label>

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  maxLength={320}
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  autoCapitalize="none"
                  className="
                    min-h-12
                    w-full
                    rounded-2xl
                    border
                    border-[#d8d0c5]
                    bg-[#faf9f6]
                    px-4
                    text-base
                    text-[#12100e]
                    outline-none
                    transition
                    placeholder:text-[#9b9288]
                    focus:border-[#123d73]
                    focus:ring-2
                    focus:ring-[#123d73]/15
                  "
                  placeholder="correo@empresa.com"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-[#2d2925]
                  "
                >
                  Contraseña
                </label>

                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  maxLength={1024}
                  autoComplete="current-password"
                  className="
                    min-h-12
                    w-full
                    rounded-2xl
                    border
                    border-[#d8d0c5]
                    bg-[#faf9f6]
                    px-4
                    text-base
                    text-[#12100e]
                    outline-none
                    transition
                    placeholder:text-[#9b9288]
                    focus:border-[#123d73]
                    focus:ring-2
                    focus:ring-[#123d73]/15
                  "
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#123d73]
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#0e315d]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#123d73]
                "
              >
                Entrar al administrador

                <span
                  className="
                    ml-2
                  "
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </form>


            {/* ==============================================
                FOOTNOTE
                ============================================== */}

            <p
              className="
                mt-5
                text-xs
                leading-5
                text-[#756b61]
              "
            >
              La autenticación no concede por sí sola
              privilegios administrativos. El servidor
              verifica además que la cuenta esté expresamente
              autorizada.
            </p>

            <div
              className="
                mt-7
                border-t
                border-black/5
                pt-5
              "
            >
              <a
                href="/pl"
                className="
                  inline-flex
                  items-center
                  text-sm
                  font-bold
                  text-[#123d73]
                  transition
                  hover:underline
                "
              >
                <span
                  className="
                    mr-2
                  "
                  aria-hidden="true"
                >
                  ←
                </span>

                Volver a la web pública
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
