import "server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";


/* ============================================================
   TYPES
   ============================================================ */

interface SupabaseAdminConfig {
  readonly url:
    string;

  readonly serviceRoleKey:
    string;
}


/* ============================================================
   ENVIRONMENT
   ============================================================ */

function readServerEnvironmentVariable(
  name:
    string,
): string | null {
  const value =
    process.env[
      name
    ];

  if (
    typeof value !==
      "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length >
    0
    ? normalized
    : null;
}


/* ============================================================
   URL VALIDATION
   ============================================================ */

function isValidSupabaseUrl(
  value:
    string,
): boolean {
  try {
    const url =
      new URL(
        value,
      );

    if (
      url.protocol ===
      "https:"
    ) {
      return true;
    }

    return (
      url.protocol ===
        "http:" &&
      (
        url.hostname ===
          "localhost" ||
        url.hostname ===
          "127.0.0.1"
      )
    );
  } catch {
    return false;
  }
}


/* ============================================================
   ADMIN CONFIG
   ============================================================ */

/**
 * Configuración privilegiada de Supabase.
 *
 * IMPORTANTE:
 *
 * - solo servidor;
 * - nunca NEXT_PUBLIC_;
 * - nunca navegador;
 * - nunca Client Component;
 * - nunca exponer la service_role en logs;
 * - fail closed si falta configuración.
 */
function getSupabaseAdminConfig():
  SupabaseAdminConfig | null {
  const url =
    readServerEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_URL",
    );

  const serviceRoleKey =
    readServerEnvironmentVariable(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  if (
    !url ||
    !serviceRoleKey
  ) {
    return null;
  }

  if (
    !isValidSupabaseUrl(
      url,
    )
  ) {
    return null;
  }

  /*
   * Una service_role real es una credencial larga.
   *
   * No intentamos interpretar internamente su formato porque
   * Supabase puede evolucionar sus tipos de claves.
   *
   * Este control solamente evita aceptar valores accidentales
   * vacíos o claramente inválidos.
   */
  if (
    serviceRoleKey.length <
      20
  ) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
  };
}


/* ============================================================
   ADMIN READINESS
   ============================================================ */

export function isSupabaseAdminConfigured():
  boolean {
  return (
    getSupabaseAdminConfig() !==
    null
  );
}


/* ============================================================
   ADMIN CLIENT
   ============================================================ */

/**
 * Cliente privilegiado para operaciones administrativas.
 *
 * NO mantiene sesión del usuario.
 *
 * La autorización del administrador debe ocurrir ANTES,
 * mediante:
 *
 * requireAdminIdentity()
 *
 * Esta instancia se utilizará posteriormente para:
 *
 * - Storage administrativo;
 * - registro de brand assets;
 * - publicación de logos;
 * - auditoría;
 * - operaciones internas CMS;
 * - tareas server-side privilegiadas.
 */
export function createSupabaseAdminClient():
  SupabaseClient | null {
  const config =
    getSupabaseAdminConfig();

  if (
    !config
  ) {
    return null;
  }

  return createClient(
    config.url,
    config.serviceRoleKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },
    },
  );
}
