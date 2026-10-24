import Link from "next/link";
import { buildRoutePath } from "@/config/routes";
import { getOpenRestaurants } from "@/config/restaurants";
import { OFFICIAL_SOCIAL_LINKS } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { BusinessIdentity } from "@/components/commercial/BusinessIdentity";

/**
 * Public contact page: real official WhatsApp and the verified open restaurant.
 * No invented phone/email, unmonitored form, or coming-soon restaurant address.
 */
export const contactPageCopy = {
  pl: {
    title: "Kontakt z Rincón Colombiano",
    intro: "Masz pytanie o menu, catering lub wizytę? Skontaktuj się z nami bezpośrednio.",
    whatsapp: "Napisz do nas na WhatsApp",
    visit: "Odwiedź naszą restaurację",
    menu: "Zobacz aktualne menu",
  },
  es: {
    title: "Contacto de Rincón Colombiano",
    intro: "¿Tienes preguntas sobre el menú, catering o tu visita? Comunícate directamente con nosotros.",
    whatsapp: "Escríbenos por WhatsApp",
    visit: "Visita nuestro restaurante",
    menu: "Ver el menú actualizado",
  },
  en: {
    title: "Contact Rincón Colombiano",
    intro: "Questions about our menu, catering or visiting? Get in touch with us directly.",
    whatsapp: "Message us on WhatsApp",
    visit: "Visit our restaurant",
    menu: "View the current menu",
  },
} as const;

export function ContactLanding({ locale }: { readonly locale: AppLocale }) {
  const copy = contactPageCopy[locale];
  const openRestaurant = getOpenRestaurants()[0];

  return (
    <main id="main-content" className="min-h-screen bg-[#faf9f6] text-[#12100e]">
      <div className="h-2 bg-[linear-gradient(90deg,#f7c600_0_50%,#123d73_50%_75%,#c92d39_75%_100%)]" aria-hidden="true" />
      <div className="site-container py-12 sm:py-20">
        <Link href={buildRoutePath("home", locale)} className="font-bold text-[#123d73] underline-offset-4 hover:underline">
          ← {locale === "pl" ? "Strona główna" : locale === "es" ? "Inicio" : "Home"}
        </Link>
        <h1 className="mt-10 max-w-3xl font-serif text-4xl font-bold sm:text-6xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#62594f]">{copy.intro}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href={OFFICIAL_SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-full bg-[#123d73] px-6 py-3 font-bold text-white hover:bg-[#194f91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">
            {copy.whatsapp} ↗
          </a>
          <Link href={buildRoutePath("menu", locale)}
            className="inline-flex min-h-12 items-center rounded-full bg-[#f7c600] px-6 py-3 font-bold text-[#12100e] hover:bg-[#ffdb33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">
            {copy.menu}
          </Link>
        </div>
        {openRestaurant ? (
          <section className="mt-12 max-w-2xl rounded-2xl border border-[#e7e1d7] bg-white p-6">
            <h2 className="font-serif text-2xl font-bold">{copy.visit}</h2>
            <p className="mt-3 text-lg">{openRestaurant.address.street}, {openRestaurant.address.city}</p>
          </section>
        ) : null}
        <BusinessIdentity locale={locale} />
      </div>
    </main>
  );
}
