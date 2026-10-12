import Link from "next/link";

import { requireAdminIdentity } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HOME_EDITABLE_KEYS, HOME_EDITABLE_SECTIONS } from "@/config/home-cms";
import { saveContentDraft, publishContentDraft } from "@/app/(system)/admin/content/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Locale = "pl" | "es" | "en";
type CmsRow = {
  readonly id: string;
  readonly locale: Locale;
  readonly content_key: string;
  readonly kind: string;
  readonly revision: number;
  readonly document: { readonly title: string; readonly body: string };
};
type PublishedRow = {
  readonly locale: Locale;
  readonly content_key: string;
  readonly source_revision: number;
};

const languages = [
  { locale: "pl", label: "Polski" },
  { locale: "es", label: "Español" },
  { locale: "en", label: "English" },
] as const;

function isLocale(value: unknown): value is Locale {
  return value === "pl" || value === "es" || value === "en";
}

function parseDraft(value: unknown): CmsRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) { return null; }
  const row = value as {
    id?: unknown; locale?: unknown; content_key?: unknown;
    kind?: unknown; revision?: unknown; document?: unknown;
  };
  if (typeof row.id !== "string" || !isLocale(row.locale) ||
    typeof row.content_key !== "string" ||
    !HOME_EDITABLE_KEYS.includes(row.content_key as typeof HOME_EDITABLE_KEYS[number]) ||
    typeof row.kind !== "string" || !Number.isSafeInteger(row.revision) ||
    !row.document || typeof row.document !== "object" || Array.isArray(row.document)) {
    return null;
  }
  const doc = row.document as { title?: unknown; body?: unknown };
  if (typeof doc.title !== "string" || typeof doc.body !== "string") { return null; }
  return {
    id: row.id, locale: row.locale, content_key: row.content_key,
    kind: row.kind, revision: row.revision as number,
    document: { title: doc.title, body: doc.body },
  };
}

function parsePublished(value: unknown): PublishedRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) { return null; }
  const row = value as {
    locale?: unknown; content_key?: unknown; source_revision?: unknown;
  };
  if (!isLocale(row.locale) || typeof row.content_key !== "string" ||
    !Number.isSafeInteger(row.source_revision)) { return null; }
  return {
    locale: row.locale, content_key: row.content_key,
    source_revision: row.source_revision as number,
  };
}

async function loadEditorData(): Promise<{
  readonly connected: boolean;
  readonly drafts: readonly CmsRow[];
  readonly published: readonly PublishedRow[];
}> {
  const client = await createSupabaseServerClient();
  if (!client) { return { connected: false, drafts: [], published: [] }; }

  const [drafts, published] = await Promise.all([
    client.from("web_cms_drafts")
      .select("id,locale,content_key,kind,revision,document")
      .in("content_key", [...HOME_EDITABLE_KEYS])
      .limit(50),
    client.from("web_cms_published")
      .select("content_key,locale,source_revision")
      .in("content_key", [...HOME_EDITABLE_KEYS])
      .limit(50),
  ]);
  if (drafts.error || published.error) {
    return { connected: false, drafts: [], published: [] };
  }
  return {
    connected: true,
    drafts: (drafts.data ?? []).map(parseDraft).filter((r): r is CmsRow => r !== null),
    published: (published.data ?? []).map(parsePublished).filter(
      (r): r is PublishedRow => r !== null,
    ),
  };
}

/**
 * Human-friendly public-home content editor. Reuses revision-guarded CMS
 * actions and permissions; it does not create a parallel content system.
 */
export default async function AdminHomeEditor({
  searchParams,
}: {
  readonly searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const admin = await requireAdminIdentity();
  const query = await searchParams;
  const locale: Locale = isLocale(query.locale) ? query.locale : "es";
  const data = await loadEditorData();
  const canEdit = admin.role === "owner" || admin.role === "editor";
  const canPublish = admin.role === "owner" || admin.role === "publisher";

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#12100e]">
      <div className="grid h-2 grid-cols-[2fr_1fr_1fr]" aria-hidden="true">
        <span className="bg-[#f7c600]" /><span className="bg-[#123d73]" /><span className="bg-[#c92d39]" />
      </div>
      <div className="site-container py-8 sm:py-12">
        <nav aria-label="Administración" className="flex flex-wrap gap-4 text-sm font-bold text-[#123d73]">
          <Link href="/admin" className="underline underline-offset-4">← Panel CEO</Link>
          <Link href="/admin/marketing" className="underline underline-offset-4">Campañas</Link>
          <Link href="/admin/brand" className="underline underline-offset-4">Fotografías</Link>
          <Link href="/admin/menu" className="underline underline-offset-4">Menú RC ORDERA</Link>
        </nav>
        <header className="mt-7 rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-[#f7c600]">
            Rincón Admin · Contenido y posicionamiento
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Editar la página de inicio y su SEO
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
            Edita los textos que leen tus clientes: portada, servicios,
            ocho tarjetas comerciales y resultados de Google.
            Cada idioma se guarda y publica por separado.
          </p>
          <p className="mt-4 text-xs text-white/70">
            {admin.email} · Rol: {admin.role}
          </p>
        </header>

        <nav aria-label="Elegir idioma" className="mt-7 flex flex-wrap gap-3">
          {languages.map(({ locale: lang, label }) => (
            <Link
              key={lang}
              href={`/admin/home?locale=${lang}`}
              lang={lang}
              aria-current={locale === lang ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-6 text-sm font-black ${locale === lang
                ? "bg-[#f7c600] text-[#12100e]" : "border border-[#123d73] bg-white text-[#123d73]"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {query.status === "saved" || query.status === "published" ? (
          <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
            {query.status === "saved"
              ? "Borrador guardado. Publícalo cuando esté revisado."
              : "Contenido publicado. Puede tardar algunos minutos en actualizarse en la web."}
          </p>
        ) : null}

        {!data.connected ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            No se puede consultar la base de contenidos. Comprueba Supabase y
            los permisos administrativos antes de publicar.
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm leading-7 text-[#62594f]">
              Trabajas en <strong>{languages.find((l) => l.locale === locale)?.label}</strong>.
              Guardar no publica automáticamente. Los textos comerciales actuales
              siguen visibles hasta que se apruebe y publique una versión nueva.
            </p>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {HOME_EDITABLE_SECTIONS.map((section, index) => {
                const draft = data.drafts.find(
                  (item) => item.locale === locale && item.content_key === section.key,
                );
                const published = data.published.find(
                  (item) => item.locale === locale && item.content_key === section.key,
                );
                const current = draft && published?.source_revision === draft.revision;
                const kindMismatch = draft && draft.kind !== section.kind;
                return (
                  <details key={section.key} open={index < 2 || index === HOME_EDITABLE_SECTIONS.length - 1 ? true : undefined}
                    className="rounded-[1.75rem] border border-[#e4dccf] bg-white p-6 shadow-sm">
                    <summary className="cursor-pointer font-serif text-xl font-bold">
                      {section.label}
                      <span className={`ml-3 inline-block align-middle rounded-full px-3 py-1 font-sans text-[0.65rem] font-black ${current
                        ? "bg-emerald-100 text-emerald-900"
                        : published ? "bg-amber-100 text-amber-900" : "bg-[#f4f1eb] text-[#62594f]"}`}>
                        {current ? "Publicado" : published ? "Cambios pendientes" : "Sin publicar"}
                      </span>
                    </summary>
                    <p className="mt-3 text-xs leading-6 text-[#756b61]">
                      Clave: {section.key} · {draft ? `Revisión ${draft.revision}` : "Borrador nuevo"}.
                      {section.key === "home_seo"
                        ? " Título SEO y descripción visible en Google. El idioma determina la URL canónica."
                        : " Este texto reemplazará el contenido actual sólo al publicarse."}
                    </p>
                    {kindMismatch ? (
                      <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">
                        El tipo del borrador no coincide con esta sección. Revísalo desde Contenidos.
                      </p>
                    ) : (
                      <form action={saveContentDraft} className="mt-5 space-y-4">
                        <input type="hidden" name="returnTo" value="home" />
                        <input type="hidden" name="contentKey" value={section.key} />
                        <input type="hidden" name="kind" value={section.kind} />
                        <input type="hidden" name="locale" value={locale} />
                        {draft ? <input type="hidden" name="expectedRevision" value={draft.revision} /> : null}
                        <div>
                          <label htmlFor={`home-title-${section.key}`} className="text-xs font-black uppercase">
                            {section.key === "home_seo" ? "Título SEO" : "Título comercial"}
                          </label>
                          <input id={`home-title-${section.key}`} name="title" required
                            maxLength={section.maxTitle} disabled={!canEdit}
                            defaultValue={draft?.document.title ?? ""}
                            placeholder={section.key === "home_seo" ? "Comida colombiana en Varsovia | Rincón Colombiano" : "Escribe un título que conecte con tus clientes"}
                            className="mt-2 min-h-11 w-full rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[#123d73]" />
                          <p className="mt-1 text-xs text-[#756b61]">Máximo {section.maxTitle} caracteres.</p>
                        </div>
                        <div>
                          <label htmlFor={`home-body-${section.key}`} className="text-xs font-black uppercase">
                            {section.key === "home_seo" ? "Meta descripción SEO" : "Descripción"}
                          </label>
                          <textarea id={`home-body-${section.key}`} name="body" required
                            maxLength={section.maxBody} disabled={!canEdit}
                            defaultValue={draft?.document.body ?? ""}
                            rows={section.key === "home_seo" ? 3 : 4}
                            className="mt-2 w-full resize-y rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm leading-6 focus-visible:outline-2 focus-visible:outline-[#123d73]" />
                          <p className="mt-1 text-xs text-[#756b61]">Máximo {section.maxBody} caracteres.</p>
                        </div>
                        {canEdit ? (
                          <button type="submit" className="min-h-11 rounded-full bg-[#123d73] px-5 text-sm font-black text-white">
                            {draft ? "Guardar cambios" : "Crear borrador"}
                          </button>
                        ) : null}
                      </form>
                    )}

                    {canPublish && draft && !kindMismatch && !current ? (
                      <form action={publishContentDraft} className="mt-5 border-t pt-5">
                        <input type="hidden" name="returnTo" value="home" />
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="draftId" value={draft.id} />
                        <input type="hidden" name="expectedRevision" value={draft.revision} />
                        <button type="submit" className="min-h-11 rounded-full bg-[#f7c600] px-5 text-sm font-black text-[#12100e]">
                          Publicar revisión {draft.revision}
                        </button>
                      </form>
                    ) : null}
                  </details>
                );
              })}
            </div>
          </>
        )}
        <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-[#123d73]">
          <Link href={`/${locale}`} className="underline underline-offset-4">
            Ver página pública ↗
          </Link>
          <Link href="/admin/content" className="underline underline-offset-4">
            Editor avanzado de contenidos →
          </Link>
        </div>
      </div>
    </main>
  );
}
