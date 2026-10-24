import { businessIdentity as company } from "@/config/business";
import { buildRoutePath } from "@/config/routes";

export function BusinessIdentity({ locale }: { locale: "pl" | "es" | "en" }) {
  const t = {
    pl: { title: "Dane przedsiębiorcy", address: "Adres rejestrowy spółki", privacy: "Polityka prywatności", cookies: "Polityka cookies" },
    es: { title: "Datos de la empresa", address: "Domicilio social", privacy: "Política de privacidad", cookies: "Política de cookies" },
    en: { title: "Company details", address: "Registered office", privacy: "Privacy policy", cookies: "Cookie policy" },
  }[locale];
  return <div role="group" className="mt-6 rounded-2xl border border-[#e7e1d7] bg-[#faf9f6] p-5 text-[#171717]" aria-label={t.title}>
    <h3 className="text-lg font-bold">{t.title}</h3>
    <p className="mt-3 font-semibold">{company.name}</p>
    <p className="mt-2 text-sm">{t.address}: {company.address}</p>
    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {(["nip", "krs", "regon"] as const).map(key => <div key={key} className="flex gap-2"><dt className="font-bold">{key.toUpperCase()}</dt><dd>{company[key]}</dd></div>)}
    </dl>
    <nav className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#123d73]">
      <a href={buildRoutePath("privacy", locale)} className="underline underline-offset-4">{t.privacy}</a>
      <a href={buildRoutePath("cookies", locale)} className="underline underline-offset-4">{t.cookies}</a>
    </nav>
  </div>;
}
