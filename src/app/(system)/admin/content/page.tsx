import Link from "next/link";

import {
  publishContentDraft,
  saveContentDraft,
} from "@/app/(system)/admin/content/actions";

import {
  requireAdminIdentity,
} from "@/lib/admin/auth";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";


/* ============================================================
   RUNTIME
   ============================================================ */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;


/* ============================================================
   TYPES
   ============================================================ */

interface CmsDraft {
  readonly id:
    string;

  readonly contentKey:
    string;

  readonly locale:
    string;

  readonly kind:
    string;

  readonly title:
    string;

  readonly body:
    string;

  readonly revision:
    number;

  readonly updatedAt:
    string;
}


interface PublishedContent {
  readonly contentKey:
    string;

  readonly locale:
    string;

  readonly sourceRevision:
    number;

  readonly publishedAt:
    string;
}


interface ContentPageSearchParams {
  readonly edit?:
    string |
    readonly string[];

  readonly success?:
    string |
    readonly string[];

  readonly error?:
    string |
    readonly string[];

  readonly [key:
    string]:
    string |
    readonly string[] |
    undefined;
}


interface ContentPageProps {
  readonly searchParams:
    Promise<
      Readonly<
        ContentPageSearchParams
      >
    >;
}


/* ============================================================
   HELPERS
   ============================================================ */

function isRecord(
  value:
    unknown,
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}


function readString(
  value:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): string | null {

  const field =
    value[
      key
    ];

  return typeof field ===
    "string"
    ? field
    : null;
}


function readNumber(
  value:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): number | null {

  const field =
    value[
      key
    ];

  return (
    typeof field ===
      "number" &&
    Number.isFinite(
      field,
    )
  )
    ? field
    : null;
}


function readUnknown(
  value:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): unknown {

  return value[
    key
  ];
}


function normalizeDraft(
  value:
    unknown,
): CmsDraft | null {

  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }


  const id =
    readString(
      value,
      "id",
    );

  const contentKey =
    readString(
      value,
      "content_key",
    );

  const locale =
    readString(
      value,
      "locale",
    );

  const kind =
    readString(
      value,
      "kind",
    );

  const revision =
    readNumber(
      value,
      "revision",
    );

  const updatedAt =
    readString(
      value,
      "updated_at",
    );

  const document =
    readUnknown(
      value,
      "document",
    );


  if (
    !id ||
    !contentKey ||
    !locale ||
    !kind ||
    revision ===
      null ||
    !updatedAt ||
    !isRecord(
      document,
    )
  ) {
    return null;
  }


  const title =
    readString(
      document,
      "title",
    );

  const body =
    readString(
      document,
      "body",
    );


  if (
    title ===
      null ||
    body ===
      null
  ) {
    return null;
  }


  return {
    id,
    contentKey,
    locale,
    kind,
    title,
    body,
    revision,
    updatedAt,
  };
}


function normalizePublished(
  value:
    unknown,
): PublishedContent | null {

  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }


  const contentKey =
    readString(
      value,
      "content_key",
    );

  const locale =
    readString(
      value,
      "locale",
    );

  const sourceRevision =
    readNumber(
      value,
      "source_revision",
    );

  const publishedAt =
    readString(
      value,
      "published_at",
    );


  if (
    !contentKey ||
    !locale ||
    sourceRevision ===
      null ||
    !publishedAt
  ) {
    return null;
  }


  return {
    contentKey,
    locale,
    sourceRevision,
    publishedAt,
  };
}


function getFirstSearchParam(
  value:
    string |
    readonly string[] |
    undefined,
): string | null {

  if (
    typeof value ===
      "string"
  ) {
    return value;
  }


  if (
    Array.isArray(
      value,
    )
  ) {
    return typeof value[
      0
    ] ===
      "string"
      ? value[
          0
        ]
      : null;
  }


  return null;
}


/* ============================================================
   FEEDBACK
   ============================================================ */

const SUCCESS_MESSAGES:
  Readonly<
    Record<
      string,
      string
    >
  > = {
  saved:
    "El borrador fue guardado correctamente.",

  published:
    "El contenido fue publicado correctamente.",
};


const ERROR_MESSAGES:
  Readonly<
    Record<
      string,
      string
    >
  > = {
  forbidden:
    "Tu rol administrativo no permite realizar esta operación.",

  missing:
    "Completa todos los campos obligatorios.",

  "invalid-key":
    "La clave de contenido no es válida.",

  "invalid-locale":
    "El idioma seleccionado no es válido.",

  "invalid-kind":
    "El tipo de contenido no es válido.",

  "invalid-title":
    "El título no cumple los límites permitidos.",

  "invalid-body":
    "El contenido está vacío o supera el tamaño permitido.",

  "kind-conflict":
    "El tipo de un contenido existente no puede cambiarse desde esta operación.",

  conflict:
    "Otra edición modificó este contenido. Recarga la página antes de continuar.",

  configuration:
    "Supabase no está correctamente configurado.",

  read:
    "No fue posible consultar el contenido.",

  save:
    "No fue posible guardar el borrador.",

  "invalid-publish":
    "La solicitud de publicación no es válida.",

  publish:
    "No fue posible publicar el contenido.",
};


/* ============================================================
   DATA
   ============================================================ */

async function loadCmsData() {

  const supabase =
    await createSupabaseServerClient();


  if (
    !supabase
  ) {
    return {
      drafts:
        [] as CmsDraft[],

      published:
        [] as PublishedContent[],

      available:
        false,
    };
  }


  const [
    draftsResult,
    publishedResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "web_cms_drafts",
        )
        .select(
          "id, content_key, locale, kind, document, revision, updated_at",
        )
        .order(
          "updated_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          200,
        ),

      supabase
        .from(
          "web_cms_published",
        )
        .select(
          "content_key, locale, source_revision, published_at",
        )
        .order(
          "published_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          200,
        ),
    ]);


  if (
    draftsResult.error ||
    publishedResult.error
  ) {
    return {
      drafts:
        [] as CmsDraft[],

      published:
        [] as PublishedContent[],

      available:
        false,
    };
  }


  const drafts =
    (
      Array.isArray(
        draftsResult.data,
      )
        ? draftsResult.data
        : []
    )
      .map(
        normalizeDraft,
      )
      .filter(
        (
          value,
        ): value is CmsDraft =>
          value !==
          null,
      );


  const published =
    (
      Array.isArray(
        publishedResult.data,
      )
        ? publishedResult.data
        : []
    )
      .map(
        normalizePublished,
      )
      .filter(
        (
          value,
        ): value is PublishedContent =>
          value !==
          null,
      );


  return {
    drafts,
    published,
    available:
      true,
  };
}


/* ============================================================
   PAGE
   ============================================================ */

export default async function ContentAdminPage({
  searchParams,
}: ContentPageProps) {

  const admin =
    await requireAdminIdentity();


  const params =
    await searchParams;


  const editId =
    getFirstSearchParam(
      params.edit,
    );


  const successKey =
    getFirstSearchParam(
      params.success,
    );


  const errorKey =
    getFirstSearchParam(
      params.error,
    );


  const cms =
    await loadCmsData();


  const selectedDraft =
    editId
      ? cms.drafts.find(
          (
            draft,
          ) =>
            draft.id ===
              editId,
        ) ??
        null
      : null;


  const canEdit =
    admin.role ===
      "owner" ||
    admin.role ===
      "editor";


  const canPublish =
    admin.role ===
      "owner" ||
    admin.role ===
      "publisher";


  const publishedMap =
    new Map(
      cms.published.map(
        (
          item,
        ) => [
          `${item.contentKey}:${item.locale}`,
          item,
        ],
      ),
    );


  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#12100e]">

      <div
        className="grid h-2 grid-cols-[2fr_1fr_1fr]"
        aria-hidden="true"
      >
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>


      <header className="bg-[#12100e] text-white">
        <div className="site-container flex min-h-20 items-center justify-between gap-4 py-4">

          <div className="flex items-center gap-4">

            <Link
              href="/admin"
              className="grid size-11 place-items-center rounded-2xl bg-[#f7c600] font-black text-[#12100e]"
            >
              RC
            </Link>

            <div>
              <p className="text-xs font-black tracking-[0.14em] text-[#f7c600] uppercase">
                Rincón Admin
              </p>

              <h1 className="font-serif text-xl font-bold">
                Contenido
              </h1>
            </div>

          </div>


          <div className="text-right text-xs">
            <p className="font-bold">
              {admin.email}
            </p>

            <p className="text-white/50 uppercase">
              {admin.role}
            </p>
          </div>

        </div>
      </header>


      <div className="site-container py-10">

        <section className="rounded-[2rem] bg-[#123d73] p-7 text-white sm:p-10">

          <p className="text-xs font-black tracking-[0.15em] text-[#f7c600] uppercase">
            CMS
          </p>

          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold sm:text-4xl">
            Administra el contenido sin editar el código.
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Los cambios se guardan primero como borrador.
            La web pública solo recibirá contenido que haya
            sido publicado explícitamente.
          </p>

        </section>


        {
          successKey &&
          SUCCESS_MESSAGES[
            successKey
          ]
            ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                  {
                    SUCCESS_MESSAGES[
                      successKey
                    ]
                  }
                </div>
              )
            : null
        }


        {
          errorKey
            ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
                  {
                    ERROR_MESSAGES[
                      errorKey
                    ] ??
                    "La operación no pudo completarse."
                  }
                </div>
              )
            : null
        }


        {
          !cms.available
            ? (
                <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm font-bold">
                  No fue posible cargar la infraestructura CMS.
                </div>
              )
            : null
        }


        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">

          {/* ==================================================
              EDITOR
              ================================================== */}

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-black tracking-[0.12em] text-[#123d73] uppercase">
                  Editor
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold">
                  {
                    selectedDraft
                      ? "Editar borrador"
                      : "Nuevo contenido"
                  }
                </h2>
              </div>


              {
                selectedDraft
                  ? (
                      <Link
                        href="/admin/content"
                        className="rounded-full border px-4 py-2 text-xs font-bold"
                      >
                        Nuevo
                      </Link>
                    )
                  : null
              }

            </div>


            <form
              action={
                saveContentDraft
              }
              className="mt-7 space-y-5"
            >

              {
                selectedDraft
                  ? (
                      <input
                        type="hidden"
                        name="expectedRevision"
                        value={
                          selectedDraft.revision
                        }
                      />
                    )
                  : null
              }


              <div>
                <label className="text-xs font-black uppercase">
                  Clave interna
                </label>

                <input
                  name="contentKey"
                  required
                  readOnly={
                    Boolean(
                      selectedDraft,
                    )
                  }
                  defaultValue={
                    selectedDraft
                      ?.contentKey ??
                    ""
                  }
                  placeholder="home_hero"
                  className="mt-2 w-full rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm"
                />

                <p className="mt-2 text-xs text-[#756b61]">
                  Solo minúsculas, números, guion y guion bajo.
                </p>
              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="text-xs font-black uppercase">
                    Idioma
                  </label>

                  {
                    selectedDraft
                      ? (
                          <>
                            <input
                              type="hidden"
                              name="locale"
                              value={
                                selectedDraft.locale
                              }
                            />

                            <input
                              readOnly
                              value={
                                selectedDraft.locale
                              }
                              className="mt-2 w-full rounded-xl border bg-[#f4f1eb] px-4 py-3 text-sm uppercase"
                            />
                          </>
                        )
                      : (
                          <select
                            name="locale"
                            defaultValue="es"
                            className="mt-2 w-full rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm"
                          >
                            <option value="pl">
                              Polski
                            </option>

                            <option value="es">
                              Español
                            </option>

                            <option value="en">
                              English
                            </option>
                          </select>
                        )
                  }
                </div>


                <div>
                  <label className="text-xs font-black uppercase">
                    Tipo
                  </label>

                  {
                    selectedDraft
                      ? (
                          <>
                            <input
                              type="hidden"
                              name="kind"
                              value={
                                selectedDraft.kind
                              }
                            />

                            <input
                              readOnly
                              value={
                                selectedDraft.kind
                              }
                              className="mt-2 w-full rounded-xl border bg-[#f4f1eb] px-4 py-3 text-sm"
                            />
                          </>
                        )
                      : (
                          <select
                            name="kind"
                            defaultValue="page"
                            className="mt-2 w-full rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm"
                          >
                            <option value="page">
                              Página
                            </option>

                            <option value="service">
                              Servicio
                            </option>

                            <option value="story">
                              Historia
                            </option>

                            <option value="promotion">
                              Promoción
                            </option>

                            <option value="testimonial">
                              Opinión
                            </option>

                            <option value="article">
                              Artículo
                            </option>
                          </select>
                        )
                  }
                </div>

              </div>


              <div>
                <label className="text-xs font-black uppercase">
                  Título
                </label>

                <input
                  name="title"
                  required
                  maxLength={
                    200
                  }
                  disabled={
                    !canEdit
                  }
                  defaultValue={
                    selectedDraft
                      ?.title ??
                    ""
                  }
                  className="mt-2 w-full rounded-xl border border-[#ddd5c9] px-4 py-3"
                />
              </div>


              <div>
                <label className="text-xs font-black uppercase">
                  Contenido
                </label>

                <textarea
                  name="body"
                  required
                  disabled={
                    !canEdit
                  }
                  defaultValue={
                    selectedDraft
                      ?.body ??
                    ""
                  }
                  rows={
                    14
                  }
                  className="mt-2 w-full resize-y rounded-xl border border-[#ddd5c9] px-4 py-3 text-sm leading-7"
                />
              </div>


              {
                canEdit
                  ? (
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#123d73] px-6 text-sm font-black text-white"
                      >
                        Guardar borrador
                      </button>
                    )
                  : (
                      <p className="rounded-xl bg-[#f4f1eb] p-4 text-sm">
                        Tu rol permite revisar/publicar, pero no modificar borradores.
                      </p>
                    )
              }

            </form>


            {
              selectedDraft &&
              canPublish
                ? (
                    <form
                      action={
                        publishContentDraft
                      }
                      className="mt-5 border-t pt-5"
                    >
                      <input
                        type="hidden"
                        name="draftId"
                        value={
                          selectedDraft.id
                        }
                      />

                      <input
                        type="hidden"
                        name="expectedRevision"
                        value={
                          selectedDraft.revision
                        }
                      />

                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7c600] px-6 text-sm font-black text-[#12100e]"
                      >
                        Publicar versión {selectedDraft.revision}
                      </button>
                    </form>
                  )
                : null
            }

          </section>


          {/* ==================================================
              CONTENT LIST
              ================================================== */}

          <section>

            <div className="flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-black tracking-[0.12em] text-[#123d73] uppercase">
                  Biblioteca
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold">
                  Contenido administrable
                </h2>
              </div>

              <span className="text-xs font-bold text-[#756b61]">
                {cms.drafts.length} borradores
              </span>

            </div>


            <div className="mt-6 space-y-4">

              {
                cms.drafts.length ===
                  0
                  ? (
                      <div className="rounded-[1.5rem] border border-dashed border-[#cfc6b8] bg-white p-8 text-center text-sm text-[#756b61]">
                        Todavía no existe contenido administrable.
                      </div>
                    )
                  : cms.drafts.map(
                      (
                        draft,
                      ) => {

                        const published =
                          publishedMap.get(
                            `${draft.contentKey}:${draft.locale}`,
                          );


                        const fullyPublished =
                          published
                            ?.sourceRevision ===
                          draft.revision;


                        return (
                          <article
                            key={
                              draft.id
                            }
                            className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm"
                          >

                            <div className="flex flex-wrap items-start justify-between gap-4">

                              <div>

                                <div className="flex flex-wrap gap-2 text-[0.65rem] font-black uppercase">

                                  <span className="rounded-full bg-[#f4f1eb] px-2.5 py-1">
                                    {draft.locale}
                                  </span>

                                  <span className="rounded-full bg-[#f4f1eb] px-2.5 py-1">
                                    {draft.kind}
                                  </span>

                                  <span
                                    className={
                                      fullyPublished
                                        ? "rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-900"
                                        : published
                                          ? "rounded-full bg-amber-100 px-2.5 py-1 text-amber-900"
                                          : "rounded-full bg-slate-100 px-2.5 py-1 text-slate-700"
                                    }
                                  >
                                    {
                                      fullyPublished
                                        ? "Publicado"
                                        : published
                                          ? "Cambios sin publicar"
                                          : "Borrador"
                                    }
                                  </span>

                                </div>


                                <h3 className="mt-3 font-serif text-xl font-bold">
                                  {draft.title}
                                </h3>


                                <p className="mt-1 font-mono text-xs text-[#756b61]">
                                  {draft.contentKey}
                                </p>


                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#62594f]">
                                  {draft.body}
                                </p>

                              </div>


                              <div className="text-right">

                                <p className="text-xs text-[#756b61]">
                                  Revisión
                                </p>

                                <p className="text-lg font-black">
                                  {draft.revision}
                                </p>

                              </div>

                            </div>


                            <div className="mt-5">

                              <Link
                                href={
                                  `/admin/content?edit=${encodeURIComponent(
                                    draft.id,
                                  )}`
                                }
                                className="inline-flex rounded-full bg-[#12100e] px-4 py-2 text-xs font-black text-white"
                              >
                                Abrir
                              </Link>

                            </div>

                          </article>
                        );
                      },
                    )
              }

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}
