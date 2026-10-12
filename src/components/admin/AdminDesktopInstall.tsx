"use client";

import { useEffect, useState } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Registro único, sin polling ni caché de datos sensibles.
 * La instalación siempre exige autenticación al abrir /admin.
 */
export default function AdminDesktopInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const animation = window.requestAnimationFrame(() => {
      setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    });
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/admin/sw.js", {
        scope: "/admin",
        updateViaCache: "none",
      }).catch(() => {
        // Sin worker, el panel sigue disponible mediante navegador.
      });
    }

    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install(): Promise<void> {
    if (!installPrompt) {
      return;
    }
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
    }
  }

  return (
    <section aria-labelledby="admin-install-title" className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-[#d9dfe9] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#123d73]">Aplicación de escritorio</p>
        <h2 id="admin-install-title" className="mt-2 font-serif text-xl font-bold">
          Rincón Admin también se instala en el computador
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62594f]">
          {installed
            ? "Ya utilizas el panel instalado; la autenticación sigue siendo obligatoria."
            : "En Chrome o Edge, usa el menú del navegador → Instalar aplicación. El panel abrirá en una ventana independiente."}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-3">
        {!installed && installPrompt ? (
          <button type="button" onClick={() => void install()} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#123d73] px-6 text-sm font-black text-white transition hover:bg-[#0e315d] focus-visible:outline-2 focus-visible:outline-offset-2">
            Instalar panel PWA
          </button>
        ) : null}
        <a
          href="https://github.com/rinconcolombiano2024-source/rincon-colombiano-web/actions/workflows/windows-ceo-desktop.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#123d73] px-6 text-sm font-bold text-[#123d73] transition hover:bg-[#f4f1eb] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Versiones descargables Windows ↗
        </a>
        <p className="max-w-52 text-xs text-[#756b61]">
          GitHub Actions → última compilación → Artifacts → archivo Windows x64.
        </p>
      </div>
    </section>
  );
}
