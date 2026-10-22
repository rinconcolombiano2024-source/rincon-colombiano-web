import Link from "next/link";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { evaluateLaunchReadiness, isLaunchCertified, type LaunchSignals, type LaunchGate } from "@/lib/admin/release-readiness";
import { loadPublishedBrandAsset } from "@/lib/brand/public-brand";
import { loadPublishedCmsTextContent } from "@/lib/cms/public-content";
import { loadRcOrderaPublicCatalog } from "@/integrations/rc-ordera/public-catalog";
import { getRcOrderaIntegrationReadiness } from "@/integrations/rc-ordera/config";
import { mapWithConcurrencyLimit } from "@/lib/admin/bounded-map";
import { checkOfficialDomainRevision } from "@/lib/admin/official-domain";
import { publicReleaseFingerprint } from "@/lib/release/fingerprint";
import { nativeRestaurantChat } from "@/lib/rincon-ai/native";
import { inspectRinconAiConfiguration } from "@/lib/rincon-ai/config-readiness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The official site must serve this exact revision, not merely any manifest.
async function checkOfficialDomain(): Promise<LaunchSignals["officialDomain"]> {
  return checkOfficialDomainRevision(publicReleaseFingerprint().revision);
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
  const [domain, catalog, campaignAndBrand] = await Promise.all([
    checkOfficialDomain(),
    loadRcOrderaPublicCatalog("czapelska").catch(() => null),
    // CEO monitoring is read-only; deliberately cap its Supabase fan-out.
    // The public site and real orders are never delayed by these diagnostics.
    (async () => {
      const brand = await mapWithConcurrencyLimit(brandSlots, 2, async (slot) => {
        try {
          const image = await loadPublishedBrandAsset(slot);
          return image.status === "ready" && image.asset !== null ? slot : null;
        } catch {
          return null;
        }
      });
      const campaigns = await mapWithConcurrencyLimit(languages, 2, async (locale) => {
        try {
          const campaign = await loadPublishedCmsTextContent("home_campaign", locale);
          return campaign.status === "ready" &&
            campaign.content?.kind === "promotion" ? locale : null;
        } catch {
          return null;
        }
      });
      return { brand, campaigns };
    })(),
  ]);

  return {
    officialDomain: domain,
    rcOrderaStatus: catalog?.status ?? "unavailable",
    productCount: catalog?.catalog?.productCount ?? 0,
    publishedBrandSlots: campaignAndBrand.brand.filter((slot): slot is NonNullable<typeof slot> => slot !== null),
    publishedCampaignLocales: campaignAndBrand.campaigns.filter((locale): locale is NonNullable<typeof locale> => locale !== null),
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
  // Only authenticated administrators may see environment variable NAMES.
  // Values and credentials are never rendered or serialized.
  const rcConfiguration = getRcOrderaIntegrationReadiness();
  let nativeProviderConfigured = false;
  if (process.env["RINCON_IA_MODE"] === "native") {
    try {
      nativeProviderConfigured = nativeRestaurantChat().configured();
    } catch {
      // A broken model configuration must appear as unavailable, not ready.
      nativeProviderConfigured = false;
    }
  }
  const rinconAi = inspectRinconAiConfiguration(process.env, nativeProviderConfigured);
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
            No cambiar el DNS del restaurante mientras queden
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

        <section aria-labelledby="ai-configuration-title" className="mt-9 rounded-[2rem] border border-[#e4dccf] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="ai-configuration-title" className="font-serif text-2xl font-bold">
              Rincón AI · conversación real
            </h2>
            <span role="status" className={`rounded-full border px-4 py-2 text-sm font-black ${rinconAi.configured
              ? tones.attention : tones.blocked}`}>
              {rinconAi.configured ? "Configurado · sin prueba de respuesta" : "Proveedor no disponible"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#62594f]">{rinconAi.note}</p>
          <p className="mt-3 text-xs leading-6 text-[#62594f]">
            Comprobación sólo de configuración del servidor. No hace preguntas al modelo,
            no gasta crédito y no certifica chat humano en producción. Ningún token
            ni contraseña se muestra a la web pública ni a este panel.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/api/rincon-ai/status" target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-[#123d73] px-5 text-sm font-bold text-[#123d73]">
              Consultar estado público IA ↗
            </a>
            <Link href="/admin" className="inline-flex min-h-11 items-center rounded-full bg-[#f7c600] px-5 text-sm font-black text-[#12100e]">
              Volver al panel CEO
            </Link>
          </div>
        </section>

        <section aria-labelledby="rc-configuration-title" className="mt-9 rounded-[2rem] border border-[#e4dccf] bg-white p-6 sm:p-8">
          <h2 id="rc-configuration-title" className="font-serif text-2xl font-bold">
            Conexión pública con RC ORDERA
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#62594f]">
            {rcConfiguration.configured
              ? "Las direcciones, claves públicas y el identificador del restaurante cumplen las validaciones locales. Esto no confirma que RC ORDERA acepte pedidos."
              : "La configuración de RC ORDERA requiere revisión antes de lanzar la web. No se muestra ninguna contraseña ni clave."}
          </p>
          {rcConfiguration.missing.length > 0 ? (
            <p className="mt-3 break-words text-sm text-rose-900">
              Variables ausentes: {rcConfiguration.missing.join(", ")}.
            </p>
          ) : null}
          {rcConfiguration.invalid.length > 0 ? (
            <p className="mt-3 break-words text-sm text-rose-900">
              Variables inválidas: {rcConfiguration.invalid.join(", ")}.
            </p>
          ) : null}
          <p className="mt-3 text-xs leading-6 text-[#62594f]">
            El estado operativo del catálogo y las pruebas reales de cocina, pago y entrega se comprueban por separado.
          </p>
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
