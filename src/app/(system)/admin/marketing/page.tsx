import Link from "next/link";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unpublishHomeCampaign } from "./actions";
import {
  publishContentDraft,
  saveContentDraft,
} from "@/app/(system)/admin/content/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Locale = "pl" | "es" | "en";
type CampaignDraft = {
  id: string;
  locale: Locale;
  title: string;
  body: string;
  revision: number;
  kind: string;
};
type Publication = { locale: Locale; sourceRevision: number };

interface CampaignRowPayload {
  readonly id?: unknown;
  readonly locale?: unknown;
  readonly kind?: unknown;
  readonly document?: unknown;
  readonly revision?: unknown;
  readonly source_revision?: unknown;
}

interface CampaignDocumentPayload {
  readonly title?: unknown;
  readonly body?: unknown;
}

const campaigns = [
  { locale: "pl", name: "Polski", destination: "/pl" },
  { locale: "es", name: "Español", destination: "/es" },
  { locale: "en", name: "English", destination: "/en" },
] as const;

function isLocale(value: unknown): value is Locale {
  return value === "pl" || value === "es" || value === "en";
}

function draftFromRow(value: unknown): CampaignDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as CampaignRowPayload;
  const document = row.document;
  if (
    !isLocale(row.locale) ||
    typeof row.id !== "string" ||
    typeof row.kind !== "string" ||
    !Number.isSafeInteger(row.revision) ||
    typeof document !== "object" ||
    document === null ||
    Array.isArray(document)
  ) {
    return null;
  }

  const copy = document as CampaignDocumentPayload;
  if (typeof copy.title !== "string" || typeof copy.body !== "string") {
    return null;
  }
  return {
    id: row.id,
    locale: row.locale,
    kind: row.kind,
    title: copy.title,
    body: copy.body,
    revision: row.revision as number,
  };
}

function publicationFromRow(value: unknown): Publication | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as CampaignRowPayload;
  if (!isLocale(row.locale) || !Number.isSafeInteger(row.source_revision)) {
    return null;
  }
  return { locale: row.locale, sourceRevision: row.source_revision as number };
}

async function loadCampaigns(): Promise<{
  ready: boolean;
  drafts: readonly CampaignDraft[];
  publications: readonly Publication[];
}> {
  const client = await createSupabaseServerClient();
  if (!client) {
    return { ready: false, drafts: [], publications: [] };
  }

  const [drafts, publications] = await Promise.all([
    client.from("web_cms_drafts")
      .select("id, locale, kind, document, revision")
      .eq("content_key", "home_campaign")
      .limit(3),
    client.from("web_cms_published")
      .select("locale, source_revision")
      .eq("content_key", "home_campaign")
      .limit(3),
  ]);

  if (drafts.error || publications.error) {
    return { ready: false, drafts: [], publications: [] };
  }

  return {
    ready: true,
    drafts: (drafts.data ?? []).map(draftFromRow).filter(
      (row): row is CampaignDraft => row !== null,
    ),
    publications: (publications.data ?? []).map(publicationFromRow).filter(
      (row): row is Publication => row !== null,
    ),
  };
}

/**
 * Editor comercial apoyado en el CMS existente:
 * revisions optimistas + Auth/RLS + publicación transaccional.
 * Evita un segundo modelo de datos y nuevos permisos inseguros.
 */
export default async function MarketingAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const admin = await requireAdminIdentity();
  const data = await loadCampaigns();
  const canEdit = admin.role === "owner" || admin.role === "editor";
  const canPublish = admin.role === "owner" || admin.role === "publisher";

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#12100e]">
      <div className="grid h-2 grid-cols-[2fr_1fr_1fr]" aria-hidden="true">
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>

      <div className="site-container py-8 sm:py-12">
        <nav aria-label="Administración" className="flex flex-wrap gap-4 text-sm font-bold text-[#123d73]">
          <Link href="/admin" className="underline underline-offset-4">← Panel principal</Link>
          <Link href="/admin/content" className="underline underline-offset-4">Todas las páginas y contenidos</Link>
          <Link href="/admin/brand" className="underline underline-offset-4">Fotos y recursos de marca</Link>
          <Link href="/admin/menu" className="underline underline-offset-4">Menú RC ORDERA</Link>
        </nav>

        <header className="mt-8 overflow-hidden rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f7c600]">
            Publicidad · Comercial · Contenido
          </p>
          <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
            Campaña destacada en la página principal
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
            Prepara promociones comerciales en los tres idiomas y publícalas
            cuando estén aprobadas. Aparecerán como una tarjeta destacada
            que conduce directamente al menú de RC ORDERA.
          </p>
          <p className="mt-3 text-xs text-white/65">
            Responsable: {admin.email} · Rol: {admin.role}
          </p>
        </header>

        {query.status === "unpublished" || query.status === "saved" || query.status === "published" ? (
          <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
            {query.status === "saved"
              ? "Borrador guardado. Puedes revisarlo y publicarlo desde aquí."
              : query.status === "published"
                ? "Campaña publicada. La página pública puede tardar unos minutos en actualizarse."
                : "La campaña publicada fue retirada. El cambio puede tardar hasta cinco minutos en reflejarse en toda la caché pública."}
          </p>
        ) : query.status ? (
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
            No fue posible retirar la campaña: {query.status === "conflict"
              ? "la versión cambió; recarga la página y verifica los datos"
              : "comprueba tus permisos y la configuración del CMS"}.
          </p>
        ) : null}

        {!data.ready ? (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            No se ha podido consultar el CMS. No se puede editar ni publicar hasta
            restablecer la conexión segura a Supabase.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {campaigns.map(({ locale, name, destination }) => {
              const draft = data.drafts.find((row) => row.locale === locale);
              const published = data.publications.find((row) => row.locale === locale);
              const kindConflict = draft !== undefined && draft.kind !== "promotion";
              const upToDate = published !== undefined &&
                draft !== undefined &&
                published.sourceRevision === draft.revision;

              return (
                <section key={locale} className="rounded-[2rem] border border-[#e4dccf] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-2xl font-bold">{name}</h2>
                    <span lang="en" className={`rounded-full px-3 py-1 text-xs font-black ${upToDate ? "bg-emerald-100 text-emerald-900" : published ? "bg-amber-100 text-amber-900" : "bg-[#f4f1eb] text-[#62594f]"}`}>
                      {upToDate ? "Publicada" : published ? "Cambios pendientes" : "Sin publicar"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#756b61]">
                    {draft ? `Borrador versión ${draft.revision}` : "Nueva campaña"} ·
                    Destino: {destination}
                  </p>

                  {kindConflict ? (
                    <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                      La clave está ocupada por otro tipo de documento. Corrígelo desde el CMS.
                    </p>
                  ) : (
                    <form action={saveContentDraft} className="mt-6 space-y-4">
                      <input type="hidden" name="returnTo" value="marketing" />
                      <input type="hidden" name="contentKey" value="home_campaign" />
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="kind" value="promotion" />
                      {draft ? (
                        <input type="hidden" name="expectedRevision" value={draft.revision} />
                      ) : null}
                      <div>
                        <label htmlFor={`title-${locale}`} className="text-xs font-black uppercase">Título de campaña</label>
                        <input
                          id={`title-${locale}`}
                          name="title"
                          required
                          maxLength={120}
                          disabled={!canEdit}
                          defaultValue={draft?.title ?? ""}
                          placeholder={locale === "pl" ? "Odkryj smak Kolumbii" : locale === "es" ? "Descubre el sabor de Colombia" : "Discover Colombian flavours"}
                          className="mt-2 w-full rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[#123d73]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`body-${locale}`} className="text-xs font-black uppercase">Texto publicitario</label>
                        <textarea
                          id={`body-${locale}`}
                          name="body"
                          required
                          maxLength={500}
                          rows={5}
                          disabled={!canEdit}
                          defaultValue={draft?.body ?? ""}
                          className="mt-2 w-full resize-y rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[#123d73]"
                        />
                        <p className="mt-1 text-xs text-[#756b61]">Máximo 500 caracteres. No incluir precios sin verificar.</p>
                      </div>

                      {canEdit ? (
                        <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#123d73] px-5 text-sm font-black text-white transition hover:bg-[#0e315d]" type="submit">
                          {draft ? "Guardar cambios" : "Crear borrador"}
                        </button>
                      ) : (
                        <p className="rounded-xl bg-[#f4f1eb] p-3 text-xs">
                          El rol publisher puede publicar, pero no cambiar textos.
                        </p>
                      )}
                    </form>
                  )}

                  {draft && canPublish && !kindConflict && !upToDate ? (
                    <form action={publishContentDraft} className="mt-5 border-t border-[#e4dccf] pt-5">
                      <input type="hidden" name="returnTo" value="marketing" />
                      <input type="hidden" name="draftId" value={draft.id} />
                      <input type="hidden" name="expectedRevision" value={draft.revision} />
                      <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-[#f7c600] px-5 text-sm font-black text-[#12100e]">
                        Publicar versión {draft.revision}
                      </button>
                    </form>
                  ) : null}

                  {published && canPublish ? (
                    <form action={unpublishHomeCampaign} className="mt-4">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="expectedRevision" value={published.sourceRevision} />
                      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-300 px-5 text-sm font-black text-red-800 transition hover:bg-red-50">
                        Retirar campaña publicada
                      </button>
                    </form>
                  ) : null}

                  <Link href={destination} className="mt-6 inline-block text-sm font-bold text-[#123d73] underline underline-offset-4">
                    Ver página pública ↗
                  </Link>
                </section>
              );
            })}
          </div>
        )}

        <section className="mt-8 grid gap-5 rounded-[2rem] border border-[#e4dccf] bg-white p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">Fotografías e identidad</h2>
            <p className="mt-3 text-sm leading-7 text-[#62594f]">
              Puedes subir fotografías principales, imágenes de campañas,
              tres fotografías gastronómicas, logotipos y favicons desde
              la administración de marca. Los cambios se publican por separado.
              La campaña usa textos del CMS y no acepta HTML arbitrario.
            </p>
            <Link href="/admin/brand" className="mt-4 inline-block text-sm font-bold text-[#123d73] underline underline-offset-4">
              Administrar imágenes de marca →
            </Link>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Menú y pedidos</h2>
            <p className="mt-3 text-sm leading-7 text-[#62594f]">
              La campaña conduce al menú integrado con RC ORDERA.
              Los precios y la disponibilidad siguen siendo responsabilidad
              del sistema de pedidos para evitar datos duplicados.
            </p>
            <Link href="/admin/menu" className="mt-4 inline-block text-sm font-bold text-[#123d73] underline underline-offset-4">
              Comprobar catálogo RC ORDERA →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
