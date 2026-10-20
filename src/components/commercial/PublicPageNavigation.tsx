"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildRoutePath } from "@/config/routes";
import type { AppLocale } from "@/i18n/config";

const keys = ["home", "menu", "services", "about", "community", "loyalty", "locations"] as const;
const copy = {
  pl: { nav: "Główna nawigacja", order: "Zamów", labels: ["Strona główna", "Menu", "Usługi", "Historie", "Społeczność", "Nagrody", "Restauracje"] },
  es: { nav: "Navegación principal", order: "Pedir comida", labels: ["Inicio", "Menú", "Servicios", "Historias", "Comunidad", "Recompensas", "Restaurantes"] },
  en: { nav: "Main navigation", order: "Order food", labels: ["Home", "Menu", "Services", "Stories", "Community", "Rewards", "Restaurants"] },
};

export function PublicPageNavigation({ locale }: { locale: AppLocale }) {
  const pathname = usePathname();
  // The homepage retains its official branded header.
  if (pathname === buildRoutePath("home", locale) || pathname === `/${locale}/`) { return null; }
  const t = copy[locale];
  const current = keys.find(key => buildRoutePath(key, locale) === pathname);
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e1d7] bg-white/95 backdrop-blur">
      <div className="site-container py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={buildRoutePath("home", locale)} className="font-serif text-lg font-bold text-[#123d73]">Rincón Colombiano</Link>
          <div className="flex items-center gap-2">
            {(["pl", "es", "en"] as const).map(language => (
              <Link key={language} href={buildRoutePath(current ?? "home", language)} hrefLang={language} lang={language}
                aria-label={{ pl: "Polski", es: "Español", en: "English" }[language]}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${language === locale ? "bg-[#123d73] text-white" : "text-[#123d73] hover:bg-[#f4f1eb]"}`}>
                {language.toUpperCase()}
              </Link>
            ))}
            <Link href={`/${locale}/canales-pedido`} className="rounded-full bg-[#f7c600] px-4 py-2 text-sm font-black text-[#12100e]">{t.order}</Link>
          </div>
        </div>
        <nav aria-label={t.nav} className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {keys.map((key, index) => (
            <Link key={key} href={buildRoutePath(key, locale)} aria-current={current === key ? "page" : undefined}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] ${current === key ? "bg-[#123d73] text-white" : "text-[#123d73] hover:bg-[#f4f1eb]"}`}>
              {t.labels[index]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
