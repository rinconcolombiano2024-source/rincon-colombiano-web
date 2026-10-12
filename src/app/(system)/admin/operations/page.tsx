import Link from "next/link";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { evaluateLaunchReadiness, isLaunchCertified, type LaunchSignals, type LaunchGate } from "@/lib/admin/release-readiness";
import { loadPublishedBrandAsset } from "@/lib/brand/public-brand";
import { loadPublishedCmsTextContent } from "@/lib/cms/public-content";
import { loadRcOrderaPublicCatalog } from "@/integrations/rc-ordera/public-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Deliberately fixed hostname, not a user-supplied URL: no SSRF. Redirects
// are forbidden to prevent a legacy domain from masking the wrong website.
async function checkOfficialDomain(): Promise<LaunchSignals["officialDomain"]> {
  try {
    const response = await fetch(
      "https://rinconcolombiano.pl/admin/manifest.webmanifest",
      {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
        headers: { Accept: "application/manifest+json" },
      },
    );
    if (response.status !== 200) {
      return "not-published";
    }
    const kind = response.headers.get("content-type") ?? "";
    if (!kind.toLowerCase().includes("application/manifest+json")) {
      return "not-published";
    }
    const parsed: unknown = await response.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return "not-published";
    }
    const manifest = parsed as { id?: unknown; start_url?: unknown; scope?: unknown };
    return manifest.id === "/admin" &&
      manifest.start_url === "/admin" &&
      manifest.scope === "/admin"
      ? "ready" : "not-published";
  } catch {
    return "unavailable";
  }
}

const brandSlots = [
  "logo_primary",
  "favicon",
  "hero_primary",
  "food_featured_1",
  "food_featured_2",
  "food_featured_3",
] as const;

const languages = ["pl", "es", "en"] as const;

async function collectLaunchSignals(): Promise<LaunchSignals> {
  const [domain, catalog, publishedImages, campaigns] = await Promise.all([
    checkOfficialDomain(),
    loadRcOrderaPublicCatalog("czapelska").catch(() => null),
    Promise.all(brandSlots.map(async (slot) => {
      try {
        const image = await loadPublishedBrandAsset(slot);
        return image.status === "ready" && image.asset !== null ? slot : null;
      } catch {
        return null;
      }
    })),
    Promise.all(languages.map(async (locale) => {
      try {
        const campaign = await loadPublishedCmsTextContent("home_campaign", locale);
        return campaign.status === "ready" &&
          campaign.content?.kind === "promotion" ? locale : null;
      } catch {
        return null;
      }
    })),
  ]);

  return {
    officialDomain: domain,
    rcOrderaStatus: catalog?.status ?? "unavailable",
    productCount: catalog?.catalog?.productCount ?? 0,
    publishedBrandSlots: publishedImages.filter((slot): slot is NonNullable<typeof slot> => slot !== null),
    publishedCampaignLocales: campaigns.filter((locale): locale is NonNullable<typeof locale> => locale !== null),
  };
}

const tones: Record<LaunchGate["state"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-900",
  attention: "border-amber-200 bg-amber-50 text-amber-950",
  blocked: "border-rose-200 bg-rose-50 text-rose-950",
};

const labels: Record<LaunchGate["state"], string> = {
  ready: "Preparado",
  attention: "Revisar",
  blocked: "Pendiente crítico",
};

/**
 * A real CEO status board—not pretend completion percentages. A green
 * Quality Gate proves the build, never card payments, refunds or DNS.
 */
export default async function CeoOperationsPage() {
  const admin = await requireAdminIdentity();
  const signals = await collectLaunchSignals();
  const gates = evaluateLaunchReadiness(signals);
  const readyCount = gates.filter((gate) => gate.state === "ready").length;
  const certified = isLaunchCertified(gates);

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#14110d]">
      <div className="grid h-2 grid-cols-[2fr_1fr_1fr]" aria-hidden="true">
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>
      <div className="site-container py-8 sm:py-12">
        <nav aria-label="Administración" className="flex flex-wrap gap-4 text-sm font-bold text-[#123d73]">
          <Link href="/admin" className="underline underline-offset-4">← Panel de administración</Link>
          <Link href="/admin/menu" className="underline underline-offset-4">Menú RC ORDERA</Link>
          <Link href="/admin/brand" className="underline underline-offset-4">Imágenes</Link>
          <Link href="/admin/marketing" className="underline underline-offset-4">Publicidad</Link>
        </nav>

        <header className="mt-8 overflow-hidden rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-[#f7c600]">
            Dirección general · Control de lanzamiento
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Rincón CEO · Estado comercial
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
            Comprueba qué componentes están realmente disponibles antes de
            poner en producción la nueva web y el programa descargable de Windows.
            Los controles distinguen código compilado de operaciones verificadas.
          </p>
          <p className="mt-4 text-xs text-white/70">
            Cuenta: {admin.email} · Permisos: {admin.role}
          </p>
        </header>

        <section aria-labelledby="release-verdict" className={`mt-7 rounded-[2rem] border p-6 sm:p-8 ${certified ? tones.ready : tones.blocked}`}>
          <p className="text-xs font-black uppercase tracking-widest">
            Control de lanzamiento
          </p>
          <h2 id="release-verdict" className="mt-2 font-serif text-2xl font-bold">
            {certified ? "Aprobación técnica completa" : "Lanzamiento comercial aún no certificado"}
          </h2>
          <p className="mt-3 text-sm leading-7">
            {readyCount} de {gates.length} controles preparados.
            No cambiar el DNS del restaurante ni desactivar SumUp mientras queden
            comprobaciones críticas pendientes.
          </p>
          <p className="mt-2 text-xs leading-6">
            Este panel consulta señales técnicas, pero no ejecuta pedidos de prueba
            ni autoriza pagos, y no modifica información del restaurante.
          </p>
        </section>

        <section aria-labelledby="checks-title" className="mt-9">
          <h2 id="checks-title" className="font-serif text-2xl font-bold">Verificación por área</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gates.map((gate) => (
              <article key={gate.id} className="flex flex-col rounded-[2rem] border border-[#e4dccf] bg-white p-6 shadow-sm">
                <span className={`self-start rounded-full border px-3 py-1 text-xs font-black ${tones[gate.state]}`}>
                  {labels[gate.state]}
                </span>
                <h3 className="mt-4 font-serif text-xl font-bold">{gate.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#62594f]">{gate.description}</p>
                {gate.href ? (
                  <Link href={gate.href}
                    className="mt-5 inline-flex min-h-11 items-center self-start rounded-full border border-[#123d73] px-5 text-sm font-bold text-[#123d73] transition hover:bg-[#edf1f7]">
                    Abrir administración →
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-9 grid gap-5 rounded-[2rem] border border-[#e4dccf] bg-white p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Aplicación Windows para CEO</h2>
            <p className="mt-3 text-sm leading-7 text-[#62594f]">
              El ejecutable x64 se compila y se distribuye en GitHub Actions.
              Sólo abre la administración cuando el dominio HTTPS oficial
              publica el manifiesto correcto. Sigue siendo necesario
              iniciar sesión y tener permisos.
            </p>
            <a href="https://github.com/rinconcolombiano2024-source/rincon-colombiano-web/actions/workflows/windows-ceo-desktop.yml"
              target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-black text-[#123d73] underline underline-offset-4">
              Ver compilaciones Windows descargables ↗
            </a>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Separación de responsabilidades</h2>
            <p className="mt-3 text-sm leading-7 text-[#62594f]">
              Rincón Web gestiona campañas y marca. RC ORDERA conserva
              el menú operativo y los pedidos. Las operaciones de edición
              del menú requieren una cuenta propietaria en RC ORDERA,
              adicional al acceso administrativo de Rincón Web.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
