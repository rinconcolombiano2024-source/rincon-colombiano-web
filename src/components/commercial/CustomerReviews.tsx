"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Locale = "es" | "pl" | "en";
type Review = { id: string; display_name: string; rating: number; body: string; created_at: string };
const words = {
  es: { leave:"Déjanos tu opinión", title:"¿Cómo fue tu experiencia?", name:"Tu nombre", opinion:"Cuéntanos tu experiencia", submit:"Enviar opinión", close:"Cerrar", sent:"Gracias. Tu opinión se publicará después de revisarla.", error:"No pudimos enviar tu opinión. Inténtalo más tarde.", stars:"Tu valoración", reviews:"Opiniones de nuestros clientes", empty:"Todavía no hay opiniones publicadas.", pending:"Enviando…" },
  pl: { leave:"Dodaj opinię", title:"Jak oceniasz wizytę?", name:"Twoje imię", opinion:"Opowiedz o swojej wizycie", submit:"Wyślij opinię", close:"Zamknij", sent:"Dziękujemy! Opinia pojawi się po weryfikacji.", error:"Nie udało się wysłać opinii. Spróbuj później.", stars:"Twoja ocena", reviews:"Opinie naszych gości", empty:"Nie ma jeszcze opublikowanych opinii.", pending:"Wysyłanie…" },
  en: { leave:"Leave a review", title:"How was your visit?", name:"Your name", opinion:"Tell us about your experience", submit:"Submit review", close:"Close", sent:"Thank you! Your review will appear after moderation.", error:"We couldn't send your review. Please try again later.", stars:"Your rating", reviews:"What our guests say", empty:"No reviews have been published yet.", pending:"Sending…" },
} as const;

export function CustomerReviews({ locale }: { locale: Locale }) {
  const t = words[locale];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    let active = true;
    fetch("/api/customer-reviews", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : { reviews: [] })
      .then((data: { reviews?: Review[] }) => { if (active) { setReviews(Array.isArray(data.reviews) ? data.reviews : []); } })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!open) { return; }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); }
      if (e.key === "Tab") {
        const dialog = closeButtonRef.current?.closest('[role="dialog"]');
        const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled])');
        if (!focusable?.length) { return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; openButtonRef.current?.focus(); };
  }, [open]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) { return; }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/customer-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, rating, website }),
      });
      if (!response.ok) { throw new Error("submission failed"); }
      setMessage(t.sent);
      setBody("");
      setName("");
    } catch { setMessage(t.error); }
    finally { setBusy(false); }
  }
  return (
    <div className="mt-8">
      <button ref={openButtonRef} type="button" onClick={() => { setMessage(""); setOpen(true); }} className="w-full rounded-2xl bg-[#f7c600] px-5 py-4 text-sm font-black text-[#171717] hover:bg-[#ffdc36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73]">{t.leave}</button>
      <h3 className="mt-8 text-xl font-bold text-[#123d73]">{t.reviews}</h3>
      {reviews.length === 0 ? <p className="mt-3 text-sm text-slate-600">{t.empty}</p> :
        <div className="mt-4 grid gap-3">{reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-[#faf8f3] p-4">
            <div className="flex items-center justify-between gap-2"><strong className="break-words">{review.display_name}</strong><span className="text-amber-600" aria-label={`${review.rating}/5`}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">{review.body}</p>
          </article>
        ))}</div>}
      {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) { setOpen(false); } }}>
        <div role="dialog" aria-modal="true" aria-labelledby="review-dialog-title" className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><h3 id="review-dialog-title" className="text-2xl font-extrabold text-[#123d73]">{t.title}</h3><button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rounded-full px-3 py-1 text-2xl">×</button></div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <fieldset><legend className="text-sm font-semibold">{t.stars}</legend><div className="mt-1 flex gap-1">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value}/5`} aria-pressed={rating === value} className="min-h-11 min-w-11 text-3xl text-amber-500">{value <= rating ? "★" : "☆"}</button>)}</div></fieldset>
            <label className="block text-sm font-semibold">{t.name}<input required minLength={2} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" /></label>
            <label className="block text-sm font-semibold">{t.opinion}<textarea required minLength={10} maxLength={1000} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" /></label>
            <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
            {message && <p role="status" className="text-sm">{message}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#123d73] px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? t.pending : t.submit}</button>
          </form>
        </div>
      </div>}
    </div>
  );
}
