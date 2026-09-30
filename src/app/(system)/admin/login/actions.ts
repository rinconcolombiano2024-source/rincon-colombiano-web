"use server";

import {
  redirect,
} from "next/navigation";

import {
  isAdminEmailAllowed,
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
 * Flujo:
 *
 * 1. Validar entrada.
 * 2. Autenticar con Supabase Auth.
 * 3. Volver a consultar el usuario autenticado.
 * 4. Exigir correo confirmado.
 * 5. Comprobar allowlist administrativa.
 * 6. Rechazar y destruir sesión si algo no coincide.
 * 7. Entrar a /admin únicamente después de superar
 *    todas las barreras.
 *
 * IMPORTANTE:
 *
 * Un usuario normal de Supabase NO obtiene acceso
 * administrativo solamente por conocer esta URL.
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
    /*
     * Fail closed.
     *
     * Si la infraestructura de autenticación no está
     * configurada, nunca dejamos continuar al usuario.
     */
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
     * Mensaje genérico.
     *
     * No revelamos si:
     *
     * - el correo existe,
     * - la contraseña era incorrecta,
     * - la cuenta es administrativa.
     */
    redirect(
      "/admin/login?error=invalid",
    );
  }


  /* ========================================================
     VERIFIED USER
     ======================================================== */

  const {
    data,
    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();

  const user =
    data.user;

  const authenticatedEmail =
    user?.email
      ?.trim()
      .toLowerCase() ??
    null;


  /* ========================================================
     AUTHORIZATION
     ======================================================== */

  const authorized =
    !userError &&
    Boolean(
      user,
    ) &&
    Boolean(
      authenticatedEmail,
    ) &&
    Boolean(
      user?.email_confirmed_at,
    ) &&
    authenticatedEmail ===
      email &&
    (
      authenticatedEmail !==
        null &&
      isAdminEmailAllowed(
        authenticatedEmail,
      )
    );

  if (
    !authorized
  ) {
    /*
     * Una autenticación válida NO implica autorización.
     *
     * Si la cuenta no está permitida destruimos inmediatamente
     * la sesión recién creada.
     */
    await supabase
      .auth
      .signOut();

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
