import { notFound } from "next/navigation";

const content = {
  es: { title: "Política de cookies", intro: "Información sobre el almacenamiento local y las preferencias de consentimiento.", controller: "Responsable: Rincón Colombiano, Varsovia, Polonia. Para consultas de privacidad, utiliza los datos de contacto publicados en esta web.", essential: "Datos técnicos: el servidor puede procesar dirección IP, fecha, navegador y registros necesarios para seguridad y funcionamiento. Los proveedores de alojamiento pueden tratar estos datos bajo sus propias condiciones.", choice: "Preferencias: guardamos en tu navegador una elección local para recordar si aceptas o rechazas cookies opcionales. Puedes cambiarla desde «Configurar privacidad».", rights: "Puedes solicitar acceso, rectificación, supresión u oposición cuando corresponda, y presentar una reclamación ante la autoridad de protección de datos de Polonia (UODO).", caution: "Esta información debe completarse con la identidad jurídica, contacto de privacidad, proveedores, plazos de conservación y servicios realmente utilizados antes de considerarse un aviso legal definitivo." },
  pl: { title: "Polityka plików cookie", intro: "Informacje o przetwarzaniu danych i ustawieniach prywatności tej strony.", controller: "Administrator: Rincón Colombiano, Warszawa, Polska. W sprawach prywatności skorzystaj z danych kontaktowych podanych na stronie.", essential: "Dane techniczne: serwer może przetwarzać adres IP, datę, dane przeglądarki i logi niezbędne do bezpieczeństwa i działania witryny.", choice: "Preferencje: zapisujemy lokalnie w przeglądarce decyzję o opcjonalnych plikach cookie. Możesz ją zmienić przez «Ustawienia prywatności».", rights: "W odpowiednich przypadkach możesz żądać dostępu, sprostowania, usunięcia danych lub wnieść sprzeciw oraz skargę do UODO.", caution: "Przed uznaniem dokumentu za ostateczny należy uzupełnić dane podmiotu, kontakt, dostawców usług, okresy przechowywania i rzeczywiście używane technologie." },
  en: { title: "Cookie policy", intro: "Information about personal data and privacy choices on this website.", controller: "Controller: Rincón Colombiano, Warsaw, Poland. Use the contact information on this website for privacy inquiries.", essential: "Technical data: the server may process IP address, date, browser information and logs needed for security and operation.", choice: "Preferences: we save your optional-cookie choice locally in your browser. You can change it using 'Privacy settings'.", rights: "Where applicable, you may request access, correction, deletion or object to processing, and complain to Poland's data protection authority (UODO).", caution: "Before treating this as a final legal notice, add the legal entity, privacy contact, providers, retention periods and technologies actually in use." },
} as const;
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
