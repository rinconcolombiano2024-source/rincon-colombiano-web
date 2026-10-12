import Link from "next/link";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SEO_EDITABLE_ROUTES } from "@/config/seo-cms";
import { saveContentDraft, publishContentDraft } from "@/app/(system)/admin/content/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Locale = "pl" | "es" | "en";
type SeoDraft = {
  id: string;
  content_key: string;
  locale: Locale;
  kind: string;
  revision: number;
  document: { title: string; body: string };
};
type SeoPublished = { content_key: string; locale: Locale; source_revision: number };

const locales = [
  { key: "pl", name: "Polski" },
  { key: "es", name: "Español" },
  { key: "en", name: "English" },
] as const;

function isLocale(value: unknown): value is Locale {
  return value === "pl" || value === "es" || value === "en";
}

function parseDraft(value: unknown): SeoDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as {
    id?: unknown; content_key?: unknown; locale?: unknown;
    kind?: unknown; revision?: unknown; document?: unknown;
  };
  if (typeof row.id !== "string" || typeof row.content_key !== "string" ||
    !SEO_EDITABLE_ROUTES.some((route) => route.key === row.content_key) ||
    !isLocale(row.locale) || typeof row.kind !== "string" ||
    !Number.isSafeInteger(row.revision) ||
    !row.document || typeof row.document !== "object" || Array.isArray(row.document)) {
    return null;
  }
  const document = row.document as { title?: unknown; body?: unknown };
  if (typeof document.title !== "string" || typeof document.body !== "string") {
    return null;
  }
  return {
    id: row.id, content_key: row.content_key, locale: row.locale,
    kind: row.kind, revision: row.revision as number,
    document: { title: document.title, body: document.body },
  };
}

function parsePublished(value: unknown): SeoPublished | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as { content_key?: unknown; locale?: unknown; source_revision?: unknown };
  if (typeof row.content_key !== "string" || !isLocale(row.locale) ||
    !Number.isSafeInteger(row.source_revision)) {
    return null;
  }
  return {
    content_key: row.content_key, locale: row.locale,
    source_revision: row.source_revision as number,
  };
}

async function getSeoData(): Promise<{
  ready: boolean; drafts: SeoDraft[]; published: SeoPublished[];
}> {
  const client = await createSupabaseServerClient();
  if (!client) {
    return { ready: false, drafts: [], published: [] };
  }
  const keys = SEO_EDITABLE_ROUTES.map((route) => route.key);
  const [drafts, published] = await Promise.all([
    client.from("web_cms_drafts")
      .select("id,content_key,locale,kind,revision,document")
      .in("content_key", keys)
      .limit(15),
    client.from("web_cms_published")
      .select("content_key,locale,source_revision")
      .in("content_key", keys)
      .limit(15),
  ]);
  if (drafts.error || published.error) {
    return { ready: false, drafts: [], published: [] };
  }
  return {
    ready: true,
    drafts: (drafts.data ?? []).map(parseDraft).filter((value): value is SeoDraft => value !== null),
    published: (published.data ?? []).map(parsePublished).filter(
      (value): value is SeoPublished => value !== null,
    ),
  };
}

export default async function SeoAdminPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const admin = await requireAdminIdentity();
  const query = await searchParams;
  const locale: Locale = isLocale(query.locale) ? query.locale : "pl";
  const data = await getSeoData();
  const canEdit = admin.role === "owner" || admin.role === "editor";
  const canPublish = admin.role === "owner" || admin.role === "publisher";

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#12100e]">
      <div className="grid h-2 grid-cols-[2fr_1fr_1fr]" aria-hidden="true">
        <span className="bg-[#f7c600]" />
        <span className="bg-[#123d73]" />
        <span className="bg-[#c92d39]" />
      </div>
      <div className="site-container py-8 sm:py-12">
        <nav aria-label="Administración" className="flex flex-wrap gap-4 text-sm font-bold text-[#123d73]">
          <Link href="/admin" className="underline underline-offset-4">← Panel CEO</Link>
          <Link href="/admin/home" className="underline underline-offset-4">Textos comerciales</Link>
          <Link href="/admin/brand" className="underline underline-offset-4">Imagen Open Graph</Link>
        </nav>

        <header className="mt-7 rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-[#f7c600]">
            SEO de Google · Rincón Colombiano
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Posicionamiento de nuestras páginas
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
            Edita el título y la descripción que identifican el restaurante
            y sus páginas reales en Google. Los textos se traducen y publican
            de forma independiente; nunca añadimos palabras clave ocultas.
          </p>
        </header>

        <nav aria-label="Idioma SEO" className="mt-7 flex flex-wrap gap-3">
          {locales.map(({ key, name }) => (
            <Link key={key} href={`/admin/seo?locale=${key}`}
              lang={key} aria-current={locale === key ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-6 text-sm font-black ${locale === key
                ? "bg-[#f7c600]" : "border border-[#123d73] bg-white text-[#123d73]"}`}>
              {name}
            </Link>
          ))}
        </nav>

        {query.status === "saved" || query.status === "published" ? (
          <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {query.status === "saved"
              ? "Borrador guardado. Publícalo tras revisar el texto."
              : "Metadatos publicados. Su actualización puede tardar unos minutos."}
          </p>
        ) : null}

        {!data.ready ? (
          <p role="alert" className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            El CMS no está disponible. No se pueden editar ni publicar metadatos hasta recuperar Supabase.
          </p>
        ) : (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {SEO_EDITABLE_ROUTES.map((route) => {
              const draft = data.drafts.find((row) =>
                row.content_key === route.key && row.locale === locale);
              const published = data.published.find((row) =>
                row.content_key === route.key && row.locale === locale);
              const current = draft && published?.source_revision === draft.revision;
              const kindMismatch = draft && draft.kind !== "page";
              return (
                <section key={route.key} className="rounded-[2rem] border border-[#e4dccf] bg-white p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-bold">{route.label}</h2>
                  <p className="mt-2 text-xs text-[#62594f]">
                    {route.key} · {draft ? `Revisión ${draft.revision}` : "Nuevo borrador"}
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#123d73]">
                    {current ? "Publicado" : published ? "Cambios sin publicar" : "Sin publicar"}
                  </p>
                  {kindMismatch ? (
                    <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900">
                      Existe un documento de otro tipo. Revisa la clave desde el editor de contenidos.
                    </p>
                  ) : (
                    <form action={saveContentDraft} className="mt-5 space-y-4">
                      <input type="hidden" name="returnTo" value="seo" />
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="contentKey" value={route.key} />
                      <input type="hidden" name="kind" value="page" />
                      {draft ? <input type="hidden" name="expectedRevision" value={draft.revision} /> : null}
                      <div>
                        <label htmlFor={`title-${route.key}`} className="text-xs font-black uppercase">Título SEO</label>
                        <input id={`title-${route.key}`} name="title" required maxLength={70}
                          disabled={!canEdit} defaultValue={draft?.document.title ?? ""}
                          placeholder="Restauracja kolumbijska Warszawa | Rincón Colombiano"
                          className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm" />
                        <p className="mt-1 text-xs text-[#62594f]">Máximo 70 caracteres.</p>
                      </div>
                      <div>
                        <label htmlFor={`description-${route.key}`} className="text-xs font-black uppercase">
                          Meta descripción
                        </label>
                        <textarea id={`description-${route.key}`} name="body" required maxLength={165}
                          disabled={!canEdit} defaultValue={draft?.document.body ?? ""} rows={4}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
                        <p className="mt-1 text-xs text-[#62594f]">
                          Máximo 165 caracteres; describe productos que realmente vendemos.
                        </p>
                      </div>
                      {canEdit ? (
                        <button type="submit" className="min-h-11 rounded-full bg-[#123d73] px-5 text-sm font-black text-white">
                          Guardar borrador
                        </button>
                      ) : null}
                    </form>
                  )}

                  {canPublish && draft && !current && !kindMismatch ? (
                    <form action={publishContentDraft} className="mt-5 border-t pt-5">
                      <input type="hidden" name="returnTo" value="seo" />
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="draftId" value={draft.id} />
                      <input type="hidden" name="expectedRevision" value={draft.revision} />
                      <button type="submit" className="min-h-11 rounded-full bg-[#f7c600] px-5 text-sm font-black text-[#12100e]">
                        Publicar SEO
                      </button>
                    </form>
                  ) : null}
                  <Link href={route.route === "location"
                    ? locale === "pl" ? "/pl/lokale/czapelska"
                      : locale === "es" ? "/es/restaurantes/czapelska"
                        : "/en/locations/czapelska"
                    : route.route === "menu" ? `/${locale}/menu` : `/${locale}`}
                    className="mt-5 inline-block text-sm font-bold text-[#123d73] underline underline-offset-4">
                    Ver página real ↗
                  </Link>
                </section>
              );
            })}
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-[#e4dccf] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold">SEO técnico protegido</h2>
          <p className="mt-3 text-sm leading-7 text-[#62594f]">
            Los títulos y descripciones publicados también se aplican a Open Graph.
            Las imágenes sociales se gestionan desde Marca. Las URL canónicas,
            idiomas hreflang, robots y datos estructurados usan las rutas reales
            y no se pueden falsificar introduciendo direcciones arbitrarias.
            Las futuras sedes no aparecen como restaurantes abiertos.
          </p>
          <Link href="/admin/brand" className="mt-4 inline-block text-sm font-bold text-[#123d73] underline underline-offset-4">
            Administrar imágenes para redes →
          </Link>
        </section>
      </div>
    </main>
  );
}
