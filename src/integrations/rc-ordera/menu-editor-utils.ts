/**
 * Pure, defensive menu transformations shared by the RC ORDERA owner editor.
 * Preserve every property not explicitly edited: modifiers, translations,
 * kitchen stations, product IDs and any future RC ORDERA metadata.
 *
 * Never post a malformed/truncated menu to save_current_restaurant_menu.
 */
export interface RcMenuProduct {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly available: boolean;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly station?: string;
  readonly translations?: unknown;
  readonly [key: string]: unknown;
}

export type RcEditableMenu = Record<string, RcMenuProduct[]>;

export type RcTranslationLocale = "pl" | "es" | "en";

export interface RcProductTranslation {
  readonly name: string;
  readonly description: string;
}

export type RcProductTranslationUpdates =
  Partial<Record<RcTranslationLocale, RcProductTranslation>>;

export interface RcProductUpdate {
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly available?: boolean;
  readonly imageUrl?: string;
  readonly translations?: RcProductTranslationUpdates;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const SUPPORTED_TRANSLATION_LOCALES = ["pl", "es", "en"] as const;

function validTranslationEntry(value: unknown): value is RcProductTranslation {
  if (!isObject(value)) {
    return false;
  }
  const entry = value as { readonly name?: unknown; readonly description?: unknown };
  return typeof entry.name === "string" &&
    entry.name.length <= 160 &&
    typeof entry.description === "string" &&
    entry.description.length <= 3000;
}

export function getProductTranslation(
  product: RcMenuProduct,
  locale: RcTranslationLocale,
): RcProductTranslation {
  const entries = product.translations;
  const value = isObject(entries) ? entries[locale] : undefined;
  if (validTranslationEntry(value)) {
    return { name: value.name, description: value.description };
  }
  return { name: "", description: "" };
}

function mergeProductTranslations(
  original: unknown,
  changes: RcProductTranslationUpdates,
): Record<string, unknown> {
  const result: Record<string, unknown> = isObject(original)
    ? { ...original }
    : {};
  for (const locale of SUPPORTED_TRANSLATION_LOCALES) {
    const translation = changes[locale];
    if (translation === undefined) {
      continue;
    }
    if (!validTranslationEntry(translation)) {
      throw new Error("Traducción demasiado extensa o no válida.");
    }
    const previous = result[locale];
    // Preserve future/RC ORDERA-specific metadata in each language record.
    result[locale] = {
      ...(isObject(previous) ? previous : {}),
      name: translation.name.trim(),
      description: translation.description.trim(),
    };
  }
  return result;
}

/**
 * Existing metadata cannot change except title/description on three language
 * keys. Any other translation language or additional RC ORDERA fields survive.
 */
function isSafeTranslationChange(before: unknown, after: unknown): boolean {
  if (JSON.stringify(before) === JSON.stringify(after)) {
    return true;
  }
  if (!isObject(after) || (before !== undefined && !isObject(before))) {
    return false;
  }
  const previous = isObject(before) ? before : {};
  for (const [locale, original] of Object.entries(previous)) {
    if (!Object.hasOwn(after, locale)) {
      return false;
    }
    if (!SUPPORTED_TRANSLATION_LOCALES.some((supported) => supported === locale)) {
      if (JSON.stringify(after[locale]) !== JSON.stringify(original)) {
        return false;
      }
      continue;
    }
    const changed = after[locale];
    if (!validTranslationEntry(changed)) {
      return false;
    }
    if (!isObject(original)) {
      return false;
    }
    const changedFields = changed as unknown as Record<string, unknown>;
    const keys = new Set([...Object.keys(original), ...Object.keys(changedFields)]);
    keys.delete("name");
    keys.delete("description");
    for (const key of keys) {
      if (JSON.stringify(original[key]) !== JSON.stringify(changedFields[key])) {
        return false;
      }
    }
  }
  for (const [locale, value] of Object.entries(after)) {
    if (Object.hasOwn(previous, locale)) {
      continue;
    }
    if (!SUPPORTED_TRANSLATION_LOCALES.some((supported) => supported === locale) ||
      !validTranslationEntry(value) ||
      Object.keys(value).some((key) => key !== "name" && key !== "description")) {
      return false;
    }
  }
  return true;
}

function safeNewTranslations(value: unknown): boolean {
  if (!isObject(value) ||
    Object.keys(value).some((key) =>
      !SUPPORTED_TRANSLATION_LOCALES.some((locale) => locale === key))) {
    return false;
  }
  return Object.values(value).every((translation) =>
    validTranslationEntry(translation) &&
    Object.keys(translation).every((key) => key === "name" || key === "description"));
}

export function validProductImageUrl(value: string): boolean {
  if (value === "") {
    return true;
  }
  if (value.length > 1600) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password;
  } catch {
    return false;
  }
}

interface ProductInput {
  readonly id?: unknown;
  readonly name?: unknown;
  readonly price?: unknown;
  readonly available?: unknown;
  readonly description?: unknown;
  readonly imageUrl?: unknown;
}

export function isValidProduct(value: unknown): value is RcMenuProduct {
  if (!isObject(value)) {
    return false;
  }
  const product = value as ProductInput;
  return typeof product.id === "string" &&
    product.id.length > 0 &&
    typeof product.name === "string" &&
    product.name.trim().length > 0 &&
    product.name.length <= 160 &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0 &&
    product.price <= 9999 &&
    Math.abs(product.price * 100 - Math.round(product.price * 100)) < 0.000001 &&
    typeof product.available === "boolean" &&
    (product.description === undefined ||
      (typeof product.description === "string" && product.description.length <= 3000)) &&
    (product.imageUrl === undefined ||
      (typeof product.imageUrl === "string" && validProductImageUrl(product.imageUrl)));
}

export function normalizeMenu(value: unknown): RcEditableMenu | null {
  if (!isObject(value)) {
    return null;
  }
  const entries = Object.entries(value);
  if (entries.length > 80) {
    return null;
  }
  const seen = new Set<string>();
  const menu: RcEditableMenu = Object.create(null) as RcEditableMenu;
  for (const [category, products] of entries) {
    if (category.trim().length === 0 || category.length > 120 ||
      category === "__proto__" || category === "constructor" ||
      !Array.isArray(products) || products.length > 300) {
      return null;
    }
    for (const product of products as unknown[]) {
      if (!isValidProduct(product) || seen.has(product.id)) {
        return null;
      }
      seen.add(product.id);
    }
    // clone to ensure the readonly source is not changed by UI edits
    menu[category] = (products as RcMenuProduct[]).map((product) => ({
      ...product,
    }));
  }
  return menu;
}

export function menuProductCount(menu: RcEditableMenu): number {
  return Object.values(menu).reduce((count, group) => count + group.length, 0);
}

export function updateProduct(
  menu: RcEditableMenu,
  category: string,
  productId: string,
  patch: RcProductUpdate,
): RcEditableMenu {
  const currentGroup = menu[category];
  if (!currentGroup) {
    throw new Error("Categoría inexistente");
  }
  const index = currentGroup.findIndex((item) => item.id === productId);
  if (index === -1) {
    throw new Error("Producto inexistente");
  }
  const next = {
    ...currentGroup[index],
    ...patch,
    ...(patch.translations
      ? { translations: mergeProductTranslations(currentGroup[index]?.translations, patch.translations) }
      : {}),
  };
  if (!isValidProduct(next)) {
    throw new Error("Datos del producto no válidos");
  }
  return {
    ...menu,
    [category]: currentGroup.map((item, position) =>
      position === index ? next : item),
  };
}

/**
 * RC ORDERA product creation uses a unique, collision-resistant ID. The
 * existing menu format is preserved (stations and PL/ES/EN translations).
 * No backend writes occur until the owner explicitly saves the whole draft.
 */
export interface RcNewProductFields {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly station: "kitchen" | "bar";
}

const NEW_PRODUCT_ID = /^prod-web-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function addMenuProduct(
  menu: RcEditableMenu,
  category: string,
  fields: RcNewProductFields,
): RcEditableMenu {
  const group = menu[category];
  if (!group || group.length >= 300 ||
    !NEW_PRODUCT_ID.test(fields.id) ||
    Object.values(menu).some((products) => products.some((item) => item.id === fields.id))) {
    throw new Error("Categoría llena, producto duplicado o ID inválido.");
  }
  const name = fields.name.trim();
  const nextProduct: RcMenuProduct = {
    id: fields.id,
    name,
    description: fields.description.trim(),
    price: fields.price,
    available: true,
    imageUrl: "",
    station: fields.station,
    translations: {
      es: { name, description: fields.description.trim() },
      pl: { name: "", description: "" },
      en: { name: "", description: "" },
    },
  };
  if (!isValidProduct(nextProduct) ||
    !["kitchen", "bar"].includes(fields.station)) {
    throw new Error("El nuevo producto contiene datos no válidos.");
  }
  return {
    ...menu,
    [category]: [...group, nextProduct],
  };
}

export function removeMenuProduct(
  menu: RcEditableMenu,
  category: string,
  productId: string,
): RcEditableMenu {
  const group = menu[category];
  if (!group || !group.some((product) => product.id === productId)) {
    throw new Error("Producto inexistente.");
  }
  if (menuProductCount(menu) <= 1) {
    throw new Error("No se puede eliminar el último producto del menú.");
  }
  return {
    ...menu,
    [category]: group.filter((product) => product.id !== productId),
  };
}

function hasPreservedMetadata(before: RcMenuProduct, after: RcMenuProduct): boolean {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  if (!isSafeTranslationChange(before.translations, after.translations)) {
    return false;
  }
  for (const key of ["name", "description", "price", "available", "imageUrl", "translations"]) {
    keys.delete(key);
  }
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Validates at most 3 additions and 1 removal per save.
 * Existing product IDs, relative order, all metadata and category structure
 * must remain stable. Newly added products can only be appended; their
 * initial metadata is tightly constrained to the supported RC ORDERA shape.
 */
export function isSafeMenuRevision(original: RcEditableMenu, candidate: unknown): boolean {
  const next = normalizeMenu(candidate);
  if (!next || menuProductCount(next) === 0) {
    return false;
  }
  const originalGroups = Object.keys(original);
  const nextGroups = Object.keys(next);
  if (originalGroups.length !== nextGroups.length ||
    originalGroups.some((category, i) => nextGroups[i] !== category)) {
    return false;
  }
  let added = 0;
  let removed = 0;
  for (const category of originalGroups) {
    const before = original[category] ?? [];
    const after = next[category] ?? [];
    const beforeById = new Map(before.map((item, index) => [item.id, { item, index }]));
    let lastExistingIndex = -1;
    let encounteredNew = false;
    let retained = 0;
    for (const product of after) {
      const existing = beforeById.get(product.id);
      if (!existing) {
        encounteredNew = true;
        added++;
        if (!NEW_PRODUCT_ID.test(product.id) ||
          !["kitchen", "bar"].includes(String(product.station)) ||
          typeof product.description !== "string" ||
          typeof product.imageUrl !== "string" ||
          !safeNewTranslations(product.translations) ||
          Object.keys(product).some((key) =>
            !["id", "name", "description", "price", "available", "imageUrl", "station", "translations"].includes(key))) {
          return false;
        }
        continue;
      }
      if (encounteredNew || existing.index <= lastExistingIndex ||
        !hasPreservedMetadata(existing.item, product)) {
        return false;
      }
      lastExistingIndex = existing.index;
      retained++;
    }
    removed += before.length - retained;
    if (added > 3 || removed > 1) {
      return false;
    }
  }
  return true;
}

export type ProductImageMime = "image/png" | "image/jpeg" | "image/webp";

export function detectProductImageMime(bytes: Uint8Array): ProductImageMime | null {
  if (bytes.length < 12) {
    return null;
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 &&
      bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a &&
      bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}
