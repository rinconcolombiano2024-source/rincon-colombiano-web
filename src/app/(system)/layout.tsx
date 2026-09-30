import type {
  ReactNode,
} from "react";

import "../globals.css";


/* ============================================================
   TYPES
   ============================================================ */

interface SystemLayoutProps {
  readonly children:
    ReactNode;
}


/* ============================================================
   SYSTEM ROOT LAYOUT
   ============================================================ */

/**
 * Root layout independiente para rutas que NO forman parte
 * del sitio público localizado.
 *
 * Ejemplos:
 *
 * /admin
 * /admin/login
 * /r/[code]
 *
 * El grupo `(system)` no forma parte de la URL.
 *
 * Esto mantiene completamente separadas:
 *
 * - la experiencia pública PL / ES / EN
 * - la administración
 * - futuras rutas técnicas
 *
 * Al no existir un layout raíz común en src/app,
 * esta rama necesita su propio <html> y <body>.
 */
export default function SystemLayout({
  children,
}: SystemLayoutProps) {
  return (
    <html
      lang="es"
    >
      <body>
        {children}
      </body>
    </html>
  );
}
