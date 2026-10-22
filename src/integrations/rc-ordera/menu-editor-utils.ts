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

/**
 * Local, read-only preview of each RC ORDERA product translation. This is
 * independent from server writes and does not pretend to translate missing
 * text. When the requested language has no title, visitors see the source
 * label; the editor must make that fallback obvious before publication.
 */
export interface RcMenuLocalePreview {
  readonly name: string;
  readonly description: string;
  readonly translated: boolean;
  readonly descriptionMissing: boolean;
}

export function getMenuLocalePreview(
  product: RcMenuProduct,
  locale: RcTranslationLocale,
): RcMenuLocalePreview {
  const localized = getProductTranslation(product, locale);
  const title = localized.name.trim();
  if (!title) {
    return {
      name: product.name,
      description: product.description ?? "",
      translated: false,
      descriptionMissing: Boolean((product.description ?? "").trim()),
    };
  }
  return {
    name: title,
    description: localized.description,
    translated: true,
    descriptionMissing: Boolean((product.description ?? "").trim()) &&
      !localized.description.trim(),
  };
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

/**
 * Compare product-editing INPUTS with their last applied draft.
 * This distinction matters: local keystrokes have not even entered the menu
 * draft until the operator presses "Aplicar al borrador". A green "sin cambios"
 * counter must never permit silently losing those keystrokes.
 *
 * This pure check also handles commas in Polish/Spanish price input without
 * treating 60,0 and 60.00 as different prices.
 */
export interface RcProductEditorFields {
  readonly name: string;
  readonly description: string;
  readonly priceText: string;
  readonly available: boolean;
  readonly imageUrl: string;
  readonly translations: Readonly<Record<RcTranslationLocale, RcProductTranslation>>;
}

export function hasUnappliedProductChanges(
  product: RcMenuProduct,
  fields: RcProductEditorFields,
): boolean {
  const normalizedPrice = Number(fields.priceText.trim().replace(",", "."));
  if (!Number.isFinite(normalizedPrice) ||
      fields.name.trim() !== product.name ||
      fields.description !== (product.description ?? "") ||
      normalizedPrice !== product.price ||
      fields.available !== product.available ||
      fields.imageUrl.trim() !== (product.imageUrl ?? "")) {
    return true;
  }

  return SUPPORTED_TRANSLATION_LOCALES.some((locale) => {
    const previous = getProductTranslation(product, locale);
    const current = fields.translations[locale];
    return current.name.trim() !== previous.name ||
      current.description.trim() !== previous.description;
  });
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

export interface RcMenuSearchHit {
  readonly category: string;
  readonly product: RcMenuProduct;
}

/**
 * Fast local owner-menu search; it never queries Supabase or exposes menu data
 * outside the already-authorized editor. Search all three translations and
 * match accents and case without rewriting real RC ORDERA product metadata.
 */
export function searchMenuProducts(
  menu: RcEditableMenu,
  text: string,
  maxResults = 24,
): RcMenuSearchHit[] {
  const normalized = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const query = normalized(text.trim().slice(0, 120));
  if (!query) { return []; }
  const cap = Number.isSafeInteger(maxResults) ? Math.min(Math.max(maxResults, 0), 50) : 24;
  if (cap === 0) { return []; }
  const matches: RcMenuSearchHit[] = [];
  for (const [category, products] of Object.entries(menu)) {
    for (const product of products) {
      const names = [
        category, product.id, product.name,
        ...SUPPORTED_TRANSLATION_LOCALES.map((locale) => getProductTranslation(product, locale).name),
      ];
      if (names.some((value) => normalized(value).includes(query))) {
        matches.push({ category, product });
        if (matches.length >= cap) { return matches; }
      }
    }
  }
  return matches;
}

/** Category edits are local drafts and never alter live RC ORDERA without the owner RPC. */
export function addMenuCategory(menu: RcEditableMenu, rawName: string): RcEditableMenu {
  const name = rawName.trim().replace(/\s+/gu, " ");
  if (!name || name.length > 120 ||
    ["__proto__", "constructor", "prototype"].includes(name.toLowerCase()) ||
    Object.keys(menu).some((current) => current.toLocaleLowerCase() === name.toLocaleLowerCase()) ||
    Object.keys(menu).length >= 80) {
    throw new Error("Nombre de categoría inválido, duplicado o límite de categorías alcanzado.");
  }
  return { ...menu, [name]: [] };
}

/** Refuse deletion of populated categories even when the UI makes a mistake. */
export function removeEmptyMenuCategory(menu: RcEditableMenu, name: string): RcEditableMenu {
  if (!Object.hasOwn(menu, name) || !Array.isArray(menu[name]) ||
    menu[name].length > 0 || Object.keys(menu).length <= 1) {
    throw new Error("Sólo puedes retirar categorías vacías, conservando al menos una.");
  }
  return Object.fromEntries(Object.entries(menu).filter(([category]) => category !== name));
}

/**
 * PostgreSQL JSONB (and JavaScript object spread) can re-order object keys
 * without changing menu data. Compare full canonical snapshots, preserving
 * ARRAY order: product ordering remains meaningful to the kitchen/customer.
 * This is a comparison-only helper; never modify the stored menu objects.
 */
export function canonicalMenuSnapshot(menu: RcEditableMenu): string {
  return JSON.stringify(menu, (_key, value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  });
}

export function areMenuSnapshotsEqual(a: RcEditableMenu, b: RcEditableMenu): boolean {
  return canonicalMenuSnapshot(a) === canonicalMenuSnapshot(b);
}

/** Bind the explicit owner review to both menu data and its server revision. */
export function menuDraftFingerprint(menu: RcEditableMenu, revision: number): string {
  return `${revision}:${canonicalMenuSnapshot(menu)}`;
}

/**
 * The owner RPC can report success even when a subsequent read is stale or
 * unexpected. Confirm the saved revision advanced AND the complete JSON menu
 * round-tripped without losing product IDs, kitchen stations or metadata.
 * PostgreSQL JSONB may reorder object keys, but array order is significant.
 */
export function isConfirmedMenuSave(
  requested: RcEditableMenu,
  persisted: RcEditableMenu,
  previousRevision: number,
  persistedRevision: number,
): boolean {
  if (!Number.isSafeInteger(previousRevision) ||
    !Number.isSafeInteger(persistedRevision) ||
    persistedRevision <= previousRevision) {
    return false;
  }
  return areMenuSnapshotsEqual(requested, persisted);
}

/**
 * A read-only change register for the CEO before any owner RPC is called.
 * Prices always come from the two snapshots, never from estimated tax or
 * automated calculations. Internal metadata is not exposed in the preview.
 */
export type RcMenuChangeKind =
  "category_added" | "category_removed" | "product_added" |
  "product_removed" | "product_updated";

export interface RcMenuChange {
  readonly kind: RcMenuChangeKind;
  readonly category: string;
  readonly productId?: string;
  readonly productName: string;
  readonly fields: readonly string[];
  readonly previousPrice?: number;
  readonly nextPrice?: number;
}

export function summarizeMenuChanges(
  original: RcEditableMenu,
  draft: RcEditableMenu,
): RcMenuChange[] {
  const changes: RcMenuChange[] = [];
  for (const category of Object.keys(original)) {
    if (!Object.hasOwn(draft, category)) {
      changes.push({ kind: "category_removed", category, productName: category, fields: [] });
    }
  }
  for (const [category, products] of Object.entries(draft)) {
    if (!Object.hasOwn(original, category)) {
      changes.push({ kind: "category_added", category, productName: category, fields: [] });
    }
    const previous = new Map((original[category] ?? []).map((item) => [item.id, item]));
    for (const product of products) {
      const before = previous.get(product.id);
      if (!before) {
        changes.push({
          kind: "product_added", category, productId: product.id,
          productName: product.name, fields: [], nextPrice: product.price,
        });
        continue;
      }
      const fields: string[] = [];
      if (before.name !== product.name) { fields.push("Nombre"); }
      if ((before.description ?? "") !== (product.description ?? "")) { fields.push("Descripción"); }
      if (before.price !== product.price) { fields.push("Precio"); }
      if (before.available !== product.available) { fields.push("Disponibilidad"); }
      if ((before.imageUrl ?? "") !== (product.imageUrl ?? "")) { fields.push("Fotografía"); }
      for (const locale of SUPPORTED_TRANSLATION_LOCALES) {
        const oldTranslation = getProductTranslation(before, locale);
        const newTranslation = getProductTranslation(product, locale);
        if (oldTranslation.name !== newTranslation.name ||
          oldTranslation.description !== newTranslation.description) {
          fields.push(`Traducción ${locale.toUpperCase()}`);
        }
      }
      if (fields.length > 0) {
        changes.push({
          kind: "product_updated", category, productId: product.id,
          productName: product.name, fields,
          previousPrice: before.price, nextPrice: product.price,
        });
      }
    }
    const currentIds = new Set(products.map((product) => product.id));
    for (const before of original[category] ?? []) {
      if (!currentIds.has(before.id)) {
        changes.push({
          kind: "product_removed", category, productId: before.id,
          productName: before.name, fields: [], previousPrice: before.price,
        });
      }
    }
  }
  return changes;
}

/**
 * Undo exactly one product in a LOCAL draft, preserving untouched entries and
 * restoring a removed product to its original relative order. New products
 * are removed instead. A final safe-revision check guards invariants.
 */
export function undoMenuProductChange(
  original: RcEditableMenu,
  draft: RcEditableMenu,
  category: string,
  productId: string,
): RcEditableMenu {
  if (!Object.hasOwn(draft, category)) {
    throw new Error("Categoría inexistente en el borrador.");
  }
  const originalProducts = original[category] ?? [];
  const restored = originalProducts.find((item) => item.id === productId);
  const group = draft[category] ?? [];
  const currentIndex = group.findIndex((item) => item.id === productId);
  let next: RcMenuProduct[];
  if (restored) {
    if (currentIndex !== -1) {
      next = group.map((item, i) => i === currentIndex ? { ...restored } : item);
    } else {
      const originalIndex = originalProducts.findIndex((item) => item.id === productId);
      const originalPositions = new Map(originalProducts.map((item, i) => [item.id, i]));
      const beforeIndex = group.findIndex((item) => {
        const position = originalPositions.get(item.id);
        return position === undefined || position > originalIndex;
      });
      next = [...group];
      next.splice(beforeIndex < 0 ? next.length : beforeIndex, 0, { ...restored });
    }
  } else if (currentIndex !== -1) {
    if (menuProductCount(draft) <= 1) {
      throw new Error("No se puede eliminar el último producto.");
    }
    next = group.filter((item) => item.id !== productId);
  } else {
    throw new Error("El producto no está en los cambios pendientes.");
  }
  const candidate = { ...draft, [category]: next };
  if (!isSafeMenuRevision(original, candidate)) {
    throw new Error("No se puede deshacer este cambio sin alterar el menú protegido.");
  }
  return candidate;
}

/**
 * Treat RPC receipts as provisional. A timeout or transport error can occur
 * AFTER PostgreSQL committed an owner-menu transaction. Only a subsequent
 * owner-scoped readback with a newer revision and matching full JSONB data
 * can prove a save succeeded. Do not retry an uncertain write blindly.
 */
export type RcMenuSaveOutcome = "confirmed" | "concurrent_change" | "unverified";

export function classifyMenuSaveOutcome(
  requested: RcEditableMenu,
  previousRevision: number,
  persistedMenu: RcEditableMenu | null,
  persistedRevision: number | null,
): RcMenuSaveOutcome {
  if (!persistedMenu || persistedRevision === null ||
    !Number.isSafeInteger(persistedRevision) ||
    !Number.isSafeInteger(previousRevision)) {
    return "unverified";
  }
  if (isConfirmedMenuSave(requested, persistedMenu, previousRevision, persistedRevision)) {
    return "confirmed";
  }
  if (persistedRevision > previousRevision) {
    // Another owner changed the menu, or the server stored different data.
    // Neither case may be treated as a successful publication of this draft.
    return "concurrent_change";
  }
  return "unverified";
}

/**
 * Recover only a LOCAL unpublished draft exported by this owner menu editor.
 * Never accept a copied live/server backup as an editable draft: those files
 * have a different status marker. A restoration never performs a database write.
 *
 * The current owner revision and restaurant ID must match exactly; legacy
 * drafts that predate this metadata need deliberate manual re-entry instead
 * of bypassing the owner revision guard.
 */
export function restoreUnpublishedMenuDraft(
  archive: unknown,
  current: RcEditableMenu,
  currentRevision: number,
  restaurantId: string,
): RcEditableMenu {
  if (!isObject(archive)) {
    throw new Error("El archivo no contiene un borrador de menú válido.");
  }
  // Verify named fields as unknown; typed field names satisfy strict
  // TypeScript index-signature access and ESLint without trusting user JSON.
  const fields = archive as {
    readonly status?: unknown;
    readonly restaurantId?: unknown;
    readonly menuRevision?: unknown;
    readonly menu?: unknown;
  };
  if (fields.status !== "UNPUBLISHED_DRAFT" ||
    fields.restaurantId !== restaurantId ||
    fields.menuRevision !== currentRevision ||
    !Number.isSafeInteger(currentRevision) || currentRevision < 0) {
    throw new Error(
      "Este archivo no es un borrador de esta sede y revisión. Descarga un respaldo actual y revisa los cambios manualmente.",
    );
  }
  const restored = normalizeMenu(fields.menu);
  if (!restored || !isSafeMenuRevision(current, restored)) {
    throw new Error(
      "El borrador cambió productos, estaciones, identificadores o categorías protegidos. No se importó nada.",
    );
  }
  if (summarizeMenuChanges(current, restored).length > 100) {
    throw new Error("El borrador tiene más de 100 modificaciones. Divide los cambios antes de publicarlos.");
  }
  return restored;
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
/** Detect keystrokes made in the new-product form BEFORE a product exists in
 * the editable draft; this form must be guarded independently from ProductCard.
 */
export function hasUnappliedNewProductFields(fields: {
  readonly name: string;
  readonly description: string;
  readonly priceText: string;
  readonly station: string;
  readonly translations?: RcProductTranslationUpdates;
}): boolean {
  return fields.name.trim().length > 0 ||
    fields.description.trim().length > 0 ||
    fields.priceText.trim().length > 0 ||
    fields.station !== "kitchen" ||
    Object.values(fields.translations ?? {}).some((entry) =>
      Boolean(entry?.name.trim() || entry?.description.trim()));
}

export interface RcNewProductFields {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly station: "kitchen" | "bar";
  readonly translations?: RcProductTranslationUpdates;
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
  if (fields.translations !== undefined && !safeNewTranslations(fields.translations)) {
    throw new Error("Las traducciones del producto nuevo no son válidas.");
  }
  const name = fields.name.trim();
  const description = fields.description.trim();
  const titleAndDescription = (locale: RcTranslationLocale): RcProductTranslation => {
    const translated = fields.translations?.[locale];
    if (!translated) {
      // Spanish inherits the original name and description by default.
      // PL and EN stay empty unless the owner actually entered a translation.
      return locale === "es"
        ? { name, description }
        : { name: "", description: "" };
    }
    if (locale === "es" && !translated.name.trim() && !translated.description.trim()) {
      return { name, description };
    }
    return {
      name: (locale === "es" ? translated.name.trim() || name : translated.name.trim()),
      description: translated.description.trim(),
    };
  };
  const nextProduct: RcMenuProduct = {
    id: fields.id,
    name,
    description,
    price: fields.price,
    available: true,
    imageUrl: "",
    station: fields.station,
    translations: {
      es: titleAndDescription("es"),
      pl: titleAndDescription("pl"),
      en: titleAndDescription("en"),
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
  const oldNames = new Set(originalGroups);
  // IDs are identities across the ENTIRE restaurant menu. Once saved, a
  // product (including one created by this editor) must not be disguised
  // as a newly-created item in another category or assigned a new station.
  const originalProductCategories = new Map(
    originalGroups.flatMap((name) => (original[name] ?? []).map((product) => [product.id, name] as const)),
  );
  const addedCategories = nextGroups.filter((name) => !oldNames.has(name));
  const removedCategories = originalGroups.filter((name) => !Object.hasOwn(next, name));
  // One new category and one removed EMPTY category at most per save.
  // Existing categories and their products never move or change names.
  if (addedCategories.length > 1 || removedCategories.length > 1 ||
    removedCategories.some((name) => (original[name]?.length ?? 0) !== 0) ||
    originalGroups.filter((name) => Object.hasOwn(next, name)).some(
      (name, i) => nextGroups[i] !== name
    ) ||
    addedCategories.some((name) =>
      !name.trim() || name.length > 120 ||
      ["__proto__", "constructor", "prototype"].includes(name.toLowerCase()) ||
      originalGroups.some((old) => old.toLocaleLowerCase() === name.toLocaleLowerCase())
    )) {
    return false;
  }
  let added = 0;
  let removed = 0;
  for (const category of nextGroups) {
    const before = original[category] ?? [];
    const after = next[category] ?? [];
    const beforeById = new Map(before.map((item, index) => [item.id, { item, index }]));
    let lastExistingIndex = -1;
    let encounteredNew = false;
    let retained = 0;
    for (const product of after) {
      const existing = beforeById.get(product.id);
      if (!existing) {
        if (originalProductCategories.has(product.id)) {
          return false; // A moved/copied saved ID is never a new product.
        }
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
  // New categories may contain new products but cannot smuggle in a
  // previously-existing product ID, since the old-group removals are counted.
  for (const category of removedCategories) {
    if ((original[category]?.length ?? 0) !== 0) { return false; }
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
