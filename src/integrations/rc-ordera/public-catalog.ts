/**
 * ============================================================
 * RINCÓN COLOMBIANO WEB
 * RC ORDERA — Public Restaurant Catalog
 * ============================================================
 *
 * OBJETIVO:
 *
 * Obtener desde RC ORDERA únicamente la información pública
 * necesaria para rinconcolombiano.pl:
 *
 * - menú;
 * - categorías;
 * - precio;
 * - descripción;
 * - fotografía;
 * - disponibilidad;
 * - nombre comercial;
 * - logo;
 * - dirección;
 * - estado abierto/cerrado;
 * - moneda;
 * - horarios;
 * - configuración pública de delivery.
 *
 * ESTRATEGIA:
 *
 * 1. RPC oficial:
 *      get_public_restaurant_menu(uuid)
 *
 * 2. Fallback compatible con RC ORDERA:
 *      restaurant_profiles
 *          ↓
 *      restaurant_public_catalogs
 *
 * SEGURIDAD:
 *
 * - nunca usa service_role;
 * - nunca expone credenciales administrativas;
 * - nunca escribe en RC ORDERA;
 * - esta integración es solamente lectura pública.
 */

import {
  getRcOrderaRestaurantId,
  getRcOrderaServerConfig,
  type RcOrderaLocationKey,
  type RcOrderaServerConfig,
} from "@/integrations/rc-ordera/config";


/* ============================================================
   JSON
   ============================================================ */

type JsonPrimitive =
  | string
  | number
  | boolean
  | null;


type JsonValue =
  | JsonPrimitive
  | JsonObject
  | readonly JsonValue[];


interface JsonObject {
  readonly [key: string]:
    JsonValue;
}


/* ============================================================
   CATALOG SOURCE
   ============================================================ */

export type RcOrderaCatalogSource =
  | "rpc"
  | "public-catalog-fallback";


/* ============================================================
   PRODUCT
   ============================================================ */

export interface RcOrderaPublicProduct {
  readonly id:
    string | null;

  readonly category:
    string;

  readonly name:
    string;

  readonly description:
    string;

  readonly price:
    number;

  readonly available:
    boolean;

  readonly imageUrl:
    string | null;

  readonly station:
    string | null;
}


/* ============================================================
   CATEGORY
   ============================================================ */

export interface RcOrderaPublicCategory {
  readonly name:
    string;

  readonly products:
    readonly RcOrderaPublicProduct[];
}


/* ============================================================
   RESTAURANT SETTINGS
   ============================================================ */

export interface RcOrderaPublicRestaurantSettings {
  readonly businessName:
    string | null;

  readonly businessLogoUrl:
    string | null;

  readonly restaurantAddress:
    string | null;

  readonly restaurantOperationalOpen:
    boolean | null;

  readonly openingHours:
    Readonly<JsonObject>;

  readonly restaurantLatitude:
    number | null;

  readonly restaurantLongitude:
    number | null;

  readonly currencySymbol:
    string;

  readonly currencyPosition:
    "before" | "after";

  readonly moneyFormat:
    "eu" | "us";

  readonly deliveryFee:
    number;

  readonly deliveryMinimumFee:
    number;
}


/* ============================================================
   PUBLIC CATALOG
   ============================================================ */

export interface RcOrderaPublicCatalog {
  readonly location:
    RcOrderaLocationKey;

  readonly restaurantId:
    string;

  readonly source:
    RcOrderaCatalogSource;

  readonly categories:
    readonly RcOrderaPublicCategory[];

  readonly settings:
    RcOrderaPublicRestaurantSettings;

  readonly productCount:
    number;
}


/* ============================================================
   LOAD STATUS
   ============================================================ */

export type RcOrderaCatalogLoadStatus =
  | "ready"
  | "not-configured"
  | "restaurant-not-found"
  | "unavailable";


export interface RcOrderaCatalogLoadResult {
  readonly status:
    RcOrderaCatalogLoadStatus;

  readonly catalog:
    RcOrderaPublicCatalog | null;
}


/* ============================================================
   INTERNAL FETCH RESULT
   ============================================================ */

interface RcOrderaFetchResult {
  readonly ok:
    boolean;

  readonly status:
    number;

  readonly data:
    unknown;
}


/* ============================================================
   TYPE GUARDS
   ============================================================ */

function isJsonObject(
  value:
    unknown,
): value is JsonObject {
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
   VALUE READERS
   ============================================================ */
function readValue(
  object:
    JsonObject,
  key:
    string,
): JsonValue | undefined {
  return object[
    key
  ];
}
function readString(
  object:
    JsonObject,
  key:
    string,
): string | null {
  const value =
    object[
      key
    ];

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .replace(
        /\s+/g,
        " ",
      )
      .trim();

  return normalized.length >
    0
    ? normalized
    : null;
}


function readBoolean(
  object:
    JsonObject,
  key:
    string,
): boolean | null {
  const value =
    object[
      key
    ];

  return typeof value ===
    "boolean"
    ? value
    : null;
}


function readNumber(
  object:
    JsonObject,
  key:
    string,
): number | null {
  const value =
    object[
      key
    ];

  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value,
    )
      ? value
      : null;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number.parseFloat(
        value,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  return null;
}


function readObject(
  object:
    JsonObject,
  key:
    string,
): JsonObject {
  const value =
    object[
      key
    ];

  return isJsonObject(
    value,
  )
    ? value
    : {};
}


/* ============================================================
   SAFE TEXT
   ============================================================ */

function normalizeDescription(
  value:
    string | null,
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .slice(
      0,
      1_000,
    );
}


/* ============================================================
   PRODUCT NORMALIZATION
   ============================================================ */

function normalizeProduct(
  category:
    string,
  value:
    unknown,
): RcOrderaPublicProduct | null {
  if (
    !isJsonObject(
      value,
    )
  ) {
    return null;
  }

  const name =
    readString(
      value,
      "name",
    );

  if (!name) {
    return null;
  }

  const id =
    readString(
      value,
      "id",
    ) ??
    readString(
      value,
      "productId",
    );

  const price =
    readNumber(
      value,
      "price",
    ) ??
    0;

  const description =
    readString(
      value,
      "description",
    ) ??
    readString(
      value,
      "descripcion",
    ) ??
    readString(
      value,
      "details",
    );

  const imageUrl =
    readString(
      value,
      "imageUrl",
    ) ??
    readString(
      value,
      "image",
    ) ??
    readString(
      value,
      "photo",
    );

  const available =
    readBoolean(
      value,
      "available",
    );

  const station =
    readString(
      value,
      "station",
    ) ??
    readString(
      value,
      "preparationStation",
    ) ??
    readString(
      value,
      "preparation_station",
    );

  return {
    id,

    category,

    name,

    description:
      normalizeDescription(
        description,
      ),

    price:
      Math.max(
        0,
        price,
      ),

    available:
      available !==
      false,

    imageUrl,

    station,
  };
}


/* ============================================================
   MENU NORMALIZATION
   ============================================================ */

function normalizeMenu(
  value:
    unknown,
): readonly RcOrderaPublicCategory[] {
  if (
    !isJsonObject(
      value,
    )
  ) {
    return [];
  }

  const categories:
    RcOrderaPublicCategory[] =
    [];

  for (
    const [
      rawCategory,
      rawProducts,
    ] of Object.entries(
      value,
    )
  ) {
    const category =
      rawCategory
        .replace(
          /\s+/g,
          " ",
        )
        .trim();

    if (
      !category ||
      !Array.isArray(
        rawProducts,
      )
    ) {
      continue;
    }

    const products =
      rawProducts
        .map(
          (
            product,
          ) =>
            normalizeProduct(
              category,
              product,
            ),
        )
        .filter(
          (
            product,
          ): product is RcOrderaPublicProduct =>
            product !==
            null,
        );

    if (
      products.length ===
      0
    ) {
      continue;
    }

    categories.push({
      name:
        category,

      products,
    });
  }

  return categories;
}


/* ============================================================
   SETTINGS NORMALIZATION
   ============================================================ */

function normalizeSettings(
  value:
    unknown,
): RcOrderaPublicRestaurantSettings {
  const settings =
    isJsonObject(
      value,
    )
      ? value
      : {};

  const currencyPosition =
    readString(
      settings,
      "currencyPosition",
    );

  const moneyFormat =
    readString(
      settings,
      "moneyFormat",
    );

  return {
    businessName:
      readString(
        settings,
        "businessName",
      ),

    businessLogoUrl:
      readString(
        settings,
        "businessLogoUrl",
      ),

    restaurantAddress:
      readString(
        settings,
        "restaurantAddress",
      ),

    restaurantOperationalOpen:
      readBoolean(
        settings,
        "restaurantOperationalOpen",
      ),

    openingHours:
      readObject(
        settings,
        "openingHours",
      ),

    restaurantLatitude:
      readNumber(
        settings,
        "restaurantLatitude",
      ),

    restaurantLongitude:
      readNumber(
        settings,
        "restaurantLongitude",
      ),

    currencySymbol:
      readString(
        settings,
        "currencySymbol",
      ) ??
      "zł",

    currencyPosition:
      currencyPosition ===
      "before"
        ? "before"
        : "after",

    moneyFormat:
      moneyFormat ===
      "us"
        ? "us"
        : "eu",

    deliveryFee:
      Math.max(
        0,
        readNumber(
          settings,
          "deliveryFee",
        ) ??
        0,
      ),

    deliveryMinimumFee:
      Math.max(
        0,
        readNumber(
          settings,
          "deliveryMinimumFee",
        ) ??
        0,
      ),
  };
}


/* ============================================================
   PRODUCT COUNT
   ============================================================ */

function countProducts(
  categories:
    readonly RcOrderaPublicCategory[],
): number {
  return categories.reduce(
    (
      total,
      category,
    ) =>
      total +
      category
        .products
        .length,
    0,
  );
}


/* ============================================================
   HTTP HEADERS
   ============================================================ */

function buildPublicHeaders(
  config:
    RcOrderaServerConfig,
): HeadersInit {
  return {
    apikey:
      config.anonKey,

    Authorization:
      `Bearer ${config.anonKey}`,

    Accept:
      "application/json",

    "Content-Type":
      "application/json",
  };
}


/* ============================================================
   FETCH JSON
   ============================================================ */

async function fetchJson(
  url:
    URL,
  config:
    RcOrderaServerConfig,
  init:
    RequestInit,
): Promise<RcOrderaFetchResult> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      config.timeoutMs,
    );

  try {
    const response =
      await fetch(
        url,
        {
          ...init,

          headers: {
            ...buildPublicHeaders(
              config,
            ),

            ...init.headers,
          },

          signal:
            controller.signal,

          next: {
            revalidate:
              300,
          },
        },
      );

    let data:
      unknown =
      null;

    try {
      data =
        await response.json();
    } catch {
      data =
        null;
    }

    return {
      ok:
        response.ok,

      status:
        response.status,

      data,
    };
  } catch {
    return {
      ok:
        false,

      status:
        0,

      data:
        null,
    };
  } finally {
    clearTimeout(
      timeout,
    );
  }
}


/* ============================================================
   RPC
   ============================================================ */

async function fetchCatalogFromRpc(
  config:
    RcOrderaServerConfig,
  restaurantId:
    string,
): Promise<JsonObject | null> {
  const url =
    new URL(
      "/rest/v1/rpc/get_public_restaurant_menu",
      config.supabaseUrl,
    );

  const response =
    await fetchJson(
      url,
      config,
      {
        method:
          "POST",

        body:
          JSON.stringify({
            p_user_id:
              restaurantId,
          }),
      },
    );

  if (!response.ok) {
    return null;
  }

  const row =
    Array.isArray(
      response.data,
    )
      ? response.data[
          0
        ]
      : response.data;

  return isJsonObject(
    row,
  )
    ? row
    : null;
}


/* ============================================================
   ACTIVE RESTAURANT FALLBACK CHECK
   ============================================================ */

async function restaurantExistsAndIsActive(
  config:
    RcOrderaServerConfig,
  restaurantId:
    string,
): Promise<
  boolean | null
> {
  const url =
    new URL(
      "/rest/v1/restaurant_profiles",
      config.supabaseUrl,
    );

  url.searchParams.set(
    "select",
    "user_id",
  );

  url.searchParams.set(
    "user_id",
    `eq.${restaurantId}`,
  );

  url.searchParams.set(
    "active",
    "eq.true",
  );

  url.searchParams.set(
    "deleted_at",
    "is.null",
  );

  url.searchParams.set(
    "limit",
    "1",
  );

  const response =
    await fetchJson(
      url,
      config,
      {
        method:
          "GET",
      },
    );

  if (!response.ok) {
    return null;
  }

  if (
    !Array.isArray(
      response.data,
    )
  ) {
    return false;
  }

  return response
    .data
    .some(
      (
        row,
      ) =>
        isJsonObject(
          row,
        ),
    );
}


/* ============================================================
   PUBLIC CATALOG FALLBACK
   ============================================================ */

async function fetchCatalogFallback(
  config:
    RcOrderaServerConfig,
  restaurantId:
    string,
): Promise<JsonObject | null> {
  const url =
    new URL(
      "/rest/v1/restaurant_public_catalogs",
      config.supabaseUrl,
    );

  url.searchParams.set(
    "select",
    "menu,settings",
  );

  url.searchParams.set(
    "restaurant_user_id",
    `eq.${restaurantId}`,
  );

  url.searchParams.set(
    "limit",
    "1",
  );

  const response =
    await fetchJson(
      url,
      config,
      {
        method:
          "GET",
      },
    );

  if (
    !response.ok ||
    !Array.isArray(
      response.data,
    )
  ) {
    return null;
  }

  const row =
    response.data[
      0
    ];

  return isJsonObject(
    row,
  )
    ? row
    : null;
}


/* ============================================================
   BUILD DOMAIN CATALOG
   ============================================================ */
function buildCatalog(
  location:
    RcOrderaLocationKey,
  restaurantId:
    string,
  source:
    RcOrderaCatalogSource,
  row:
    JsonObject,
): RcOrderaPublicCatalog {
  const categories =
    normalizeMenu(
      readValue(
        row,
        "menu",
      ),
    );

  return {
    location,

    restaurantId,

    source,

    categories,

    settings:
      normalizeSettings(
        readValue(
          row,
          "settings",
        ),
      ),

    productCount:
      countProducts(
        categories,
      ),
  };
}

/* ============================================================
   LOAD PUBLIC CATALOG
   ============================================================ */

/**
 * Carga el catálogo público de una sede.
 *
 * Nunca lanza una excepción hacia la página pública.
 *
 * La web de Rincón Colombiano debe continuar disponible
 * aunque RC ORDERA tenga una interrupción temporal.
 */
export async function loadRcOrderaPublicCatalog(
  location:
    RcOrderaLocationKey,
): Promise<RcOrderaCatalogLoadResult> {
  const config =
    getRcOrderaServerConfig();

  const restaurantId =
    getRcOrderaRestaurantId(
      location,
    );

  if (
    !config ||
    !restaurantId
  ) {
    return {
      status:
        "not-configured",

      catalog:
        null,
    };
  }


  /* ----------------------------------------------------------
     PRIMARY SOURCE — RPC
     ---------------------------------------------------------- */

  const rpcRow =
    await fetchCatalogFromRpc(
      config,
      restaurantId,
    );

  if (rpcRow) {
    return {
      status:
        "ready",

      catalog:
        buildCatalog(
          location,
          restaurantId,
          "rpc",
          rpcRow,
        ),
    };
  }


  /* ----------------------------------------------------------
     FALLBACK — VERIFY RESTAURANT
     ---------------------------------------------------------- */

  const active =
    await restaurantExistsAndIsActive(
      config,
      restaurantId,
    );

  if (
    active ===
    false
  ) {
    return {
      status:
        "restaurant-not-found",

      catalog:
        null,
    };
  }

  if (
    active ===
    null
  ) {
    return {
      status:
        "unavailable",

      catalog:
        null,
    };
  }


  /* ----------------------------------------------------------
     FALLBACK — PUBLIC CATALOG
     ---------------------------------------------------------- */

  const fallbackRow =
    await fetchCatalogFallback(
      config,
      restaurantId,
    );

  if (!fallbackRow) {
    return {
      status:
        "unavailable",

      catalog:
        null,
    };
  }

  return {
    status:
      "ready",

    catalog:
      buildCatalog(
        location,
        restaurantId,
        "public-catalog-fallback",
        fallbackRow,
      ),
  };
}


/* ============================================================
   SIMPLE ACCESSOR
   ============================================================ */

/**
 * Atajo para componentes que solamente necesitan catálogo/null.
 */
export async function getRcOrderaPublicCatalog(
  location:
    RcOrderaLocationKey,
): Promise<RcOrderaPublicCatalog | null> {
  const result =
    await loadRcOrderaPublicCatalog(
      location,
    );

  return result.catalog;
}
