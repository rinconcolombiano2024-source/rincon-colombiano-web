import "server-only";

import type {
  AppLocale,
} from "@/i18n/config";

import {
  getSupabasePublicConfig,
} from "@/lib/supabase/config";


/* ============================================================
   CONSTANTS
   ============================================================ */

const CMS_FETCH_TIMEOUT_MS =
  3000;

const CMS_CACHE_SECONDS =
  300;

const MAX_CONTENT_KEY_LENGTH =
  120;

const MAX_TITLE_LENGTH =
  200;

const MAX_BODY_LENGTH =
  180_000;


/* ============================================================
   TYPES
   ============================================================ */

export interface PublishedCmsTextContent {
  readonly contentKey:
    string;

  readonly locale:
    AppLocale;

  readonly kind:
    string;

  readonly title:
    string;

  readonly body:
    string;

  readonly sourceRevision:
    number;

  readonly publishedAt:
    string;
}


export type PublishedCmsResultStatus =
  | "ready"
  | "not-found"
  | "not-configured"
  | "unavailable";


export interface PublishedCmsResult {
  readonly status:
    PublishedCmsResultStatus;

  readonly content:
    PublishedCmsTextContent | null;
}


/* ============================================================
   VALIDATION
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


function isValidContentKey(
  value:
    string,
): boolean {

  return (
    value.length >=
      1 &&
    value.length <=
      MAX_CONTENT_KEY_LENGTH &&
    /^[a-z0-9][a-z0-9_-]*$/.test(
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
    Number.isSafeInteger(
      value,
    )
  )
    ? value
    : null;
}


/**
 * Lee de forma segura una propiedad dinámica cuyo tipo
 * todavía no conocemos.
 *
 * Se utiliza deliberadamente en lugar de:
 *
 * record["document"]
 *
 * porque ESLint dot-notation rechaza propiedades literales
 * expresadas mediante corchetes.
 *
 * Tampoco utilizamos:
 *
 * record.document
 *
 * porque este proyecto mantiene habilitado:
 *
 * noPropertyAccessFromIndexSignature
 *
 * y TypeScript exige acceso por índice cuando trabajamos
 * directamente con Record<string, unknown>.
 *
 * El resultado continúa siendo `unknown`, por lo que
 * cualquier consumidor debe validarlo antes de utilizarlo.
 */
function readUnknown(
  record:
    Readonly<
      Record<
        string,
        unknown
      >
    >,
  key:
    string,
): unknown {

  return record[
    key
  ];
}


/* ============================================================
   NORMALIZATION
   ============================================================ */

function normalizePublishedContent(
  value:
    unknown,
  expectedContentKey:
    string,
  expectedLocale:
    AppLocale,
): PublishedCmsTextContent | null {

  /*
   * Nunca confiamos directamente en la respuesta HTTP.
   *
   * Aunque Supabase normalmente devuelve objetos válidos,
   * todo dato externo se considera unknown hasta validarlo.
   */
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

  const kind =
    readString(
      value,
      "kind",
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

  const document =
    readUnknown(
      value,
      "document",
    );


  /*
   * Comprobamos tanto identidad del contenido solicitado
   * como integridad estructural de la respuesta.
   *
   * Esto evita utilizar accidentalmente:
   *
   * - otra clave;
   * - otro idioma;
   * - una revisión inválida;
   * - documentos malformados.
   */
  if (
    contentKey !==
      expectedContentKey ||
    locale !==
      expectedLocale ||
    !kind ||
    sourceRevision ===
      null ||
    sourceRevision <
      1 ||
    !publishedAt ||
    !isRecord(
      document,
    )
  ) {
    return null;
  }


  const rawTitle =
    readString(
      document,
      "title",
    );

  const rawBody =
    readString(
      document,
      "body",
    );


  if (
    rawTitle ===
      null ||
    rawBody ===
      null
  ) {
    return null;
  }


  const title =
    rawTitle.trim();

  const body =
    rawBody.trim();


  /*
   * Los límites protegen:
   *
   * - memoria;
   * - rendering;
   * - datos corruptos;
   * - cargas inesperadamente grandes;
   * - contenido vacío después del trim.
   */
  if (
    title.length <
      1 ||
    title.length >
      MAX_TITLE_LENGTH ||
    body.length <
      1 ||
    body.length >
      MAX_BODY_LENGTH
  ) {
    return null;
  }


  return {
    contentKey,

    locale:
      expectedLocale,

    kind,

    title,

    body,

    sourceRevision,

    publishedAt,
  };
}


/* ============================================================
   PUBLIC FETCH
   ============================================================ */

export async function loadPublishedCmsTextContent(
  contentKey:
    string,
  locale:
    AppLocale,
): Promise<PublishedCmsResult> {

  /* ========================================================
     INPUT
     ======================================================== */

  /*
   * La clave se valida antes de construir parámetros HTTP.
   *
   * Solo permitimos:
   *
   * - minúsculas;
   * - números;
   * - guion;
   * - guion bajo.
   */
  if (
    !isValidContentKey(
      contentKey,
    )
  ) {
    return {
      status:
        "not-found",

      content:
        null,
    };
  }


  /* ========================================================
     PUBLIC SUPABASE CONFIG
     ======================================================== */

  const config =
    getSupabasePublicConfig();


  /*
   * La ausencia de configuración no debe tumbar el sitio
   * público.
   */
  if (
    !config
  ) {
    return {
      status:
        "not-configured",

      content:
        null,
    };
  }


  let requestUrl:
    URL;


  /*
   * Aunque normalmente config.url vendrá validada por la
   * configuración de Supabase, conservamos una frontera
   * defensiva adicional.
   */
  try {
    requestUrl =
      new URL(
        "/rest/v1/web_cms_published",
        config.url,
      );
  } catch {
    return {
      status:
        "not-configured",

      content:
        null,
    };
  }


  /* ========================================================
     QUERY
     ======================================================== */

  /*
   * Solicitamos únicamente las columnas necesarias.
   *
   * Esto reduce:
   *
   * - transferencia;
   * - exposición de datos;
   * - trabajo de PostgreSQL;
   * - parsing en Node.js.
   */
  requestUrl.searchParams.set(
    "select",
    [
      "content_key",
      "locale",
      "kind",
      "document",
      "source_revision",
      "published_at",
    ].join(
      ",",
    ),
  );


  requestUrl.searchParams.set(
    "content_key",
    `eq.${contentKey}`,
  );


  requestUrl.searchParams.set(
    "locale",
    `eq.${locale}`,
  );


  /*
   * El par content_key + locale debería identificar una sola
   * publicación.
   *
   * `limit=1` mantiene igualmente una defensa de rendimiento
   * si la restricción de datos llegara a estar mal configurada.
   */
  requestUrl.searchParams.set(
    "limit",
    "1",
  );


  /* ========================================================
     TIMEOUT
     ======================================================== */

  const controller =
    new AbortController();


  /*
   * Una dependencia CMS lenta nunca debe retener
   * indefinidamente el render de la página pública.
   */
  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      CMS_FETCH_TIMEOUT_MS,
    );


  /* ========================================================
     REQUEST
     ======================================================== */

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

          /*
           * El contenido publicado se cachea durante
           * CMS_CACHE_SECONDS.
           *
           * Las tags permiten invalidación selectiva desde
           * operaciones administrativas.
           */
          next: {
            revalidate:
              CMS_CACHE_SECONDS,

            tags: [
              "web-cms",
              `web-cms:${contentKey}:${locale}`,
            ],
          },
        },
      );


    /*
     * No exponemos detalles internos de Supabase al usuario
     * público.
     *
     * Cualquier HTTP no exitoso se convierte en unavailable.
     */
    if (
      !response.ok
    ) {
      return {
        status:
          "unavailable",

        content:
          null,
      };
    }


    let data:
      unknown;


    /*
     * Una respuesta HTTP 2xx no garantiza JSON válido.
     */
    try {
      data =
        await response.json();
    } catch {
      return {
        status:
          "unavailable",

        content:
          null,
      };
    }


    /*
     * Supabase REST devuelve una colección.
     *
     * Un array vacío significa que no existe publicación
     * para la combinación solicitada.
     */
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

        content:
          null,
      };
    }


    /*
     * Incluso después de recibir datos desde Supabase,
     * ejecutamos la normalización runtime completa.
     */
    const content =
      normalizePublishedContent(
        data[
          0
        ],
        contentKey,
        locale,
      );


    if (
      !content
    ) {
      return {
        status:
          "unavailable",

        content:
          null,
      };
    }


    return {
      status:
        "ready",

      content,
    };

  } catch {

    /*
     * FAIL OPEN PARA CONTENIDO.
     *
     * Un problema temporal del CMS nunca debe tumbar
     * la página pública.
     *
     * Esto cubre, entre otros:
     *
     * - timeout;
     * - AbortError;
     * - problemas DNS;
     * - errores de red;
     * - fallos temporales de Supabase.
     */
    return {
      status:
        "unavailable",

      content:
        null,
    };

  } finally {

    /*
     * Evita mantener timers activos después de que la
     * solicitud haya terminado.
     */
    clearTimeout(
      timeout,
    );
  }
}


/* ============================================================
   CONVENIENCE API
   ============================================================ */

export async function getPublishedCmsTextContent(
  contentKey:
    string,
  locale:
    AppLocale,
): Promise<PublishedCmsTextContent | null> {

  const result =
    await loadPublishedCmsTextContent(
      contentKey,
      locale,
    );


  return result.content;
}
