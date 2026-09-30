import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";


/* ============================================================
   METADATA
   ============================================================ */

/**
 * Toda la zona administrativa es privada.
 *
 * Nunca debe competir con el sitio público en buscadores.
 *
 * IMPORTANTE:
 *
 * robots metadata NO es una barrera de seguridad.
 * La seguridad real pertenece a:
 *
 * - Supabase Auth
 * - autorización administrativa
 * - roles y permisos
 * - MFA
 * - políticas del backend
 *
 * Esta metadata solamente evita que motores de búsqueda
 * intenten indexar las páginas administrativas.
 */
export const metadata:
  Metadata = {
  title: {
    default:
      "Administración | Rincón Colombiano",

    template:
      "%s | Administración | Rincón Colombiano",
  },

  description:
    "Panel privado de administración de Rincón Colombiano.",

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,

    googleBot: {
      index:
        false,

      follow:
        false,

      noimageindex:
        true,
    },
  },
};


/* ============================================================
   TYPES
   ============================================================ */

interface AdminLayoutProps {
  readonly children:
    ReactNode;
}


/* ============================================================
   ADMIN LAYOUT
   ============================================================ */

/**
 * Layout común para:
 *
 * /admin
 * /admin/login
 * /admin/...
 *
 * Aquí NO realizamos todavía requireAdminIdentity().
 *
 * Motivo:
 *
 * /admin/login debe permanecer accesible para que un
 * administrador pueda autenticarse.
 *
 * La protección estricta de las páginas internas se aplicará
 * en la rama protegida correspondiente.
 */
export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return children;
}
