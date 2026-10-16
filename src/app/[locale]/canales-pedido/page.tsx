import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Locale = "pl" | "es" | "en";
const labels = {
  pl: { promoTitle: "Promocja RC ORDERA", promoDesc: "Zamów z odbiorem osobistym przez RC ORDERA i zainstaluj aplikację: odbierz jedną empanadę gratis! Przyjdź z przyjacielem i odbierz darmowy zestaw empanad. Poinformuj obsługę o promocji przy odbiorze. Oferta zależy od dostępności; szczegóły potwierdź w restauracji.", title: "Zamów w Rincón Colombiano", intro: "Wybierz wygodny sposób zamówienia.", direct: "Zamów bezpośrednio w restauracji", directDesc: "Zamów z odbiorem osobistym i zapłać gotówką w restauracji. Płatności online w RC ORDERA nie są jeszcze aktywne. Sprawdź dostępność odbioru przed potwierdzeniem.", platforms: "Zamów i zapłać online u partnerów dostawy", pay: "Płatności online", payDesc: "Płatności online przez RC ORDERA i sklep SumUp nie są jeszcze dostępne. Jeśli chcesz zapłacić online, skorzystaj z platform dostawczych powyżej.", booking: "Rezerwacje SumUp", back: "Powrót na stronę" },
  es: { promoTitle: "¡EMPANADAS GRATIS CON RC ORDERA!", promoDesc: "Pide para recoger en el restaurante mediante RC ORDERA e instala la aplicación: ¡recibe una empanada gratis! Si vienes con un amigo, recibe un combo de empanadas gratis. Muestra tu pedido y solicita la promoción al recogerlo. Sujeto a disponibilidad; confirma las condiciones en el restaurante.", title: "Pide en Rincón Colombiano", intro: "Elige cómo prefieres hacer tu pedido.", direct: "Pide directamente al restaurante", directDesc: "Haz tu pedido para recoger en el local y paga en efectivo en el restaurante. Los pagos en línea de RC ORDERA todavía no están habilitados. Confirma la opción de recogida antes de finalizar.", platforms: "Pide y paga en línea con las aplicaciones de reparto", pay: "Pagos en línea", payDesc: "Los pagos en línea mediante RC ORDERA y la tienda SumUp aún no están habilitados. Para pagar en línea, utiliza las aplicaciones de reparto indicadas arriba.", booking: "Reservas en SumUp", back: "Volver al inicio" },
  en: { promoTitle: "FREE EMPANADAS WITH RC ORDERA!", promoDesc: "Order for pickup through RC ORDERA and install the app: get one free empanada! Bring a friend and get a free empanada combo. Show your order and ask for the offer at pickup. Subject to availability; confirm the terms at the restaurant.", title: "Order from Rincón Colombiano", intro: "Choose how you would like to order.", direct: "Order directly from the restaurant", directDesc: "Order for pickup and pay cash at the restaurant. Online payments through RC ORDERA are not enabled yet. Confirm pickup availability before placing your order.", platforms: "Order and pay online with delivery partners", pay: "Online payments", payDesc: "Online payments through RC ORDERA and the SumUp store are not yet enabled. To pay online, use the delivery platforms listed above.", booking: "SumUp bookings", back: "Back to home" },
} as const;
// Only link to publicly identifiable restaurant listings. Never fabricate checkout URLs.
const delivery = [
  { name: "Uber Eats", url: "https://www.ubereats.com/pl/store/rincon-colombiano/wL2-43SIUx2415myUeosqw" },
  { name: "Glovo", url: "https://glovoapp.com/pl/pl/warszawa/stores/rincon-colombiano-waw" },
  { name: "Pyszne.pl", url: "https://www.pyszne.pl/en/menu/rincon-colombiano" },
  { name: "Wolt", url: "https://wolt.com/pl/pol/warsaw/restaurant/rincon-colombiano" },
] as const;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!(locale in labels)) { return {}; }
  const t = labels[locale as Locale];
  return { title: t.title, description: t.intro, alternates: { canonical: `/${locale}/canales-pedido`, languages: { pl: "/pl/canales-pedido", es: "/es/canales-pedido", en: "/en/canales-pedido" } }, robots: { index: true, follow: true } };
}
export default async function OrderChannels({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(locale in labels)) { notFound(); }
  const t = labels[locale as Locale];
  return (
    <main className="min-h-screen bg-[#faf8f3] px-4 py-12 text-[#171717] sm:py-20">
      <div className="mx-auto max-w-4xl">
        <a href={`/${locale}`} className="font-semibold text-[#123d73] underline underline-offset-4">{t.back}</a>
        <p className="mt-10 text-sm font-extrabold uppercase tracking-widest text-[#b62532]">Rincón Colombiano · Warszawa</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg">{t.intro}</p>
        <aside className="mt-10 overflow-hidden rounded-3xl border-4 border-[#f7c600] bg-[#123d73] p-6 text-white shadow-xl sm:p-9" aria-label={t.promoTitle}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f7c600]">RC ORDERA · PROMO</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#f7c600] sm:text-4xl">{t.promoTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white sm:text-lg">{t.promoDesc}</p>
          <a href="https://rincon-colombiano-pedidosapp.vercel.app/" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#f7c600] px-6 py-3 font-black text-[#123d73] hover:bg-[#ffe064] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">RC ORDERA ↗</a>
        </aside>
        <section className="mt-10 rounded-3xl border-2 border-[#f7c600] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold">{t.direct}</h2>
          <p className="mt-3 text-slate-700">{t.directDesc}</p>
          <a href="https://rincon-colombiano-pedidosapp.vercel.app/" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[#123d73] px-6 py-3 font-bold text-white hover:bg-[#092a50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">RC ORDERA ↗</a>
        </section>
        <section className="mt-10" aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="text-2xl font-bold">{t.platforms}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {delivery.map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-bold shadow-sm hover:border-[#123d73] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">
                {name}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-3xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold">{t.pay}</h2>
          <p className="mt-3 text-slate-700">{t.payDesc}</p>

        </section>
      </div>
    </main>
  );
}
