import { NextResponse } from "next/server";

/** Manifiesto exclusivo del panel privado; no confiere permisos. */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      id: "/admin",
      name: "Rincón Colombiano — Administración",
      short_name: "Rincón Admin",
      description: "Gestión privada de Rincón Colombiano.",
      lang: "es",
      start_url: "/admin",
      scope: "/admin/",
      display: "standalone",
      background_color: "#f4f1eb",
      theme_color: "#123d73",
      icons: [
        { src: "/admin/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/admin/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
