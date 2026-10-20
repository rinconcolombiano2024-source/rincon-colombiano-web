"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { buildRoutePath } from "@/config/routes";
import type { AppLocale } from "@/i18n/config";

const labels = {
  pl: ["Strona główna", "Menu", "Usługi", "Historia", "Społeczność", "Nagrody", "Restauracje"],
  es: ["Inicio", "Menú", "Servicios", "Historias", "Comunidad", "Recompensas", "Restaurantes"],
  en: ["Home", "Menu", "Services", "Our story", "Community", "Rewards", "Restaurants"],
} as const;

const keys = ["home", "menu", "services", "about", "community", "loyalty", "locations"] as const;

/** Shared across public pages; never renders on private admin routes. */
export function CommercialNavigation({ locale }: { readonly locale: AppLocale }) {
  const pathname = usePathname();
  if (!pathname || pathname === `/${locale}` || pathname === `/${locale}/` || pathname.startsWith(`/${locale}/admin`)) {
    return null;
  }
  return (
    <nav aria-label={locale === "pl" ? "Nawigacja główna" : locale === "es" ? "Navegación principal" : "Main navigation"} className="border-b border-[#e7e1d7] bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-5">
        {keys.map((key, index) => {
          const href = buildRoutePath(key, locale);
          const isActive = pathname === href || pathname === `${href}/`;
          return (
            <Link key={key} href={href} aria-current={isActive ? "page" : undefined} className={`shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-[#12100e] transition-colors hover:bg-[#f7c600]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] ${isActive ? "bg-[#f7c600]/25 underline decoration-[#123d73] decoration-2 underline-offset-4" : ""}`}>
              {labels[locale][index]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
