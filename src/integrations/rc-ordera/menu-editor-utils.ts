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
  readonly [key: string]: unknown;
}

export type RcEditableMenu = Record<string, RcMenuProduct[]>;

export interface RcProductUpdate {
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly available?: boolean;
  readonly imageUrl?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    Math.round(product.price * 100) === product.price * 100 &&
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
  const menu: RcEditableMenu = {};
  for (const [category, products] of entries) {
    if (category.trim().length === 0 || category.length > 120 ||
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

export function isSafeMenuRevision(original: RcEditableMenu, candidate: unknown): boolean {
  const next = normalizeMenu(candidate);
  if (!next) {
    return false;
  }
  const originalGroups = Object.keys(original);
  const nextGroups = Object.keys(next);
  if (originalGroups.length !== nextGroups.length ||
    originalGroups.some((category) => !Object.hasOwn(next, category))) {
    return false;
  }
  for (const [category, previous] of Object.entries(original)) {
    const edited = next[category];
    if (!edited || edited.length !== previous.length) {
      return false;
    }
    for (let i = 0; i < previous.length; i++) {
      const before = previous[i];
      const after = edited[i];
      if (!before || !after || before.id !== after.id) {
        return false;
      }
      // The UI cannot change IDs, translations, modifiers, category
      // order or kitchen routing; prevent accidental future changes.
      const unchangedKeys = new Set([
        ...Object.keys(before),
        ...Object.keys(after),
      ]);
      for (const key of ["name", "description", "price", "available", "imageUrl"]) {
        unchangedKeys.delete(key);
      }
      for (const key of unchangedKeys) {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          return false;
        }
      }
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
