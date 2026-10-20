"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { useParams } from "next/navigation";

const messages = {
  pl: { title: "Konto klienta", intro: "Zaloguj się bez hasła, korzystając z bezpiecznego linku wysłanego e-mailem.", order: "Zamów na wynos w RC ORDERA", email: "Adres e-mail", send: "Wyślij link do logowania", sending: "Wysyłanie…", sent: "Sprawdź pocztę, aby się zalogować.", signout: "Wyloguj się", welcome: "Zalogowano jako", unavailable: "Logowanie jest obecnie niedostępne.", invalid: "Wpisz poprawny adres e-mail." },
  es: { title: "Mi cuenta", intro: "Entra sin contraseña con un enlace seguro enviado a tu correo.", order: "Pedir para recoger con RC ORDERA", email: "Correo electrónico", send: "Enviarme un enlace para entrar", sending: "Enviando…", sent: "Revisa tu correo para iniciar sesión.", signout: "Cerrar sesión", welcome: "Sesión iniciada como", unavailable: "El acceso no está disponible en este momento.", invalid: "Introduce un correo electrónico válido." },
  en: { title: "My account", intro: "Sign in without a password using a secure link sent to your email.", order: "Order pickup with RC ORDERA", email: "Email address", send: "Email me a sign-in link", sending: "Sending…", sent: "Check your email to sign in.", signout: "Sign out", welcome: "Signed in as", unavailable: "Sign-in is currently unavailable.", invalid: "Enter a valid email address." },
} as const;

export default function CustomerAccountPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "pl" || params.locale === "en" ? params.locale : "es";
  const copy = messages[locale];
  const config = getSupabasePublicConfig();
  const supabaseUrl = config?.url;
  const supabaseKey = config?.key;
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) { return; }
    const client = createBrowserClient(supabaseUrl, supabaseKey);
    let active = true;
    void client.auth.getUser()
      .then(({ data }) => { if (active) { setUserEmail(data.user?.email ?? null); } })
      .catch(() => { if (active) { setUserEmail(null); } });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabaseUrl, supabaseKey]);
  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config || pending) { return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNotice(copy.invalid);
      return;
    }
    setPending(true);
    setNotice("");
    try {
      const client = createBrowserClient(config.url, config.key);
      const redirectTo = new URL(window.location.pathname, window.location.origin).toString();
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      setNotice(error ? copy.unavailable : copy.sent);
    } catch {
      setNotice(copy.unavailable);
    } finally {
      setPending(false);
    }
  }
  async function signOut() {
    if (!config) { return; }
    try {
      const client = createBrowserClient(config.url, config.key);
      const { error } = await client.auth.signOut();
      if (error) { setNotice(copy.unavailable); return; }
      setUserEmail(null);
      setNotice("");
    } catch {
      setNotice(copy.unavailable);
    }
  }
  return (
    <main id="main-content" className="mx-auto min-h-[65vh] max-w-xl px-5 py-16">
      <section className="rounded-3xl border border-[#e7e1d7] bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-[#123d73]">{copy.title}</h1>
        <p className="mb-6 text-sm leading-6 text-slate-700">{copy.intro}</p>
        {!config ? <p role="status">{copy.unavailable}</p> : userEmail ? (
          <div className="space-y-5">
            <p>{copy.welcome} <strong>{userEmail}</strong></p>
            <button type="button" onClick={signOut} className="rounded-xl bg-[#123d73] px-5 py-3 font-semibold text-white">{copy.signout}</button>
          </div>
        ) : (
          <form onSubmit={sendLink} className="space-y-5">
            <label htmlFor="customer-email" className="block font-semibold">{copy.email}</label>
            <input id="customer-email" type="email" required autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-400 px-4 py-3 text-slate-950" />
            <button disabled={pending} type="submit" className="w-full rounded-xl bg-[#f7c600] px-5 py-3 font-bold text-[#12100e] disabled:opacity-50">{pending ? copy.sending : copy.send}</button>
            {notice && <p role="status" aria-live="polite">{notice}</p>}
          </form>
        )}
        <a href="https://rincon-colombiano-pedidosapp.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 items-center rounded-xl border border-[#123d73] px-5 py-3 font-semibold text-[#123d73] hover:bg-blue-50">{copy.order}</a>
      </section>
    </main>
  );
}
