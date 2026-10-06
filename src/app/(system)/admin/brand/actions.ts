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
 * Debe mantenerse por debajo del límite configurado
 * para Server Actions y del límite de payload de Vercel.
 *
 * Multimedia pesada y videos deberán utilizar posteriormente
 * upload directo/resumible hacia Storage.
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
  "hero_primary",
] as const;

export type BrandSlot =
  (typeof BRAND_SLOTS)[number];


/* ============================================================
   MIME TYPES
   ============================================================ */

/**
 * Tipos MIME admitidos por el sistema de identidad visual.
 *
 * No utilizamos una constante runtime únicamente para derivar
 * este tipo porque eso generaba un warning de ESLint.
 *
 * La validación real del archivo sigue realizándose mediante
 * su firma binaria en detectImageMimeType().
 *
 * Por tanto:
 *
 * - NO confiamos en file.type;
 * - NO confiamos en la extensión;
 * - NO confiamos en el nombre;
 * - NO confiamos en Content-Type enviado por el navegador.
 */
type BrandMimeType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/avif"
  | "image/x-icon"
  | "image/vnd.microsoft.icon";


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

/**
 * El nombre original se conserva únicamente como metadata.
 *
 * Nunca se utiliza como ruta real de Storage.
 */
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
 * Detecta el formato utilizando bytes reales.
 *
 * NO confiamos como fuente de verdad en:
 *
 * - file.type;
 * - extensión;
 * - nombre;
 * - Content-Type enviado por navegador.
 *
 * Esto evita falsos positivos/falsos negativos provocados
 * por metadata incorrecta enviada por determinados clientes.
 *
 * SVG no se admite deliberadamente.
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
   * AVIF
   *
   * ISO Base Media File Format:
   *
   * bytes 4-7  -> ftyp
   * bytes 8-11 -> avif / avis
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

/**
 * El favicon admite únicamente formatos apropiados para icono.
 *
 * Los demás recursos admiten formatos raster seguros.
 *
 * SVG queda expresamente excluido.
 */
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
    mimeType ===
      "image/png" ||
    mimeType ===
      "image/jpeg" ||
    mimeType ===
      "image/webp" ||
    mimeType ===
      "image/avif"
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

    case "hero_primary":
      return "Rincón Colombiano — restaurante colombiano en Varsovia";

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
 * Flujo seguro:
 *
 * 1. Verifica administrador.
 * 2. Crea cliente privilegiado exclusivamente server-side.
 * 3. Valida slot.
 * 4. Valida existencia y tamaño del archivo.
 * 5. Sanitiza metadata.
 * 6. Lee bytes reales.
 * 7. Detecta formato mediante firma binaria.
 * 8. Comprueba que el formato sea válido para ese slot.
 * 9. Calcula SHA-256.
 * 10. Genera ruta controlada exclusivamente por servidor.
 * 11. Sube a Storage.
 * 12. Registra metadata mediante RPC.
 * 13. Si PostgreSQL falla, elimina el objeto de Storage.
 * 14. Revalida superficies.
 *
 * El recurso queda cargado como borrador.
 * La publicación es una operación independiente.
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


  /*
   * Comprobación defensiva:
   * los bytes realmente recibidos deben coincidir con
   * el tamaño comunicado por File.
   */
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
     REAL MIME / BINARY SIGNATURE
     ======================================================== */

  const detectedMime =
    detectImageMimeType(
      bytes,
    );


  /*
   * La firma binaria es nuestra fuente de verdad.
   *
   * NO comparamos detectedMime con file.type.
   *
   * file.type es metadata controlada por cliente/navegador
   * y puede variar aun cuando el archivo sea completamente
   * válido.
   */
  if (
    !detectedMime
  ) {
    redirectBrand({
      error:
        "unsupported-file",
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

  /**
   * El hash permite:
   *
   * - comprobación de integridad;
   * - auditoría;
   * - identificación inequívoca del contenido;
   * - futuras estrategias de deduplicación.
   */
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
     SERVER-CONTROLLED STORAGE PATH
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


  /*
   * La ruta real jamás depende del nombre enviado
   * por el cliente.
   */
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
          /*
           * Content-Type derivado de los bytes,
           * no del navegador.
           */
          contentType:
            detectedMime,

          /*
           * El objeto utiliza path versionado/único.
           * Puede cachearse agresivamente.
           */
          cacheControl:
            "31536000",

          /*
           * Nunca reemplazamos silenciosamente otro objeto.
           */
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

          /*
           * Guardamos igualmente el MIME determinado
           * mediante bytes reales.
           */
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
     * Compensating transaction.
     *
     * Storage pudo haber funcionado aunque la BD fallara.
     * Eliminamos el objeto inmediatamente para no dejar
     * archivos huérfanos.
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

/**
 * Publicar está separado de cargar.
 *
 * Esto permite:
 *
 * - subir borradores;
 * - revisar antes de publicar;
 * - mantener historial;
 * - reemplazar identidad sin sobrescribir físicamente
 *   recursos anteriores.
 */
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

/**
 * Retirar no elimina físicamente el recurso ni destruye
 * el historial.
 *
 * La operación se controla mediante PostgreSQL/RPC para
 * conservar trazabilidad.
 */
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
