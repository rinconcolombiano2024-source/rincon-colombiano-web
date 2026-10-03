import "server-only";

import {
  getSupabasePublicConfig,
} from "@/lib/supabase/config";


/* ============================================================
   CONSTANTS
   ============================================================ */

const BRAND_BUCKET =
  "web-brand-assets";

const BRAND_CACHE_SECONDS =
  300;

const BRAND_FETCH_TIMEOUT_MS =
  5_000;


/* ============================================================
   BRAND SLOTS
   ============================================================ */

export const BRAND_SLOTS = [
  "logo_primary",
  "logo_compact",
  "logo_light",
  "logo_dark",
  "favicon",
  "open_graph",
  "social_square",
] as const;


export type BrandSlot =
  (typeof BRAND_SLOTS)[number];


/* ============================================================
   MIME TYPES
   ============================================================ */

const BRAND_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
] as const;


export type BrandMimeType =
  (typeof BRAND_MIME_TYPES)[number];


/* ============================================================
   PUBLIC ASSET
   ============================================================ */

export interface PublishedBrandAsset {
  readonly slot:
    BrandSlot;

  readonly sourceAssetId:
    string;

  readonly objectPath:
    string;

  readonly mimeType:
    BrandMimeType;

  readonly altText:
    string;

  readonly publishedAt:
    string;

  readonly publicUrl:
    string;
}


/* ============================================================
   LOAD STATUS
   ============================================================ */

export type PublishedBrandAssetStatus =
  | "ready"
  | "not-configured"
  | "not-found"
  | "unavailable";


export interface PublishedBrandAssetResult {
  readonly status:
    PublishedBrandAssetStatus;

  readonly asset:
    PublishedBrandAsset | null;
}


/* ============================================================
   INTERNAL JSON
   ============================================================ */

interface BrandPublishedRow {
  readonly slot:
    unknown;

  readonly source_asset_id:
    unknown;

  readonly object_path:
    unknown;

  readonly mime_type:
    unknown;

  readonly alt_text:
    unknown;

  readonly published_at:
    unknown;
}


/* ============================================================
   TYPE GUARDS
   ============================================================ */

function isBrandSlot(
  value:
    unknown,
): value is BrandSlot {
  return (
    typeof value ===
      "string" &&
    BRAND_SLOTS.some(
      (
        slot,
      ) =>
        slot === value,
    )
  );
}


function isBrandMimeType(
  value:
    unknown,
): value is BrandMimeType {
  return (
    typeof value ===
      "string" &&
    BRAND_MIME_TYPES.some(
      (
        mimeType,
      ) =>
        mimeType === value,
    )
  );
}


function isNonEmptyString(
  value:
    unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}


function isBrandPublishedRow(
  value:
    unknown,
): value is BrandPublishedRow {
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


/* ============================================================
   SAFE OBJECT PATH
   ============================================================ */

/**
 * Storage genera las rutas internamente desde el servidor,
 * pero seguimos validándolas antes de convertirlas en una URL
 * pública.
 *
 * No aceptamos:
 *
 * - rutas absolutas;
 * - backslashes;
 * - traversal "..";
 * - segmentos vacíos;
 * - caracteres de control.
 */
function normalizeObjectPath(
  value:
    string,
): string | null {
  const normalized =
    value
      .trim()
      .replace(
        /^\/+/,
        "",
      );


  if (
    normalized.length ===
      0 ||
    normalized.length >
      500 ||
    normalized.includes(
      "\\",
    ) ||
    /[\u0000-\u001f\u007f]/.test(
      normalized,
    )
  ) {
    return null;
  }


  const segments =
    normalized.split(
      "/",
    );


  if (
    segments.some(
      (
        segment,
      ) =>
        segment.length ===
          0 ||
        segment ===
          "." ||
        segment ===
          "..",
    )
  ) {
    return null;
  }


  return segments.join(
    "/",
  );
}


/* ============================================================
   STORAGE PUBLIC URL
   ============================================================ */

function buildBrandPublicUrl(
  supabaseUrl:
    string,
  objectPath:
    string,
): string | null {
  const normalizedPath =
    normalizeObjectPath(
      objectPath,
    );


  if (
    !normalizedPath
  ) {
    return null;
  }


  try {
    const baseUrl =
      new URL(
        supabaseUrl,
      );


    const encodedPath =
      normalizedPath
        .split(
          "/",
        )
        .map(
          (
            segment,
          ) =>
            encodeURIComponent(
              segment,
            ),
        )
        .join(
          "/",
        );


    const publicUrl =
      new URL(
        `/storage/v1/object/public/${BRAND_BUCKET}/${encodedPath}`,
        baseUrl,
      );


    /*
     * Defensa adicional:
     *
     * el recurso público siempre debe permanecer dentro
     * del mismo origen de Supabase configurado.
     */
    if (
      publicUrl.origin !==
      baseUrl.origin
    ) {
      return null;
    }


    return publicUrl.toString();
  } catch {
    return null;
  }
}


/* ============================================================
   ROW NORMALIZATION
   ============================================================ */

function normalizePublishedBrandAsset(
  value:
    unknown,
  expectedSlot:
    BrandSlot,
  supabaseUrl:
    string,
): PublishedBrandAsset | null {
  if (
    !isBrandPublishedRow(
      value,
    )
  ) {
    return null;
  }


  const {
    slot,
    source_asset_id:
      sourceAssetId,
    object_path:
      objectPath,
    mime_type:
      mimeType,
    alt_text:
      altText,
    published_at:
      publishedAt,
  } =
    value;


  if (
    !isBrandSlot(
      slot,
    ) ||
    slot !==
      expectedSlot ||
    !isNonEmptyString(
      sourceAssetId,
    ) ||
    !isNonEmptyString(
      objectPath,
    ) ||
    !isBrandMimeType(
      mimeType,
    ) ||
    typeof altText !==
      "string" ||
    !isNonEmptyString(
      publishedAt,
    )
  ) {
    return null;
  }


  const publicUrl =
    buildBrandPublicUrl(
      supabaseUrl,
      objectPath,
    );


  if (
    !publicUrl
  ) {
    return null;
  }


  return {
    slot,

    sourceAssetId:
      sourceAssetId.trim(),

    objectPath:
      objectPath.trim(),

    mimeType,

    altText:
      altText
        .trim()
        .slice(
          0,
          300,
        ),

    publishedAt:
      publishedAt.trim(),

    publicUrl,
  };
}


/* ============================================================
   FETCH
   ============================================================ */

async function fetchPublishedBrandAsset(
  slot:
    BrandSlot,
): Promise<PublishedBrandAssetResult> {
  const config =
    getSupabasePublicConfig();


  if (
    !config
  ) {
    return {
      status:
        "not-configured",

      asset:
        null,
    };
  }


  let requestUrl:
    URL;


  try {
    requestUrl =
      new URL(
        "/rest/v1/web_brand_published",
        config.url,
      );
  } catch {
    return {
      status:
        "not-configured",

      asset:
        null,
    };
  }


  requestUrl.searchParams.set(
    "select",
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
  );

  requestUrl.searchParams.set(
    "slot",
    `eq.${slot}`,
  );

  requestUrl.searchParams.set(
    "limit",
    "1",
  );


  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      BRAND_FETCH_TIMEOUT_MS,
    );


  try {
    const response =
      await fetch(
        requestUrl,
        {
          method:
            "GET",

          headers: {
            apikey:
              config.key,

            Authorization:
              `Bearer ${config.key}`,

            Accept:
              "application/json",
          },

          signal:
            controller.signal,

          next: {
            revalidate:
              BRAND_CACHE_SECONDS,

            tags: [
              "web-brand",
              `web-brand:${slot}`,
            ],
          },
        },
      );


    if (
      !response.ok
    ) {
      return {
        status:
          "unavailable",

        asset:
          null,
      };
    }


    let data:
      unknown;


    try {
      data =
        await response.json();
    } catch {
      return {
        status:
          "unavailable",

        asset:
          null,
      };
    }


    if (
      !Array.isArray(
        data,
      ) ||
      data.length ===
        0
    ) {
      return {
        status:
          "not-found",

        asset:
          null,
      };
    }


    const asset =
      normalizePublishedBrandAsset(
        data[
          0
        ],
        slot,
        config.url,
      );


    if (
      !asset
    ) {
      return {
        status:
          "unavailable",

        asset:
          null,
      };
    }


    return {
      status:
        "ready",

      asset,
    };
  } catch {
    /*
     * La identidad visual jamás debe tumbar la web.
     *
     * Si Supabase tiene una incidencia temporal:
     *
     * - la página continúa cargando;
     * - el componente visual utiliza su fallback;
     * - no exponemos información interna al cliente.
     */
    return {
      status:
        "unavailable",

      asset:
        null,
    };
  } finally {
    clearTimeout(
      timeout,
    );
  }
}


/* ============================================================
   PUBLIC API
   ============================================================ */

/**
 * Devuelve estado + asset.
 *
 * Útil para interfaces que necesitan diferenciar entre:
 *
 * ready
 * not-found
 * unavailable
 * not-configured
 */
export async function loadPublishedBrandAsset(
  slot:
    BrandSlot,
): Promise<PublishedBrandAssetResult> {
  return fetchPublishedBrandAsset(
    slot,
  );
}


/**
 * Atajo seguro para componentes públicos.
 *
 * Nunca lanza hacia la página.
 *
 * Si no existe logo o hay una interrupción temporal,
 * devuelve null para permitir un fallback visual.
 */
export async function getPublishedBrandAsset(
  slot:
    BrandSlot,
): Promise<PublishedBrandAsset | null> {
  const result =
    await loadPublishedBrandAsset(
      slot,
    );


  return result.asset;
}


/* ============================================================
   COMMON BRAND ACCESSORS
   ============================================================ */

export async function getPrimaryBrandLogo():
  Promise<PublishedBrandAsset | null> {
  return getPublishedBrandAsset(
    "logo_primary",
  );
}


export async function getBrandFavicon():
  Promise<PublishedBrandAsset | null> {
  return getPublishedBrandAsset(
    "favicon",
  );
}


export async function getBrandOpenGraphImage():
  Promise<PublishedBrandAsset | null> {
  return getPublishedBrandAsset(
    "open_graph",
  );
}
