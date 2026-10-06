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


/**
 * Contrato defensivo del resultado devuelto por:
 *
 * public.web_admin_get_current_access()
 *
 * Las propiedades continúan siendo `unknown` hasta que hayan
 * pasado las validaciones runtime correspondientes.
 *
 * Esto tiene dos objetivos:
 *
 * 1. No confiar ciegamente en datos provenientes de PostgreSQL.
 * 2. Mantener compatibilidad simultánea con:
 *    - TypeScript noPropertyAccessFromIndexSignature
 *    - ESLint dot-notation
 */
interface AdminAccessRpcPayload {
  readonly user_id?:
    unknown;

  readonly email?:
    unknown;

  readonly role?:
    unknown;
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
  /*
   * La RPC debe devolver un objeto individual.
   *
   * Rechazamos:
   *
   * - null
   * - strings
   * - números
   * - booleanos
   * - arrays
   *
   * antes de intentar interpretar su contenido.
   */
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


  /*
   * Este cast únicamente describe las propiedades que
   * esperamos encontrar.
   *
   * NO implica confianza en sus valores.
   *
   * Cada propiedad permanece como `unknown` y será validada
   * inmediatamente antes de construir AdminIdentity.
   */
  const record =
    value as AdminAccessRpcPayload;


  const userId =
    record.user_id;

  const email =
    record.email;

  const role =
    record.role;


  /*
   * Validación estricta del contrato runtime.
   *
   * Nunca construimos una identidad administrativa si:
   *
   * - falta el ID;
   * - falta el email;
   * - alguno está vacío;
   * - el rol no pertenece al conjunto permitido.
   */
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

  /*
   * getUser() valida la identidad contra Supabase Auth.
   *
   * No utilizamos únicamente información local de sesión
   * para conceder acceso administrativo.
   */
  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();


  /*
   * Ante cualquier error de autenticación cerramos el acceso.
   *
   * Fail closed.
   */
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
   *
   * No permitimos acceso administrativo con una identidad
   * incompleta.
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

  /*
   * La autorización real vive en PostgreSQL.
   *
   * La sesión autenticada por sí sola NO concede acceso
   * administrativo.
   */
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
   * La RPC devuelve null o un resultado inválido cuando:
   *
   * - el usuario no pertenece a admin_members;
   * - está deshabilitado;
   * - no tiene un rol válido;
   * - su correo no está confirmado;
   * - el contrato recibido es inesperado.
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
   *
   * Esto evita aceptar una autorización que pertenezca
   * accidentalmente a una identidad diferente.
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
