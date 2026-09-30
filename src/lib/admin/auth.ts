import {
  redirect,
} from "next/navigation";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


/* ============================================================
   TYPES
   ============================================================ */

export interface AdminIdentity {
  readonly id:
    string;

  readonly email:
    string;
}


export type AdminAccessStatus =
  | "authorized"
  | "unauthenticated"
  | "unauthorized"
  | "not-configured";


export interface AdminAccessResult {
  readonly status:
    AdminAccessStatus;

  readonly admin:
    AdminIdentity | null;
}


/* ============================================================
   EMAIL NORMALIZATION
   ============================================================ */

function normalizeEmail(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}


/* ============================================================
   ADMIN ALLOWLIST
   ============================================================ */

/**
 * Bootstrap administrativo.
 *
 * Esta lista NO reemplazará el futuro sistema de:
 *
 * - admin_users
 * - admin_roles
 * - admin_permissions
 * - MFA
 * - auditoría
 *
 * Su función actual es impedir que cualquier usuario de
 * Supabase Auth se convierta automáticamente en administrador.
 *
 * Principio:
 *
 * deny by default.
 */
function getAllowedAdminEmails():
  ReadonlySet<string> {
  const rawValue =
    process.env[
      "ADMIN_ALLOWED_EMAILS"
    ];

  if (
    typeof rawValue !==
      "string"
  ) {
    return new Set<string>();
  }

  const normalizedValue =
    rawValue.trim();

  if (
    normalizedValue.length ===
      0
  ) {
    return new Set<string>();
  }

  return new Set(
    normalizedValue
      .split(
        ",",
      )
      .map(
        (
          email,
        ) =>
          normalizeEmail(
            email,
          ),
      )
      .filter(
        (
          email,
        ) =>
          email.length >
          0,
      ),
  );
}


/* ============================================================
   EMAIL AUTHORIZATION
   ============================================================ */

export function isAdminEmailAllowed(
  email:
    string,
): boolean {
  const normalizedEmail =
    normalizeEmail(
      email,
    );

  if (
    normalizedEmail.length ===
      0
  ) {
    return false;
  }

  return getAllowedAdminEmails()
    .has(
      normalizedEmail,
    );
}


/* ============================================================
   CURRENT ADMIN ACCESS
   ============================================================ */

/**
 * Comprueba dos barreras independientes:
 *
 * 1. Supabase Auth:
 *    la sesión debe pertenecer a un usuario real.
 *
 * 2. Autorización administrativa:
 *    el correo debe estar explícitamente autorizado.
 *
 * No usamos solamente cookies ni datos enviados por el cliente
 * para decidir si alguien es administrador.
 */
export async function getAdminAccess():
  Promise<AdminAccessResult> {
  const allowedEmails =
    getAllowedAdminEmails();

  /*
   * Sin allowlist configurada:
   * nadie entra.
   */
  if (
    allowedEmails.size ===
      0
  ) {
    return {
      status:
        "not-configured",

      admin:
        null,
    };
  }

  const supabase =
    await createSupabaseServerClient();

  /*
   * Si Supabase no está configurado correctamente,
   * el panel administrativo permanece cerrado.
   */
  if (
    !supabase
  ) {
    return {
      status:
        "not-configured",

      admin:
        null,
    };
  }

  /*
   * getUser() consulta/verifica al usuario con Supabase.
   *
   * Para autorización administrativa no confiamos
   * únicamente en una sesión leída desde cookies.
   */
  const {
    data,
    error,
  } =
    await supabase
      .auth
      .getUser();

  if (
    error ||
    !data.user
  ) {
    return {
      status:
        "unauthenticated",

      admin:
        null,
    };
  }

  const email =
    data.user.email;

  if (
    typeof email !==
      "string" ||
    email.trim().length ===
      0
  ) {
    return {
      status:
        "unauthorized",

      admin:
        null,
    };
  }

  const normalizedEmail =
    normalizeEmail(
      email,
    );

  if (
    !allowedEmails.has(
      normalizedEmail,
    )
  ) {
    return {
      status:
        "unauthorized",

      admin:
        null,
    };
  }

  return {
    status:
      "authorized",

    admin: {
      id:
        data.user.id,

      email:
        normalizedEmail,
    },
  };
}


/* ============================================================
   ADMIN GUARD
   ============================================================ */

/**
 * Utilizado por páginas administrativas protegidas.
 *
 * Resultado:
 *
 * authorized
 *   → continúa.
 *
 * unauthenticated
 *   → login.
 *
 * unauthorized
 *   → login + acceso denegado.
 *
 * not-configured
 *   → login + error de configuración.
 */
export async function requireAdminIdentity():
  Promise<AdminIdentity> {
  const access =
    await getAdminAccess();

  if (
    access.status ===
      "not-configured"
  ) {
    redirect(
      "/admin/login?error=configuration",
    );
  }

  if (
    access.status ===
      "unauthenticated"
  ) {
    redirect(
      "/admin/login",
    );
  }

  if (
    access.status ===
      "unauthorized"
  ) {
    redirect(
      "/admin/login?error=forbidden",
    );
  }

  if (
    !access.admin
  ) {
    /*
     * Defensa adicional.
     *
     * En teoría este estado no debería ocurrir cuando
     * status === "authorized", pero nunca concedemos
     * acceso basándonos en una suposición.
     */
    redirect(
      "/admin/login",
    );
  }

  return access.admin;
}
