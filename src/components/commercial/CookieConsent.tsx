"use client";

import { useEffect, useState } from "react";

type Locale = "pl" | "es" | "en";
type Choice = "accepted" | "rejected";
const KEY = "rc-web-cookie-consent-v1";
const copy = {
  pl: { title: "Twoja prywatność ma znaczenie", body: "Używamy niezbędnych danych przeglądarki do działania strony. Opcjonalne pliki cookie mogą być używane wyłącznie po Twojej zgodzie.", accept: "Akceptuję opcjonalne", reject: "Tylko niezbędne", settings: "Ustawienia prywatności", policy: "Polityka prywatności", cookies: "Polityka cookies" },
  es: { title: "Tu privacidad es importante", body: "Utilizamos datos técnicos necesarios para que la web funcione. Las cookies opcionales solo se pueden activar con tu consentimiento.", accept: "Aceptar opcionales", reject: "Solo necesarias", settings: "Configurar privacidad", policy: "Política de privacidad", cookies: "Política de cookies" },
  en: { title: "Your privacy matters", body: "We use essential browser data to operate this website. Optional cookies may only be enabled with your consent.", accept: "Accept optional", reject: "Essential only", settings: "Privacy settings", policy: "Privacy policy", cookies: "Cookie policy" },
} as const;

export function CookieConsent({ locale }: { locale: Locale }) {
  const [choice, setChoice] = useState<Choice | null | "loading">("loading");
  const t = copy[locale];
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      setChoice(saved === "accepted" || saved === "rejected" ? saved : null);
    } catch { setChoice(null); }
  }, []);
  function save(next: Choice) {
    try { localStorage.setItem(KEY, next); } catch { /* Private browsing may block storage. */ }
    setChoice(next);
    window.dispatchEvent(new CustomEvent("rc-consent-change", { detail: next }));
  }
  return (
    <>
      {choice === null && (
        <section role="dialog" aria-modal="false" aria-label={t.title} className="fixed inset-x-3 bottom-[max(6.5rem,env(safe-area-inset-bottom))] z-[80] mx-auto max-w-2xl rounded-2xl border-2 border-[#123d73] bg-white p-5 text-[#171717] shadow-2xl sm:bottom-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#123d73]">{t.title}</h2>
          <p className="mt-2 text-sm leading-6">{t.body}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href={`/${locale}/polityka-prywatnosci`} className="underline underline-offset-4">{t.policy}</a>
            <a href={`/${locale}/polityka-cookies`} className="underline underline-offset-4">{t.cookies}</a>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => save("rejected")} className="min-h-11 rounded-xl border-2 border-[#123d73] px-5 py-2 font-bold text-[#123d73]">{t.reject}</button>
            <button type="button" onClick={() => save("accepted")} className="min-h-11 rounded-xl bg-[#f7c600] px-5 py-2 font-extrabold text-[#123d73]">{t.accept}</button>
          </div>
        </section>
      )}
      {choice !== null && choice !== "loading" && (
        <button type="button" onClick={() => setChoice(null)} className="fixed bottom-2 left-2 z-[39] rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-[#123d73] shadow-sm focus-visible:outline-2 sm:bottom-2 sm:left-1/2 sm:-translate-x-1/2">{t.settings}</button>
      )}
    </>
  );
}
