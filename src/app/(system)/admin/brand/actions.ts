"use server";

import {
  createHash,
  randomUUID,
} from "node:crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  requireAdminIdentity,
} from "@/lib/admin/auth";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";


/* ============================================================
   CONSTANTS
   ============================================================ */

const BRAND_BUCKET =
  "web-brand-assets";

/**
 * Aunque Storage permite hasta 8 MB, limitamos el formulario
 * administrativo inicialmente a 4 MB.
 *
 * Motivos:
 * - logos no deberían necesitar archivos gigantes;
 * - reduce abuso;
 * - reduce memoria;
 * - evita acercarnos a límites de plataforma.
 *
 * Para videos y multimedia construiremos posteriormente
 * uploads directos/resumibles especializados.
 */
const MAX_BRAND_FILE_BYTES =
  4 * 1024 * 1024;


const MAX_ALT_TEXT_LENGTH =
  300;


const MAX_ORIGINAL_NAME_LENGTH =
  255;


/* ============================================================
   BRAND SLOTS
   ============================================================ */

const BRAND_SLOTS = [
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


type BrandMimeType =
  (typeof BRAND_MIME_TYPES)[number];


/* ============================================================
   FORM HELPERS
   ============================================================ */

function readFormString(
  formData:
    FormData,
  field:
    string,
): string | null {
  const value =
    formData.get(
      field,
    );

  return typeof value ===
    "string"
    ? value
    : null;
}


function readFormFile(
  formData:
    FormData,
  field:
    string,
): File | null {
  const value =
    formData.get(
      field,
    );

  return value instanceof File
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
   FILE NAME
   ============================================================ */

function sanitizeOriginalFileName(
  value:
    string,
): string {
  return value
    .replace(
      /[\u0000-\u001f\u007f]/g,
      "",
    )
    .trim()
    .slice(
      0,
      MAX_ORIGINAL_NAME_LENGTH,
    );
}


/* ============================================================
   BYTE HELPERS
   ============================================================ */

function bytesEqual(
  bytes:
    Uint8Array,
  offset:
    number,
  expected:
    readonly number[],
): boolean {
  if (
    bytes.length <
    offset + expected.length
  ) {
    return false;
  }

  return expected.every(
    (
      expectedByte,
      index,
    ) =>
      bytes[
        offset + index
      ] === expectedByte,
  );
}


function asciiAt(
  bytes:
    Uint8Array,
  offset:
    number,
  text:
    string,
): boolean {
  if (
    bytes.length <
    offset + text.length
  ) {
    return false;
  }

  for (
    let index =
      0;
    index <
    text.length;
    index +=
      1
  ) {
    if (
      bytes[
        offset + index
      ] !==
      text.charCodeAt(
        index,
      )
    ) {
      return false;
    }
  }

  return true;
}


/* ============================================================
   REAL FILE SIGNATURE
   ============================================================ */

/**
 * Nunca confiamos únicamente en:
 *
 * file.type
 * file.name
 * extensión
 *
 * Comprobamos también la firma binaria del archivo.
 */
function detectImageMimeType(
  bytes:
    Uint8Array,
): BrandMimeType | null {
  /* PNG */
  if (
    bytesEqual(
      bytes,
      0,
      [
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ],
    )
  ) {
    return "image/png";
  }


  /* JPEG */
  if (
    bytesEqual(
      bytes,
      0,
      [
        0xff,
        0xd8,
        0xff,
      ],
    )
  ) {
    return "image/jpeg";
  }


  /* WEBP */
  if (
    asciiAt(
      bytes,
      0,
      "RIFF",
    ) &&
    asciiAt(
      bytes,
      8,
      "WEBP",
    )
  ) {
    return "image/webp";
  }


  /* ICO */
  if (
    bytesEqual(
      bytes,
      0,
      [
        0x00,
        0x00,
        0x01,
        0x00,
      ],
    )
  ) {
    return "image/x-icon";
  }


  /*
   * AVIF:
   *
   * ISO Base Media File Format.
   * Buscamos caja ftyp y marcas AVIF conocidas.
   */
  if (
    asciiAt(
      bytes,
      4,
      "ftyp",
    ) &&
    (
      asciiAt(
        bytes,
        8,
        "avif",
      ) ||
      asciiAt(
        bytes,
        8,
        "avis",
      )
    )
  ) {
    return "image/avif";
  }


  return null;
}


/* ============================================================
   MIME COMPATIBILITY
   ============================================================ */
function isMimeCompatible(
  declaredMime:
    string,
  detectedMime:
    BrandMimeType,
): boolean {
  /*
   * La firma binaria detectada por el servidor es la
   * fuente de verdad.
   *
   * El MIME enviado por navegador/SO solamente se usa
   * como comprobación adicional porque distintos clientes
   * pueden enviar aliases válidos:
   *
   * image/jpeg
   * image/jpg
   * image/pjpeg
   *
   * También algunos navegadores/sistemas pueden enviar
   * application/octet-stream o incluso ningún MIME.
   */

  const normalizedDeclaredMime =
    declaredMime
      .trim()
      .toLowerCase();


  /*
   * MIME genérico o ausente.
   *
   * No lo rechazamos porque el contenido ya fue validado
   * mediante firma binaria real.
   */
  if (
    normalizedDeclaredMime.length ===
      0 ||
    normalizedDeclaredMime ===
      "application/octet-stream"
  ) {
    return true;
  }


  /*
   * JPEG aliases.
   */
  if (
    detectedMime ===
      "image/jpeg"
  ) {
    return (
      normalizedDeclaredMime ===
        "image/jpeg" ||
      normalizedDeclaredMime ===
        "image/jpg" ||
      normalizedDeclaredMime ===
        "image/pjpeg"
    );
  }


  /*
   * PNG alias histórico.
   */
  if (
    detectedMime ===
      "image/png"
  ) {
    return (
      normalizedDeclaredMime ===
        "image/png" ||
      normalizedDeclaredMime ===
        "image/x-png"
    );
  }


  /*
   * ICO tiene dos MIME habituales.
   */
  if (
    detectedMime ===
      "image/x-icon"
  ) {
    return (
      normalizedDeclaredMime ===
        "image/x-icon" ||
      normalizedDeclaredMime ===
        "image/vnd.microsoft.icon"
    );
  }


  /*
   * WEBP / AVIF y demás formatos canónicos.
   */
  return (
    normalizedDeclaredMime ===
    detectedMime
  );
}
/* ============================================================
   EXTENSION
   ============================================================ */

function getExtensionForMime(
  mimeType:
    BrandMimeType,
): string {
  switch (
    mimeType
  ) {
    case "image/png":
      return "png";

    case "image/jpeg":
      return "jpg";

    case "image/webp":
      return "webp";

    case "image/avif":
      return "avif";

    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      return "ico";
  }
}


/* ============================================================
   SLOT / MIME RULES
   ============================================================ */

function isMimeAllowedForSlot(
  slot:
    BrandSlot,
  mimeType:
    BrandMimeType,
): boolean {
  if (
    slot ===
      "favicon"
  ) {
    return (
      mimeType ===
        "image/png" ||
      mimeType ===
        "image/x-icon" ||
      mimeType ===
        "image/vnd.microsoft.icon"
    );
  }

  return (
    mimeType !==
      "image/x-icon" &&
    mimeType !==
      "image/vnd.microsoft.icon"
  );
}


/* ============================================================
   DEFAULT ALT TEXT
   ============================================================ */

function getDefaultAltText(
  slot:
    BrandSlot,
): string {
  switch (
    slot
  ) {
    case "favicon":
      return "Rincón Colombiano";

    case "open_graph":
      return "Rincón Colombiano — Sabor y tradición";

    case "social_square":
      return "Rincón Colombiano";

    case "logo_primary":
    case "logo_compact":
    case "logo_light":
    case "logo_dark":
      return "Logo de Rincón Colombiano";
  }
}


/* ============================================================
   PUBLIC REVALIDATION
   ============================================================ */

function revalidateBrandSurfaces():
  void {
  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/brand",
  );

  revalidatePath(
    "/pl",
  );

  revalidatePath(
    "/es",
  );

  revalidatePath(
    "/en",
  );

  revalidatePath(
    "/pl/menu",
  );

  revalidatePath(
    "/es/menu",
  );

  revalidatePath(
    "/en/menu",
  );
}


/* ============================================================
   SAFE REDIRECT
   ============================================================ */

function redirectBrand(
  parameters:
    Readonly<
      Record<
        string,
        string
      >
    >,
): never {
  const searchParams =
    new URLSearchParams(
      parameters,
    );

  redirect(
    `/admin/brand?${searchParams.toString()}`,
  );
}


/* ============================================================
   UPLOAD BRAND ASSET
   ============================================================ */

/**
 * Flujo:
 *
 * 1. Verifica administrador.
 * 2. Valida FormData.
 * 3. Valida tamaño.
 * 4. Lee bytes.
 * 5. Verifica firma real.
 * 6. Calcula SHA-256.
 * 7. Genera path imposible de controlar por usuario.
 * 8. Sube Storage.
 * 9. Registra metadata vía RPC.
 * 10. Si DB falla, elimina Storage.
 *
 * El asset queda cargado pero NO publicado.
 */
export async function uploadBrandAsset(
  formData:
    FormData,
): Promise<void> {
  const adminIdentity =
    await requireAdminIdentity();


  /* ========================================================
     ADMIN CLIENT
     ======================================================== */

  const supabaseAdmin =
    createSupabaseAdminClient();

  if (
    !supabaseAdmin
  ) {
    redirectBrand({
      error:
        "configuration",
    });
  }


  /* ========================================================
     SLOT
     ======================================================== */

  const rawSlot =
    readFormString(
      formData,
      "slot",
    );

  if (
    !rawSlot ||
    !isBrandSlot(
      rawSlot,
    )
  ) {
    redirectBrand({
      error:
        "invalid-slot",
    });
  }

  const slot:
    BrandSlot =
    rawSlot;


  /* ========================================================
     FILE
     ======================================================== */

  const file =
    readFormFile(
      formData,
      "file",
    );

  if (
    !file ||
    file.size <
      1
  ) {
    redirectBrand({
      error:
        "missing-file",
    });
  }


  if (
    file.size >
      MAX_BRAND_FILE_BYTES
  ) {
    redirectBrand({
      error:
        "file-too-large",
    });
  }


  /* ========================================================
     ORIGINAL NAME
     ======================================================== */

  const originalName =
    sanitizeOriginalFileName(
      file.name,
    );

  if (
    originalName.length ===
      0
  ) {
    redirectBrand({
      error:
        "invalid-file",
    });
  }


  /* ========================================================
     BYTES
     ======================================================== */

  let arrayBuffer:
    ArrayBuffer;

  try {
    arrayBuffer =
      await file
        .arrayBuffer();
  } catch {
    redirectBrand({
      error:
        "invalid-file",
    });
  }


  const bytes =
    new Uint8Array(
      arrayBuffer,
    );


  if (
    bytes.byteLength !==
      file.size
  ) {
    redirectBrand({
      error:
        "invalid-file",
    });
  }


  /* ========================================================
     MIME SIGNATURE
     ======================================================== */

  const detectedMime =
    detectImageMimeType(
      bytes,
    );

  if (
    !detectedMime
  ) {
    redirectBrand({
      error:
        "unsupported-file",
    });
  }


  if (
    !isMimeCompatible(
      file.type,
      detectedMime,
    )
  ) {
    redirectBrand({
      error:
        "mime-mismatch",
    });
  }


  if (
    !isMimeAllowedForSlot(
      slot,
      detectedMime,
    )
  ) {
    redirectBrand({
      error:
        "unsupported-file",
    });
  }


  /* ========================================================
     ALT TEXT
     ======================================================== */

  const rawAltText =
    readFormString(
      formData,
      "altText",
    )
      ?.trim() ??
    "";


  if (
    rawAltText.length >
      MAX_ALT_TEXT_LENGTH
  ) {
    redirectBrand({
      error:
        "alt-too-long",
    });
  }


  const altText =
    rawAltText.length >
      0
      ? rawAltText
      : getDefaultAltText(
          slot,
        );


  /* ========================================================
     SHA-256
     ======================================================== */

  const sha256 =
    createHash(
      "sha256",
    )
      .update(
        bytes,
      )
      .digest(
        "hex",
      );


  /* ========================================================
     STORAGE PATH
     ======================================================== */

  const now =
    new Date();

  const year =
    String(
      now.getUTCFullYear(),
    );

  const month =
    String(
      now.getUTCMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const extension =
    getExtensionForMime(
      detectedMime,
    );

  const objectPath =
    [
      slot,
      year,
      month,
      `${randomUUID()}.${extension}`,
    ].join(
      "/",
    );


  /* ========================================================
     STORAGE UPLOAD
     ======================================================== */

  const {
    error:
      uploadError,
  } =
    await supabaseAdmin
      .storage
      .from(
        BRAND_BUCKET,
      )
      .upload(
        objectPath,
        arrayBuffer,
        {
          contentType:
            detectedMime,

          cacheControl:
            "31536000",

          upsert:
            false,
        },
      );


  if (
    uploadError
  ) {
    redirectBrand({
      error:
        "storage-upload",
    });
  }


  /* ========================================================
     DATABASE REGISTRATION
     ======================================================== */

  const {
    data:
      assetId,
    error:
      registerError,
  } =
    await supabaseAdmin
      .rpc(
        "web_brand_register_asset",
        {
          p_slot:
            slot,

          p_object_path:
            objectPath,

          p_original_name:
            originalName,

          p_mime_type:
            detectedMime,

          p_size_bytes:
            file.size,

          p_alt_text:
            altText,

          p_sha256:
            sha256,

          p_uploaded_by:
            adminIdentity.id,
        },
      );


  if (
    registerError ||
    typeof assetId !==
      "string"
  ) {
    /*
     * Compensating transaction:
     *
     * Si Storage funcionó pero PostgreSQL no registró
     * correctamente el asset, eliminamos inmediatamente
     * el objeto para evitar archivos huérfanos.
     */
    await supabaseAdmin
      .storage
      .from(
        BRAND_BUCKET,
      )
      .remove([
        objectPath,
      ]);

    redirectBrand({
      error:
        "asset-registration",
    });
  }


  revalidateBrandSurfaces();


  redirectBrand({
    success:
      "uploaded",

    asset:
      assetId,
  });
}


/* ============================================================
   PUBLISH BRAND ASSET
   ============================================================ */

export async function publishBrandAsset(
  formData:
    FormData,
): Promise<void> {
  const adminIdentity =
    await requireAdminIdentity();

  const supabaseAdmin =
    createSupabaseAdminClient();

  if (
    !supabaseAdmin
  ) {
    redirectBrand({
      error:
        "configuration",
    });
  }


  const assetId =
    readFormString(
      formData,
      "assetId",
    )
      ?.trim() ??
    "";


  if (
    assetId.length ===
      0
  ) {
    redirectBrand({
      error:
        "invalid-asset",
    });
  }


  const {
    error,
  } =
    await supabaseAdmin
      .rpc(
        "web_brand_publish_asset",
        {
          p_asset_id:
            assetId,

          p_published_by:
            adminIdentity.id,
        },
      );


  if (
    error
  ) {
    redirectBrand({
      error:
        "publish",
    });
  }


  revalidateBrandSurfaces();


  redirectBrand({
    success:
      "published",
  });
}


/* ============================================================
   RETIRE BRAND ASSET
   ============================================================ */

export async function retireBrandAsset(
  formData:
    FormData,
): Promise<void> {
  const adminIdentity =
    await requireAdminIdentity();

  const supabaseAdmin =
    createSupabaseAdminClient();

  if (
    !supabaseAdmin
  ) {
    redirectBrand({
      error:
        "configuration",
    });
  }


  const assetId =
    readFormString(
      formData,
      "assetId",
    )
      ?.trim() ??
    "";


  if (
    assetId.length ===
      0
  ) {
    redirectBrand({
      error:
        "invalid-asset",
    });
  }


  const {
    error,
  } =
    await supabaseAdmin
      .rpc(
        "web_brand_retire_asset",
        {
          p_asset_id:
            assetId,

          p_retired_by:
            adminIdentity.id,
        },
      );


  if (
    error
  ) {
    redirectBrand({
      error:
        "retire",
    });
  }


  revalidateBrandSurfaces();


  redirectBrand({
    success:
      "retired",
  });
}
