import Link from "next/link";

import {
  publishBrandAsset,
  retireBrandAsset,
  uploadBrandAsset,
} from "@/app/(system)/admin/brand/actions";

import {
  requireAdminIdentity,
} from "@/lib/admin/auth";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";


/* ============================================================
   RUNTIME
   ============================================================ */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;


/* ============================================================
   CONSTANTS
   ============================================================ */

const BRAND_BUCKET =
  "web-brand-assets";


const BRAND_SLOTS = [
  "logo_primary",
  "logo_compact",
  "logo_light",
  "logo_dark",
  "favicon",
  "open_graph",
  "social_square",
] as const;


type BrandSlot =
  (typeof BRAND_SLOTS)[number];


/* ============================================================
   TYPES
   ============================================================ */

interface BrandAsset {
  readonly id:
    string;

  readonly slot:
    BrandSlot;

  readonly objectPath:
    string;

  readonly originalName:
    string;

  readonly mimeType:
    string;

  readonly sizeBytes:
    number;

  readonly altText:
    string;

  readonly sha256:
    string | null;

  readonly createdAt:
    string;

  readonly retiredAt:
    string | null;

  readonly publicUrl:
    string;
}


interface PublishedBrandAsset {
  readonly slot:
    BrandSlot;

  readonly sourceAssetId:
    string;

  readonly objectPath:
    string;

  readonly mimeType:
    string;

  readonly altText:
    string;

  readonly publishedAt:
    string;

  readonly publicUrl:
    string;
}


type BrandInfrastructureStatus =
  | "ready"
  | "not-configured"
  | "unavailable";


interface BrandAdminData {
  readonly status:
    BrandInfrastructureStatus;

  readonly assets:
    readonly BrandAsset[];

  readonly published:
    readonly PublishedBrandAsset[];
}


interface BrandPageSearchParams {
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


interface BrandPageProps {
  readonly searchParams:
    Promise<
      Readonly<
        BrandPageSearchParams
      >
    >;
}


/* ============================================================
   SLOT CONTENT
   ============================================================ */

const SLOT_LABELS:
  Readonly<
    Record<
      BrandSlot,
      {
        readonly title:
          string;

        readonly description:
          string;
      }
    >
  > = {
  logo_primary: {
    title:
      "Logo principal",

    description:
      "Logo oficial utilizado como identidad principal de Rincón Colombiano.",
  },

  logo_compact: {
    title:
      "Logo compacto",

    description:
      "Versión reducida para espacios pequeños, navegación o aplicaciones.",
  },

  logo_light: {
    title:
      "Logo sobre fondo oscuro",

    description:
      "Versión optimizada para superficies oscuras.",
  },

  logo_dark: {
    title:
      "Logo sobre fondo claro",

    description:
      "Versión optimizada para superficies claras.",
  },

  favicon: {
    title:
      "Favicon",

    description:
      "Icono utilizado por navegadores, pestañas y accesos directos.",
  },

  open_graph: {
    title:
      "Open Graph",

    description:
      "Imagen horizontal utilizada al compartir la web en redes y mensajería.",
  },

  social_square: {
    title:
      "Imagen social cuadrada",

    description:
      "Recurso cuadrado para perfiles, campañas y publicaciones sociales.",
  },
};


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
  uploaded:
    "El archivo fue cargado correctamente. Todavía no está publicado.",

  published:
    "La nueva identidad visual fue publicada correctamente.",

  retired:
    "El recurso fue retirado del inventario activo.",
};


const ERROR_MESSAGES:
  Readonly<
    Record<
      string,
      string
    >
  > = {
  configuration:
    "La infraestructura administrativa de Supabase todavía no está configurada.",

  "invalid-slot":
    "El tipo de recurso seleccionado no es válido.",

  "missing-file":
    "Selecciona un archivo antes de continuar.",

  "file-too-large":
    "El archivo supera el tamaño máximo permitido de 4 MB.",

  "invalid-file":
    "El archivo recibido no es válido.",

  "unsupported-file":
    "El formato del archivo no está permitido para este recurso.",

  "mime-mismatch":
    "El contenido real del archivo no coincide con el tipo declarado.",

  "alt-too-long":
    "El texto alternativo supera el máximo permitido.",

  "storage-upload":
    "No fue posible almacenar el archivo. Verifica la configuración de Storage.",

  "asset-registration":
    "El archivo no pudo registrarse correctamente y la operación fue revertida.",

  "invalid-asset":
    "El recurso seleccionado no es válido.",

  publish:
    "No fue posible publicar este recurso.",

  retire:
    "No fue posible retirar este recurso. Un recurso publicado no puede retirarse directamente.",
};


/* ============================================================
   UNKNOWN OBJECT HELPERS
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
  record:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): string | null {
  const value =
    record[
      key
    ];

  return typeof value ===
    "string"
    ? value
    : null;
}


function readNullableString(
  record:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): string | null {
  const value =
    record[
      key
    ];

  return typeof value ===
    "string"
    ? value
    : null;
}


function readNumber(
  record:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): number | null {
  const value =
    record[
      key
    ];

  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : null;
}


/* ============================================================
   SLOT VALIDATION
   ============================================================ */

function isBrandSlot(
  value:
    string,
): value is BrandSlot {
  return BRAND_SLOTS.some(
    (
      slot,
    ) =>
      slot === value,
  );
}


/* ============================================================
   NORMALIZE ASSET
   ============================================================ */

function normalizeBrandAsset(
  value:
    unknown,
  getPublicUrl:
    (
      objectPath:
        string,
    ) => string,
): BrandAsset | null {
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

  const rawSlot =
    readString(
      value,
      "slot",
    );

  const objectPath =
    readString(
      value,
      "object_path",
    );

  const originalName =
    readString(
      value,
      "original_name",
    );

  const mimeType =
    readString(
      value,
      "mime_type",
    );

  const sizeBytes =
    readNumber(
      value,
      "size_bytes",
    );

  const altText =
    readString(
      value,
      "alt_text",
    );

  const sha256 =
    readNullableString(
      value,
      "sha256",
    );

  const createdAt =
    readString(
      value,
      "created_at",
    );

  const retiredAt =
    readNullableString(
      value,
      "retired_at",
    );


  if (
    !id ||
    !rawSlot ||
    !isBrandSlot(
      rawSlot,
    ) ||
    !objectPath ||
    !originalName ||
    !mimeType ||
    sizeBytes ===
      null ||
    altText ===
      null ||
    !createdAt
  ) {
    return null;
  }


  return {
    id,

    slot:
      rawSlot,

    objectPath,

    originalName,

    mimeType,

    sizeBytes,

    altText,

    sha256,

    createdAt,

    retiredAt,

    publicUrl:
      getPublicUrl(
        objectPath,
      ),
  };
}


/* ============================================================
   NORMALIZE PUBLISHED
   ============================================================ */

function normalizePublishedAsset(
  value:
    unknown,
  getPublicUrl:
    (
      objectPath:
        string,
    ) => string,
): PublishedBrandAsset | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const rawSlot =
    readString(
      value,
      "slot",
    );

  const sourceAssetId =
    readString(
      value,
      "source_asset_id",
    );

  const objectPath =
    readString(
      value,
      "object_path",
    );

  const mimeType =
    readString(
      value,
      "mime_type",
    );

  const altText =
    readString(
      value,
      "alt_text",
    );

  const publishedAt =
    readString(
      value,
      "published_at",
    );


  if (
    !rawSlot ||
    !isBrandSlot(
      rawSlot,
    ) ||
    !sourceAssetId ||
    !objectPath ||
    !mimeType ||
    altText ===
      null ||
    !publishedAt
  ) {
    return null;
  }


  return {
    slot:
      rawSlot,

    sourceAssetId,

    objectPath,

    mimeType,

    altText,

    publishedAt,

    publicUrl:
      getPublicUrl(
        objectPath,
      ),
  };
}


/* ============================================================
   LOAD DATA
   ============================================================ */

async function loadBrandAdminData():
  Promise<BrandAdminData> {
  const supabaseAdmin =
    createSupabaseAdminClient();


  if (
    !supabaseAdmin
  ) {
    return {
      status:
        "not-configured",

      assets:
        [],

      published:
        [],
    };
  }


  const [
    assetsResult,
    publishedResult,
  ] =
    await Promise.all([
      supabaseAdmin
        .from(
          "web_brand_assets",
        )
        .select(
          [
            "id",
            "slot",
            "object_path",
            "original_name",
            "mime_type",
            "size_bytes",
            "alt_text",
            "sha256",
            "created_at",
            "retired_at",
          ].join(
            ",",
          ),
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(
          80,
        ),

      supabaseAdmin
        .from(
          "web_brand_published",
        )
        .select(
          [
            "slot",
            "source_asset_id",
            "object_path",
            "mime_type",
            "alt_text",
            "published_at",
          ].join(
            ",",
          ),
        )
        .order(
          "published_at",
          {
            ascending:
              false,
          },
        ),
    ]);


  if (
    assetsResult.error ||
    publishedResult.error
  ) {
    return {
      status:
        "unavailable",

      assets:
        [],

      published:
        [],
    };
  }


  const getPublicUrl =
    (
      objectPath:
        string,
    ): string => {
      const {
        data,
      } =
        supabaseAdmin
          .storage
          .from(
            BRAND_BUCKET,
          )
          .getPublicUrl(
            objectPath,
          );

      return data.publicUrl;
    };


  const assets =
    (
      Array.isArray(
        assetsResult.data,
      )
        ? assetsResult.data
        : []
    )
      .map(
        (
          value,
        ) =>
          normalizeBrandAsset(
            value,
            getPublicUrl,
          ),
      )
      .filter(
        (
          asset,
        ): asset is BrandAsset =>
          asset !==
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
        (
          value,
        ) =>
          normalizePublishedAsset(
            value,
            getPublicUrl,
          ),
      )
      .filter(
        (
          asset,
        ): asset is PublishedBrandAsset =>
          asset !==
          null,
      );


  return {
    status:
      "ready",

    assets,

    published,
  };
}


/* ============================================================
   FORMATTERS
   ============================================================ */

function formatBytes(
  value:
    number,
): string {
  if (
    value <
      1024
  ) {
    return `${value} B`;
  }

  if (
    value <
      1024 * 1024
  ) {
    return `${(
      value /
      1024
    ).toFixed(
      1,
    )} KB`;
  }

  return `${(
    value /
    (
      1024 *
      1024
    )
  ).toFixed(
    2,
  )} MB`;
}


function formatDate(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",

      timeZone:
        "Europe/Warsaw",
    },
  ).format(
    date,
  );
}


/* ============================================================
   SEARCH PARAM
   ============================================================ */

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
    const first =
      value[
        0
      ];

    return typeof first ===
      "string"
      ? first
      : null;
  }

  return null;
}


/* ============================================================
   PAGE
   ============================================================ */

export default async function BrandAdminPage({
  searchParams,
}: BrandPageProps) {
  const admin =
    await requireAdminIdentity();

  const resolvedSearchParams =
    await searchParams;

const successKey =
  getFirstSearchParam(
    resolvedSearchParams[
      "success"
    ],
  );

const errorKey =
  getFirstSearchParam(
    resolvedSearchParams[
      "error"
    ],
  );

  const successMessage =
    successKey
      ? SUCCESS_MESSAGES[
          successKey
        ] ??
        null
      : null;

  const errorMessage =
    errorKey
      ? ERROR_MESSAGES[
          errorKey
        ] ??
        "La operación no pudo completarse."
      : null;


  const brandData =
    await loadBrandAdminData();


  const infrastructureReady =
    brandData.status ===
      "ready";


  const publishedBySlot =
    new Map<
      BrandSlot,
      PublishedBrandAsset
    >(
      brandData.published
        .map(
          (
            asset,
          ) => [
            asset.slot,
            asset,
          ],
        ),
    );


  return (
    <main
      className="
        min-h-screen
        bg-[#f4f1eb]
        text-[#12100e]
      "
    >
      {/* ====================================================
          BRAND STRIPE
          ==================================================== */}

      <div
        className="
          grid
          h-2
          grid-cols-[2fr_1fr_1fr]
        "
        aria-hidden="true"
      >
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>


      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="
          border-b
          border-white/10
          bg-[#12100e]
          text-white
        "
      >
        <div
          className="
            site-container
            flex
            min-h-20
            flex-wrap
            items-center
            justify-between
            gap-4
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <Link
              href="/admin"
              className="
                grid
                size-11
                place-items-center
                rounded-2xl
                bg-[#f7c600]
                text-sm
                font-black
                text-[#12100e]
              "
              aria-label="Volver al administrador"
            >
              RC
            </Link>

            <div>
              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.14em]
                  text-[#f7c600]
                  uppercase
                "
              >
                Rincón Admin
              </p>

              <p
                className="
                  font-serif
                  text-lg
                  font-bold
                "
              >
                Marca e identidad
              </p>
            </div>
          </div>


          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                hidden
                max-w-56
                truncate
                text-xs
                text-white/50
                sm:block
              "
              title={
                admin.email
              }
            >
              {admin.email}
            </span>

            <Link
              href="/admin"
              className="
                rounded-full
                border
                border-white/15
                px-4
                py-2
                text-xs
                font-bold
                text-white/80
                transition
                hover:bg-white/10
              "
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>


      {/* ====================================================
          CONTENT
          ==================================================== */}

      <div
        className="
          site-container
          py-8
          sm:py-12
        "
      >
        {/* ==================================================
            HERO
            ================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-[#123d73]
            p-7
            text-white
            shadow-xl
            sm:p-10
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              size-80
              rounded-full
              bg-[#f7c600]/20
              blur-3xl
            "
            aria-hidden="true"
          />

          <div
            className="
              relative
              max-w-4xl
            "
          >
            <p
              className="
                text-xs
                font-black
                tracking-[0.16em]
                text-[#f7c600]
                uppercase
              "
            >
              Identidad de marca
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-3xl
                font-bold
                tracking-[-0.03em]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Centro de identidad visual
            </h1>

            <p
              className="
                mt-4
                max-w-3xl
                text-base
                leading-7
                text-white/70
              "
            >
              Administra los recursos oficiales de
              Rincón Colombiano sin modificar el código.
              Los archivos cargados permanecen separados
              de los recursos publicados hasta que un
              administrador confirme la publicación.
            </p>
          </div>
        </section>


        {/* ==================================================
            FEEDBACK
            ================================================== */}

        {
          successMessage
            ? (
                <div
                  role="status"
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-emerald-700/15
                    bg-emerald-50
                    px-5
                    py-4
                    text-sm
                    font-bold
                    text-emerald-900
                  "
                >
                  {successMessage}
                </div>
              )
            : null
        }


        {
          errorMessage
            ? (
                <div
                  role="alert"
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-[#c92d39]/20
                    bg-[#c92d39]/5
                    px-5
                    py-4
                    text-sm
                    font-bold
                    text-[#8d2029]
                  "
                >
                  {errorMessage}
                </div>
              )
            : null
        }


        {/* ==================================================
            INFRASTRUCTURE
            ================================================== */}

        {
          brandData.status !==
            "ready"
            ? (
                <section
                  className="
                    mt-6
                    rounded-[1.5rem]
                    border
                    border-amber-300
                    bg-amber-50
                    p-6
                  "
                >
                  <p
                    className="
                      text-xs
                      font-black
                      tracking-[0.12em]
                      text-amber-800
                      uppercase
                    "
                  >
                    Infraestructura pendiente
                  </p>

                  <h2
                    className="
                      mt-2
                      font-serif
                      text-xl
                      font-bold
                    "
                  >
                    El administrador está protegido,
                    pero Storage todavía no está disponible.
                  </h2>

                  <p
                    className="
                      mt-3
                      max-w-3xl
                      text-sm
                      leading-6
                      text-amber-950/70
                    "
                  >
                    Comprueba que las migraciones de marca
                    estén aplicadas físicamente en Supabase
                    y que Vercel tenga configurada la variable
                    privada SUPABASE_SERVICE_ROLE_KEY.
                    La interfaz permanece bloqueada hasta
                    que la infraestructura responda
                    correctamente.
                  </p>
                </section>
              )
            : null
        }


        {/* ==================================================
            CURRENT PUBLISHED BRAND
            ================================================== */}

        <section
          className="
            mt-10
          "
          aria-labelledby="published-brand-title"
        >
          <div>
            <p
              className="
                text-xs
                font-black
                tracking-[0.15em]
                text-[#756b61]
                uppercase
              "
            >
              Producción
            </p>

            <h2
              id="published-brand-title"
              className="
                mt-2
                font-serif
                text-3xl
                font-bold
              "
            >
              Identidad publicada
            </h2>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-[#62594f]
              "
            >
              Estos son los recursos que actualmente
              representan la identidad pública de
              Rincón Colombiano.
            </p>
          </div>


          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {
              BRAND_SLOTS.map(
                (
                  slot,
                ) => {
                  const published =
                    publishedBySlot.get(
                      slot,
                    );

                  return (
                    <article
                      key={
                        slot
                      }
                      className="
                        overflow-hidden
                        rounded-[1.5rem]
                        border
                        border-black/5
                        bg-white
                        shadow-sm
                      "
                    >
                      {
                        published
                          ? (
                              <div
                                role="img"
                                aria-label={
                                  published.altText ||
                                  SLOT_LABELS[
                                    slot
                                  ].title
                                }
                                className="
                                  h-44
                                  border-b
                                  border-black/5
                                  bg-[#faf9f6]
                                  bg-contain
                                  bg-center
                                  bg-no-repeat
                                "
                                style={{
                                  backgroundImage:
                                    `url("${published.publicUrl}")`,
                                }}
                              />
                            )
                          : (
                              <div
                                className="
                                  grid
                                  h-44
                                  place-items-center
                                  border-b
                                  border-black/5
                                  bg-[#faf9f6]
                                "
                              >
                                <span
                                  className="
                                    text-xs
                                    font-black
                                    tracking-[0.1em]
                                    text-[#a1988e]
                                    uppercase
                                  "
                                >
                                  Sin publicar
                                </span>
                              </div>
                            )
                      }

                      <div className="p-5">
                        <p
                          className="
                            text-[0.65rem]
                            font-black
                            tracking-[0.12em]
                            text-[#123d73]
                            uppercase
                          "
                        >
                          {
                            SLOT_LABELS[
                              slot
                            ].title
                          }
                        </p>

                        {
                          published
                            ? (
                                <>
                                  <p
                                    className="
                                      mt-3
                                      text-sm
                                      font-bold
                                      text-emerald-700
                                    "
                                  >
                                    Publicado
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      text-[#756b61]
                                    "
                                  >
                                    {
                                      formatDate(
                                        published
                                          .publishedAt,
                                      )
                                    }
                                  </p>

                                  <a
                                    href={
                                      published
                                        .publicUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                      mt-4
                                      inline-flex
                                      text-xs
                                      font-bold
                                      text-[#123d73]
                                      hover:underline
                                    "
                                  >
                                    Ver archivo →
                                  </a>
                                </>
                              )
                            : (
                                <p
                                  className="
                                    mt-3
                                    text-sm
                                    text-[#756b61]
                                  "
                                >
                                  Todavía no existe un
                                  recurso publicado para
                                  este espacio.
                                </p>
                              )
                        }
                      </div>
                    </article>
                  );
                },
              )
            }
          </div>
        </section>


        {/* ==================================================
            UPLOAD
            ================================================== */}

        <section
          className="
            mt-12
            overflow-hidden
            rounded-[2rem]
            border
            border-black/5
            bg-white
            shadow-sm
          "
          aria-labelledby="upload-brand-title"
        >
          <div
            className="
              border-b
              border-black/5
              bg-[#f7c600]
              p-6
              sm:p-8
            "
          >
            <p
              className="
                text-xs
                font-black
                tracking-[0.15em]
                uppercase
              "
            >
              Nuevo recurso
            </p>

            <h2
              id="upload-brand-title"
              className="
                mt-2
                font-serif
                text-3xl
                font-bold
              "
            >
              Subir identidad visual
            </h2>

            <p
              className="
                mt-3
                max-w-3xl
                text-sm
                leading-6
                text-[#4b4238]
              "
            >
              Subir un archivo no lo publica
              automáticamente. Primero queda registrado
              en el inventario para revisión.
            </p>
          </div>


          <form
            action={
              uploadBrandAsset
            }
            className="
              p-6
              sm:p-8
            "
          >
            <fieldset
              disabled={
                !infrastructureReady
              }
              className="
                grid
                gap-6
                disabled:opacity-50
                lg:grid-cols-2
              "
            >
              {/* SLOT */}

              <div>
                <label
                  htmlFor="brand-slot"
                  className="
                    block
                    text-sm
                    font-black
                  "
                >
                  Tipo de recurso
                </label>

                <select
                  id="brand-slot"
                  name="slot"
                  required
                  defaultValue="logo_primary"
                  className="
                    mt-2
                    min-h-12
                    w-full
                    rounded-2xl
                    border
                    border-[#d8d0c5]
                    bg-[#faf9f6]
                    px-4
                    text-sm
                    font-bold
                    outline-none
                    focus:border-[#123d73]
                    focus:ring-2
                    focus:ring-[#123d73]/15
                  "
                >
                  {
                    BRAND_SLOTS.map(
                      (
                        slot,
                      ) => (
                        <option
                          key={
                            slot
                          }
                          value={
                            slot
                          }
                        >
                          {
                            SLOT_LABELS[
                              slot
                            ].title
                          }
                        </option>
                      ),
                    )
                  }
                </select>
              </div>


              {/* FILE */}

              <div>
                <label
                  htmlFor="brand-file"
                  className="
                    block
                    text-sm
                    font-black
                  "
                >
                  Archivo
                </label>

                <input
                  id="brand-file"
                  name="file"
                  type="file"
                  required
                  accept="
                    image/png,
                    image/jpeg,
                    image/webp,
                    image/avif,
                    image/x-icon,
                    image/vnd.microsoft.icon
                  "
                  className="
                    mt-2
                    block
                    min-h-12
                    w-full
                    cursor-pointer
                    rounded-2xl
                    border
                    border-[#d8d0c5]
                    bg-[#faf9f6]
                    px-4
                    py-3
                    text-sm
                    file:mr-4
                    file:rounded-full
                    file:border-0
                    file:bg-[#123d73]
                    file:px-4
                    file:py-2
                    file:text-xs
                    file:font-black
                    file:text-white
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[#756b61]
                  "
                >
                  PNG, JPG, WebP o AVIF.
                  Favicon: PNG o ICO.
                  Máximo 4 MB.
                </p>
              </div>


              {/* ALT TEXT */}

              <div className="lg:col-span-2">
                <label
                  htmlFor="brand-alt-text"
                  className="
                    block
                    text-sm
                    font-black
                  "
                >
                  Texto alternativo
                </label>

                <input
                  id="brand-alt-text"
                  name="altText"
                  type="text"
                  maxLength={300}
                  placeholder="Logo oficial de Rincón Colombiano"
                  className="
                    mt-2
                    min-h-12
                    w-full
                    rounded-2xl
                    border
                    border-[#d8d0c5]
                    bg-[#faf9f6]
                    px-4
                    text-sm
                    outline-none
                    placeholder:text-[#a1988e]
                    focus:border-[#123d73]
                    focus:ring-2
                    focus:ring-[#123d73]/15
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[#756b61]
                  "
                >
                  Si se deja vacío, el sistema
                  utilizará un texto seguro por defecto.
                </p>
              </div>


              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#123d73]
                    px-7
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    transition
                    hover:-translate-y-0.5
                    hover:bg-[#0e315d]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Subir recurso
                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    ↑
                  </span>
                </button>
              </div>
            </fieldset>
          </form>
        </section>


        {/* ==================================================
            ASSET INVENTORY
            ================================================== */}

        <section
          className="
            mt-12
          "
          aria-labelledby="brand-assets-title"
        >
          <div>
            <p
              className="
                text-xs
                font-black
                tracking-[0.15em]
                text-[#756b61]
                uppercase
              "
            >
              Historial
            </p>

            <h2
              id="brand-assets-title"
              className="
                mt-2
                font-serif
                text-3xl
                font-bold
              "
            >
              Recursos cargados
            </h2>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-[#62594f]
              "
            >
              Los archivos permanecen en historial para
              permitir control, comparación y futuras
              operaciones de recuperación.
            </p>
          </div>


          {
            infrastructureReady &&
            brandData.assets.length ===
              0
              ? (
                  <div
                    className="
                      mt-6
                      rounded-[1.5rem]
                      border
                      border-dashed
                      border-[#cfc6ba]
                      bg-white
                      p-8
                      text-center
                    "
                  >
                    <p
                      className="
                        font-serif
                        text-xl
                        font-bold
                      "
                    >
                      Todavía no hay recursos cargados
                    </p>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-[#756b61]
                      "
                    >
                      El primer archivo puede ser el
                      logo oficial de Rincón Colombiano.
                    </p>
                  </div>
                )
              : null
          }


          <div
            className="
              mt-6
              grid
              gap-5
              lg:grid-cols-2
            "
          >
            {
              brandData.assets.map(
                (
                  asset,
                ) => {
                  const published =
                    publishedBySlot.get(
                      asset.slot,
                    );

                  const isPublished =
                    published
                      ?.sourceAssetId ===
                    asset.id;

                  const isRetired =
                    asset.retiredAt !==
                    null;


                  return (
                    <article
                      key={
                        asset.id
                      }
                      className="
                        overflow-hidden
                        rounded-[1.5rem]
                        border
                        border-black/5
                        bg-white
                        shadow-sm
                      "
                    >
                      {/* PREVIEW */}

                      <div
                        role="img"
                        aria-label={
                          asset.altText ||
                          SLOT_LABELS[
                            asset.slot
                          ].title
                        }
                        className="
                          h-60
                          border-b
                          border-black/5
                          bg-[#faf9f6]
                          bg-contain
                          bg-center
                          bg-no-repeat
                        "
                        style={{
                          backgroundImage:
                            `url("${asset.publicUrl}")`,
                        }}
                      />


                      {/* CONTENT */}

                      <div className="p-6">
                        <div
                          className="
                            flex
                            flex-wrap
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <div>
                            <p
                              className="
                                text-[0.65rem]
                                font-black
                                tracking-[0.12em]
                                text-[#123d73]
                                uppercase
                              "
                            >
                              {
                                SLOT_LABELS[
                                  asset.slot
                                ].title
                              }
                            </p>

                            <h3
                              className="
                                mt-1
                                break-all
                                font-serif
                                text-xl
                                font-bold
                              "
                            >
                              {asset.originalName}
                            </h3>
                          </div>


                          {
                            isPublished
                              ? (
                                  <span
                                    className="
                                      rounded-full
                                      bg-emerald-100
                                      px-3
                                      py-1.5
                                      text-[0.65rem]
                                      font-black
                                      text-emerald-900
                                      uppercase
                                    "
                                  >
                                    Publicado
                                  </span>
                                )
                              : isRetired
                                ? (
                                    <span
                                      className="
                                        rounded-full
                                        bg-[#12100e]/10
                                        px-3
                                        py-1.5
                                        text-[0.65rem]
                                        font-black
                                        text-[#62594f]
                                        uppercase
                                      "
                                    >
                                      Retirado
                                    </span>
                                  )
                                : (
                                    <span
                                      className="
                                        rounded-full
                                        bg-[#f7c600]
                                        px-3
                                        py-1.5
                                        text-[0.65rem]
                                        font-black
                                        text-[#12100e]
                                        uppercase
                                      "
                                    >
                                      Borrador
                                    </span>
                                  )
                          }
                        </div>


                        {/* METADATA */}

                        <dl
                          className="
                            mt-5
                            grid
                            gap-3
                            text-xs
                            sm:grid-cols-2
                          "
                        >
                          <div>
                            <dt
                              className="
                                font-black
                                text-[#756b61]
                              "
                            >
                              Formato
                            </dt>

                            <dd className="mt-1">
                              {asset.mimeType}
                            </dd>
                          </div>

                          <div>
                            <dt
                              className="
                                font-black
                                text-[#756b61]
                              "
                            >
                              Tamaño
                            </dt>

                            <dd className="mt-1">
                              {
                                formatBytes(
                                  asset.sizeBytes,
                                )
                              }
                            </dd>
                          </div>

                          <div>
                            <dt
                              className="
                                font-black
                                text-[#756b61]
                              "
                            >
                              Cargado
                            </dt>

                            <dd className="mt-1">
                              {
                                formatDate(
                                  asset.createdAt,
                                )
                              }
                            </dd>
                          </div>

                          <div>
                            <dt
                              className="
                                font-black
                                text-[#756b61]
                              "
                            >
                              Integridad
                            </dt>

                            <dd
                              className="
                                mt-1
                                font-mono
                              "
                              title={
                                asset.sha256 ??
                                undefined
                              }
                            >
                              {
                                asset.sha256
                                  ? `${asset.sha256.slice(
                                      0,
                                      12,
                                    )}…`
                                  : "—"
                              }
                            </dd>
                          </div>
                        </dl>


                        {/* ALT TEXT */}

                        <div
                          className="
                            mt-5
                            rounded-2xl
                            bg-[#f4f1eb]
                            px-4
                            py-3
                          "
                        >
                          <p
                            className="
                              text-[0.65rem]
                              font-black
                              tracking-[0.1em]
                              text-[#756b61]
                              uppercase
                            "
                          >
                            Texto alternativo
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              leading-6
                            "
                          >
                            {
                              asset.altText ||
                              "Sin texto alternativo"
                            }
                          </p>
                        </div>


                        {/* ACTIONS */}

                        <div
                          className="
                            mt-6
                            flex
                            flex-wrap
                            gap-3
                          "
                        >
                          <a
                            href={
                              asset.publicUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              inline-flex
                              min-h-10
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-[#d8d0c5]
                              px-4
                              text-xs
                              font-bold
                              text-[#123d73]
                            "
                          >
                            Ver archivo
                          </a>


                          {
                            !isPublished &&
                            !isRetired
                              ? (
                                  <form
                                    action={
                                      publishBrandAsset
                                    }
                                  >
                                    <input
                                      type="hidden"
                                      name="assetId"
                                      value={
                                        asset.id
                                      }
                                    />

                                    <button
                                      type="submit"
                                      className="
                                        inline-flex
                                        min-h-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#123d73]
                                        px-4
                                        text-xs
                                        font-black
                                        text-white
                                        transition
                                        hover:bg-[#0e315d]
                                      "
                                    >
                                      Publicar
                                    </button>
                                  </form>
                                )
                              : null
                          }


                          {
                            !isPublished &&
                            !isRetired
                              ? (
                                  <form
                                    action={
                                      retireBrandAsset
                                    }
                                  >
                                    <input
                                      type="hidden"
                                      name="assetId"
                                      value={
                                        asset.id
                                      }
                                    />

                                    <button
                                      type="submit"
                                      className="
                                        inline-flex
                                        min-h-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-[#c92d39]/20
                                        px-4
                                        text-xs
                                        font-black
                                        text-[#a32631]
                                        transition
                                        hover:bg-[#c92d39]/5
                                      "
                                    >
                                      Retirar
                                    </button>
                                  </form>
                                )
                              : null
                          }
                        </div>
                      </div>
                    </article>
                  );
                },
              )
            }
          </div>
        </section>


        {/* ==================================================
            SECURITY MODEL
            ================================================== */}

        <section
          className="
            mt-12
            rounded-[2rem]
            bg-[#12100e]
            p-7
            text-white
            sm:p-9
          "
        >
          <p
            className="
              text-xs
              font-black
              tracking-[0.15em]
              text-[#f7c600]
              uppercase
            "
          >
            Seguridad de marca
          </p>

          <h2
            className="
              mt-3
              font-serif
              text-2xl
              font-bold
            "
          >
            La identidad pública no depende del navegador
          </h2>

          <p
            className="
              mt-3
              max-w-4xl
              text-sm
              leading-6
              text-white/65
            "
          >
            Las operaciones administrativas pasan por
            autenticación, autorización de servidor,
            validación binaria del archivo, Storage,
            registro transaccional y auditoría. La clave
            service_role permanece exclusivamente en el
            servidor.
          </p>


          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {
              [
                "Auth verificada",
                "Firma binaria",
                "SHA-256",
                "Auditoría",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-white/80
                      "
                    >
                      {item}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        font-black
                        text-emerald-300
                      "
                    >
                      Protegido
                    </p>
                  </div>
                ),
              )
            }
          </div>
        </section>


        {/* ==================================================
            FOOTER
            ================================================== */}

        <footer
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            border-black/10
            pt-6
            text-xs
            text-[#756b61]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            Rincón Colombiano • Administración de marca
          </span>

          <div
            className="
              flex
              gap-4
            "
          >
            <Link
              href="/admin"
              className="
                font-bold
                text-[#123d73]
                hover:underline
              "
            >
              Dashboard
            </Link>

            <Link
              href="/pl"
              className="
                font-bold
                text-[#123d73]
                hover:underline
              "
            >
              Ver web pública →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
