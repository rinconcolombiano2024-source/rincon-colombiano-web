import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Locale = "pl" | "es" | "en";
const labels = {
  pl: { title: "Zamów w Rincón Colombiano", intro: "Wybierz wygodny sposób zamówienia.", direct: "Zamów bezpośrednio w restauracji", directDesc: "Złóż zamówienie w RC ORDERA. Warunki płatności sprawdź przed potwierdzeniem.", platforms: "Dostawa przez partnerów", pay: "Płatności online", payDesc: "Link do sklepu SumUp zostanie dodany po potwierdzeniu adresu przez restaurację.", booking: "Rezerwacje SumUp", back: "Powrót na stronę" },
  es: { title: "Pide en Rincón Colombiano", intro: "Elige cómo prefieres hacer tu pedido.", direct: "Pide directamente al restaurante", directDesc: "Haz tu pedido mediante RC ORDERA. Comprueba las opciones de pago antes de confirmarlo.", platforms: "Pide a domicilio con nuestros colaboradores", pay: "Pagos en línea", payDesc: "El enlace a la tienda SumUp se añadirá cuando el restaurante confirme su dirección oficial.", booking: "Reservas en SumUp", back: "Volver al inicio" },
  en: { title: "Order from Rincón Colombiano", intro: "Choose how you would like to order.", direct: "Order directly from the restaurant", directDesc: "Place your order through RC ORDERA. Check available payment methods before confirming.", platforms: "Delivery partners", pay: "Online payments", payDesc: "The SumUp store link will be added once the restaurant confirms its official address.", booking: "SumUp bookings", back: "Back to home" },
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
          <a href="https://www.sumupbookings.com/rincon-colombiano" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-[#123d73] px-5 py-3 font-semibold text-[#123d73] hover:bg-slate-50">{t.booking} ↗</a>
        </section>
      </div>
    </main>
  );
}
