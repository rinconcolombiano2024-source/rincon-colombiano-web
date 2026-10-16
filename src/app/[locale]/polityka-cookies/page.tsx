import type { Metadata } from "next";
import { isSeoProductionEnvironment } from "@/config/seo";
import { notFound } from "next/navigation";

const content = {
  es: { title: "Política de cookies", intro: "Explicamos cómo se guarda tu elección de privacidad y cómo puedes cambiarla.", controller: "Esta página utiliza almacenamiento local del navegador para recordar tu elección. No significa que todas las tecnologías opcionales estén activadas.", essential: "Datos técnicos: el servidor puede procesar dirección IP, fecha, navegador y registros necesarios para seguridad y funcionamiento. Los proveedores de alojamiento pueden tratar estos datos bajo sus propias condiciones.", choice: "Preferencias: guardamos en tu navegador una elección local para recordar si aceptas o rechazas cookies opcionales. Puedes cambiarla desde «Configurar privacidad».", rights: "Puedes solicitar acceso, rectificación, supresión u oposición cuando corresponda, y presentar una reclamación ante la autoridad de protección de datos de Polonia (UODO).", caution: "Esta información debe completarse con la identidad jurídica, contacto de privacidad, proveedores, plazos de conservación y servicios realmente utilizados antes de considerarse un aviso legal definitivo." },
  pl: { title: "Polityka plików cookie", intro: "Wyjaśniamy, jak zapisujemy wybór dotyczący prywatności i jak go zmienić.", controller: "Strona korzysta z lokalnej pamięci przeglądarki, aby zapamiętać Twój wybór. Nie oznacza to włączenia wszystkich opcjonalnych technologii.", essential: "Dane techniczne: serwer może przetwarzać adres IP, datę, dane przeglądarki i logi niezbędne do bezpieczeństwa i działania witryny.", choice: "Preferencje: zapisujemy lokalnie w przeglądarce decyzję o opcjonalnych plikach cookie. Możesz ją zmienić przez «Ustawienia prywatności».", rights: "W odpowiednich przypadkach możesz żądać dostępu, sprostowania, usunięcia danych lub wnieść sprzeciw oraz skargę do UODO.", caution: "Przed uznaniem dokumentu za ostateczny należy uzupełnić dane podmiotu, kontakt, dostawców usług, okresy przechowywania i rzeczywiście używane technologie." },
  en: { title: "Cookie policy", intro: "Learn how your privacy choice is stored and how to change it.", controller: "This page uses browser local storage to remember your choice. This does not mean every optional technology is enabled.", essential: "Technical data: the server may process IP address, date, browser information and logs needed for security and operation.", choice: "Preferences: we save your optional-cookie choice locally in your browser. You can change it using 'Privacy settings'.", rights: "Where applicable, you may request access, correction, deletion or object to processing, and complain to Poland's data protection authority (UODO).", caution: "Before treating this as a final legal notice, add the legal entity, privacy contact, providers, retention periods and technologies actually in use." },
} as const;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!["pl", "es", "en"].includes(locale)) { return {}; }
  const t = content[locale as keyof typeof content];
  return { title: t.title, description: t.intro, alternates: { canonical: `/${locale}/polityka-cookies`, languages: { pl: "/pl/polityka-cookies", es: "/es/polityka-cookies", en: "/en/polityka-cookies" } }, robots: { index: isSeoProductionEnvironment(), follow: true } };
}
export default async function PolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(locale in content)) { notFound(); }
  const t = content[locale as keyof typeof content];
  return <main id="main-content" className="mx-auto min-h-screen max-w-3xl px-5 py-16 text-[#171717]">
    <a href={`/${locale}`} className="text-[#123d73] underline">← Rincón Colombiano</a>
    <h1 className="mt-8 text-3xl font-black text-[#123d73]">{t.title}</h1>
    <p className="mt-5 leading-7">{t.intro}</p>
    {[t.controller,t.essential,t.choice,t.rights].map((paragraph,i)=><p key={i} className="mt-5 leading-7">{paragraph}</p>)}
    <p className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6">{t.caution}</p>
  </main>;
}
