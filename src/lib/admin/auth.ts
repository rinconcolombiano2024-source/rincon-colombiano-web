import {
  redirect,
} from "next/navigation";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


/* ============================================================
   ADMIN ROLES
   ============================================================ */

export type AdminRole =
  | "owner"
  | "editor"
  | "publisher";


/* ============================================================
   TYPES
   ============================================================ */

export interface AdminIdentity {
  readonly id:
    string;

  readonly email:
    string;

  readonly role:
    AdminRole;
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
   VALUE VALIDATION
   ============================================================ */

function isNonEmptyString(
  value:
    unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}


function normalizeEmail(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}


export function isAdminRole(
  value:
    unknown,
): value is AdminRole {
  return (
    value ===
      "owner" ||
    value ===
      "editor" ||
    value ===
      "publisher"
  );
}


/* ============================================================
   RPC RESULT
   ============================================================ */

function normalizeAdminIdentity(
  value:
    unknown,
): AdminIdentity | null {
  if (
    typeof value !==
      "object" ||
    value ===
      null ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  const record =
    value as Readonly<
      Record<
        string,
        unknown
      >
    >;

  const userId =
    record[
      "user_id"
    ];

  const email =
    record[
      "email"
    ];

  const role =
    record[
      "role"
    ];

  if (
    !isNonEmptyString(
      userId,
    ) ||
    !isNonEmptyString(
      email,
    ) ||
    !isAdminRole(
      role,
    )
  ) {
    return null;
  }

  return {
    id:
      userId.trim(),

    email:
      normalizeEmail(
        email,
      ),

    role,
  };
}


/* ============================================================
   ADMIN ACCESS USING CURRENT SUPABASE SESSION
   ============================================================ */

/**
 * Fuente única de autorización administrativa.
 *
 * AUTENTICACIÓN:
 * Supabase Auth.
 *
 * AUTORIZACIÓN:
 * web_private.admin_members
 * mediante:
 *
 * public.web_admin_get_current_access()
 *
 * IMPORTANTE:
 *
 * Ya no utilizamos una lista paralela de correos para decidir
 * quién tiene acceso al panel.
 */
export async function getAdminAccessWithClient(
  supabase:
    SupabaseClient,
): Promise<AdminAccessResult> {

  /* ========================================================
     VERIFIED AUTH USER
     ======================================================== */

  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {
    return {
      status:
        "unauthenticated",

      admin:
        null,
    };
  }


  const user =
    userData.user;


  const authenticatedEmail =
    typeof user.email ===
      "string"
      ? normalizeEmail(
          user.email,
        )
      : "";


  /*
   * Un administrador debe tener:
   *
   * - usuario válido;
   * - email válido;
   * - email confirmado.
   */
  if (
    authenticatedEmail.length ===
      0 ||
    !user.email_confirmed_at
  ) {
    return {
      status:
        "unauthorized",

      admin:
        null,
    };
  }


  /* ========================================================
     DATABASE AUTHORIZATION
     ======================================================== */

  const {
    data:
      rawAccess,

    error:
      accessError,
  } =
    await supabase
      .rpc(
        "web_admin_get_current_access",
      );


  /*
   * Si la RPC no existe o la infraestructura administrativa
   * no está disponible, cerramos el acceso.
   *
   * Nunca hacemos fallback permisivo.
   */
  if (
    accessError
  ) {
    return {
      status:
        "not-configured",

      admin:
        null,
    };
  }


  const admin =
    normalizeAdminIdentity(
      rawAccess,
    );


  /*
   * La RPC devuelve null cuando:
   *
   * - el usuario no pertenece a admin_members;
   * - está deshabilitado;
   * - no tiene un rol válido;
   * - su correo no está confirmado.
   */
  if (
    !admin
  ) {
    return {
      status:
        "unauthorized",

      admin:
        null,
    };
  }


  /* ========================================================
     DEFENSIVE IDENTITY CONSISTENCY
     ======================================================== */

  /*
   * Defensa adicional.
   *
   * La identidad devuelta por PostgreSQL debe corresponder
   * exactamente al usuario verificado por Supabase Auth.
   */
  if (
    admin.id !==
      user.id ||
    admin.email !==
      authenticatedEmail
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

    admin,
  };
}


/* ============================================================
   CURRENT ADMIN ACCESS
   ============================================================ */

export async function getAdminAccess():
  Promise<AdminAccessResult> {

  const supabase =
    await createSupabaseServerClient();


  /*
   * Fail closed.
   *
   * Si Supabase no está configurado:
   * nadie entra.
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


  return getAdminAccessWithClient(
    supabase,
  );
}


/* ============================================================
   ADMIN GUARD
   ============================================================ */

/**
 * Protección común de las superficies administrativas.
 *
 * authorized
 *   → permite continuar.
 *
 * unauthenticated
 *   → login.
 *
 * unauthorized
 *   → acceso rechazado.
 *
 * not-configured
 *   → infraestructura cerrada por seguridad.
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
     * Nunca conceder acceso debido a un estado inesperado.
     */
    redirect(
      "/admin/login?error=forbidden",
    );
  }


  return access.admin;
}
