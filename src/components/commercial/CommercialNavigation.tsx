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
  return (
    <nav aria-label={locale === "pl" ? "Nawigacja główna" : locale === "es" ? "Navegación principal" : "Main navigation"} className="border-b border-[#e7e1d7] bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-5">
        {keys.map((key, index) => (
          <Link key={key} href={buildRoutePath(key, locale)} className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-[#12100e] transition-colors hover:bg-[#f7c600]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">
            {labels[locale][index]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
