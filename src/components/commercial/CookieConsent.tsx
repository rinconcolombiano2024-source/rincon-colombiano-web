"use client";

import { useEffect, useState } from "react";
import { buildRoutePath } from "@/config/routes";

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
    const sync = () => {
      try {
        const saved = localStorage.getItem(KEY);
        setChoice(saved === "accepted" || saved === "rejected" ? saved : null);
      } catch { setChoice(null); }
    };
    queueMicrotask(sync);
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) {
        sync();
        const next = event.key === null ? "rejected" : event.newValue;
        window.dispatchEvent(new CustomEvent("rc-consent-change", {
          detail: next === "accepted" ? "accepted" : "rejected",
        }));
        // A tracker script mounted in another tab may still be running after
        // unmount. Reload promptly when tracking consent is withdrawn.
        if (event.oldValue === "accepted" && next !== "accepted") {
          window.location.reload();
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function save(next: Choice) {
    let persisted = false;
    let revokeTracking = false;
    try {
      revokeTracking = next === "rejected" && localStorage.getItem(KEY) === "accepted";
      localStorage.setItem(KEY, next);
      persisted = true;
    } catch { /* Private browsing may block storage. */ }
    // Never activate optional cookies when consent cannot be persisted.
    const effectiveChoice: Choice = persisted ? next : "rejected";
    setChoice(persisted ? next : null);
    window.dispatchEvent(new CustomEvent("rc-consent-change", { detail: effectiveChoice }));
    // Unmounting the Vercel/GA tracker alone cannot guarantee injected
    // scripts or in-flight navigation hooks are removed on revocation.
    // A reload also clears any already-running optional analytics SDK.
    if (revokeTracking && persisted) {
      window.location.reload();
    }
  }
  return (
    <>
      {choice === null && (
        <section role="dialog" aria-modal="false" aria-labelledby="rc-cookie-dialog-title" aria-describedby="rc-cookie-dialog-description" className="fixed inset-x-3 bottom-[max(6.5rem,env(safe-area-inset-bottom))] z-[80] mx-auto max-h-[calc(100dvh-8rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border-2 border-[#123d73] bg-white p-5 text-[#171717] shadow-2xl sm:bottom-5 sm:p-6">
          <h2 id="rc-cookie-dialog-title" className="text-lg font-extrabold text-[#123d73]">{t.title}</h2>
          <p id="rc-cookie-dialog-description" className="mt-2 text-sm leading-6">{t.body}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href={buildRoutePath("privacy", locale)} className="underline underline-offset-4">{t.policy}</a>
            <a href={buildRoutePath("cookies", locale)} className="underline underline-offset-4">{t.cookies}</a>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => save("rejected")} className="min-h-11 rounded-xl border-2 border-[#123d73] px-5 py-2 font-bold text-[#123d73]">{t.reject}</button>
            <button type="button" onClick={() => save("accepted")} className="min-h-11 rounded-xl bg-[#f7c600] px-5 py-2 font-extrabold text-[#123d73]">{t.accept}</button>
          </div>
        </section>
      )}
      {choice !== null && choice !== "loading" && (
        <button type="button" onClick={() => setChoice(null)} aria-haspopup="dialog" className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-[70] max-w-[calc(100vw-1.5rem)] rounded-xl border-2 border-[#123d73] bg-white px-4 py-3 text-sm font-bold text-[#123d73] shadow-lg transition-colors hover:bg-[#fff5c7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] sm:left-4">{t.settings}</button>
      )}
    </>
  );
}
