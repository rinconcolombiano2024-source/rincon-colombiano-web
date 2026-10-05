"use server";

import {
  redirect,
} from "next/navigation";

import {
  getAdminAccessWithClient,
} from "@/lib/admin/auth";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


/* ============================================================
   SECURITY LIMITS
   ============================================================ */

const MAX_EMAIL_LENGTH =
  320;

const MAX_PASSWORD_LENGTH =
  1024;


/* ============================================================
   FORM DATA
   ============================================================ */

function readFormString(
  formData:
    FormData,
  field:
    string,
): string | null {

  const value =
    formData.get(
      field,
    );


  return typeof value ===
    "string"
    ? value
    : null;
}


/* ============================================================
   LOGIN
   ============================================================ */

/**
 * Inicio de sesión administrativo.
 *
 * FLUJO:
 *
 * 1. Validar entrada.
 * 2. Autenticar mediante Supabase Auth.
 * 3. Verificar nuevamente el usuario desde Supabase.
 * 4. Consultar web_private.admin_members mediante RPC.
 * 5. Exigir owner/editor/publisher activo.
 * 6. Destruir inmediatamente la sesión si no está autorizado.
 * 7. Entrar a /admin.
 *
 * AUTENTICACIÓN:
 * Supabase Auth.
 *
 * AUTORIZACIÓN:
 * web_private.admin_members.
 */
export async function loginAdmin(
  formData:
    FormData,
): Promise<void> {

  const rawEmail =
    readFormString(
      formData,
      "email",
    );


  const password =
    readFormString(
      formData,
      "password",
    );


  /* ========================================================
     REQUIRED VALUES
     ======================================================== */

  if (
    rawEmail ===
      null ||
    password ===
      null
  ) {
    redirect(
      "/admin/login?error=missing",
    );
  }


  const email =
    rawEmail
      .trim()
      .toLowerCase();


  if (
    email.length ===
      0 ||
    password.length ===
      0
  ) {
    redirect(
      "/admin/login?error=missing",
    );
  }


  /* ========================================================
     INPUT BOUNDS
     ======================================================== */

  if (
    email.length >
      MAX_EMAIL_LENGTH ||
    password.length >
      MAX_PASSWORD_LENGTH
  ) {
    redirect(
      "/admin/login?error=invalid",
    );
  }


  /* ========================================================
     SUPABASE
     ======================================================== */

  const supabase =
    await createSupabaseServerClient();


  if (
    !supabase
  ) {
    redirect(
      "/admin/login?error=configuration",
    );
  }


  /* ========================================================
     AUTHENTICATION
     ======================================================== */

  const {
    error:
      signInError,
  } =
    await supabase
      .auth
      .signInWithPassword({
        email,
        password,
      });


  if (
    signInError
  ) {
    /*
     * Mensaje deliberadamente genérico.
     *
     * No revelamos:
     *
     * - si el correo existe;
     * - si la contraseña falló;
     * - si la cuenta tiene privilegios administrativos.
     */
    redirect(
      "/admin/login?error=invalid",
    );
  }


  /* ========================================================
     AUTHORIZATION
     ======================================================== */

  /*
   * Utilizamos exactamente la misma fuente de autorización
   * que utiliza requireAdminIdentity().
   *
   * No existe una segunda allowlist paralela.
   */
  const access =
    await getAdminAccessWithClient(
      supabase,
    );


  if (
    access.status !==
      "authorized" ||
    !access.admin
  ) {

    /*
     * Autenticación válida NO significa autorización.
     *
     * Eliminamos inmediatamente la sesión si esta cuenta no
     * pertenece al panel administrativo.
     */
    await supabase
      .auth
      .signOut();


    if (
      access.status ===
        "not-configured"
    ) {
      redirect(
        "/admin/login?error=configuration",
      );
    }


    redirect(
      "/admin/login?error=invalid",
    );
  }


  /* ========================================================
     SUCCESS
     ======================================================== */

  redirect(
    "/admin",
  );
}
