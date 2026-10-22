import assert from "node:assert/strict";
import { localizeRcOrderaCategories, localizeRcOrderaProduct } from "../src/integrations/rc-ordera/localize-catalog.ts";
import {
  addMenuProduct, duplicateMenuProductDraft, addMenuCategory, removeEmptyMenuCategory, removeMenuProduct,
  detectProductImageMime, isSafeMenuRevision, isConfirmedMenuSave, classifyMenuSaveOutcome,
  canonicalMenuSnapshot, areMenuSnapshotsEqual, menuDraftFingerprint,
  getProductTranslation, getMenuLocalePreview, auditMenuTranslations,
  hasUnappliedProductChanges, hasUnappliedNewProductFields,
  normalizeMenu, updateProduct, validProductImageUrl, searchMenuProducts,
  summarizeMenuChanges, undoMenuProductChange, restoreUnpublishedMenuDraft,
  menuProductCount,
} from "../src/integrations/rc-ordera/menu-editor-utils.ts";

const original = {
  "PLATOS PRINCIPALES": [{
    id: "prod-bandeja",
    name: "Bandeja paisa",
    description: "Traditional",
    price: 60,
    available: true,
    imageUrl: "",
    station: "kitchen",
    translations: {
      pl: { name: "Bandeja", description: "Tradycyjna" },
      en: { name: "Bandeja", description: "" },
    },
    modifiers: ["extra-arepa"],
  }],
  BEBIDAS: [{
    id: "prod-masato", name: "Masato", price: 15, available: true,
    station: "bar",
  }],
};

const menu = normalizeMenu(original);
assert.ok(menu, "Original owner menu must parse");
assert.equal(menuProductCount(menu), 2);
const translationsAudit = auditMenuTranslations(menu);
assert.equal(translationsAudit.products, 2, "only owner snapshot dishes count towards translation audit");
assert.equal(translationsAudit.pl.incompleteProducts, 1);
assert.equal(translationsAudit.pl.missingTitles, 1);
assert.equal(translationsAudit.pl.missingDescriptions, 0);
assert.deepEqual(translationsAudit.pl.issues, [{
  category: "BEBIDAS", productId: "prod-masato", productName: "Masato",
  missingTitle: true, missingDescription: false,
}], "Polish missing title is actionable without inventing a description");
assert.equal(translationsAudit.en.incompleteProducts, 2);
assert.equal(translationsAudit.en.missingTitles, 1);
assert.equal(translationsAudit.en.missingDescriptions, 1);
assert.deepEqual(translationsAudit.en.issues.map((i) => i.productId),
  ["prod-bandeja", "prod-masato"], "owner can jump to every missing English translation");
assert.equal(auditMenuTranslations(menu, 0).pl.issues.length, 0,
  "issue list cap can suppress a long list without losing total counts");
assert.equal(auditMenuTranslations(menu, 1).en.issues.length, 1,
  "large menus must never render unbounded translation issues");
assert.equal(auditMenuTranslations(menu, 100).en.issues.length, 2);
const manyProducts = normalizeMenu({
  BEBIDAS: Array.from({ length: 60 }, (_, index) => ({
    id: `draft-beverage-${index}`,
    name: `Bebida colombiana ${index + 1}`,
    description: "Bebida tradicional",
    price: 15,
    available: true,
    station: "bar",
    translations: {
      pl: { name: "", description: "" },
      en: { name: "", description: "" },
    },
  })),
});
assert.ok(manyProducts);
const first24 = auditMenuTranslations(manyProducts, 24, 0);
const second24 = auditMenuTranslations(manyProducts, 24, 24);
const third24 = auditMenuTranslations(manyProducts, 24, 48);
for (const report of [first24, second24, third24]) {
  assert.equal(report.products, 60, "pagination may never change total count");
  assert.equal(report.pl.incompleteProducts, 60);
  assert.equal(report.pl.missingTitles, 60);
  assert.equal(report.pl.missingDescriptions, 60);
}
assert.equal(first24.pl.issues.length, 24);
assert.equal(second24.pl.issues.length, 24);
assert.equal(third24.pl.issues.length, 12);
assert.equal(first24.pl.issues[0].productId, "draft-beverage-0");
assert.equal(second24.pl.issues[0].productId, "draft-beverage-24");
assert.equal(third24.en.issues.at(-1)?.productId, "draft-beverage-59");
assert.equal(new Set([first24, second24, third24]
  .flatMap((report) => report.pl.issues.map((issue) => issue.productId))).size, 60,
  "CEO can reach ALL untranslated products without duplicates or omitted pages");
assert.deepEqual(auditMenuTranslations(manyProducts, 24, -99).en.issues,
  first24.en.issues, "invalid negative offsets fail closed to the first page");
assert.deepEqual(auditMenuTranslations(manyProducts, 24, Number.POSITIVE_INFINITY).en.issues,
  first24.en.issues, "non-finite offsets must not hide missing translations");
assert.equal(auditMenuTranslations(manyProducts, 24, 9999).pl.issues.length, 0,
  "out of range page returns no issues but never changes overall totals");
assert.equal(manyProducts.BEBIDAS[0].translations.pl.name, "",
  "read-only pagination never modifies a product or its live localization");
assert.deepEqual(original["PLATOS PRINCIPALES"][0].translations,
  menu["PLATOS PRINCIPALES"][0].translations,
  "translation audit is read-only and never updates source menu metadata");
const completeLocales = updateProduct(
  updateProduct(menu, "PLATOS PRINCIPALES", "prod-bandeja", {
    translations: { en: { name: "Bandeja", description: "Traditional plate" } },
  }), "BEBIDAS", "prod-masato", {
    translations: {
      pl: { name: "Masato", description: "" },
      en: { name: "Masato", description: "" },
    },
  });
assert.equal(auditMenuTranslations(completeLocales).pl.incompleteProducts, 0);
assert.equal(auditMenuTranslations(completeLocales).en.incompleteProducts, 0,
  "coverage becomes complete only after real owner-provided translations");
const plPreview = getMenuLocalePreview(menu["PLATOS PRINCIPALES"][0], "pl");
assert.deepEqual(plPreview, {
  name: "Bandeja", description: "Tradycyjna", translated: true, descriptionMissing: false,
}, "Polish editor preview displays real stored translations only");
const enPreview = getMenuLocalePreview(menu["PLATOS PRINCIPALES"][0], "en");
assert.equal(enPreview.name, "Bandeja");
assert.equal(enPreview.translated, true);
assert.equal(enPreview.descriptionMissing, true,
  "missing English description must be clearly visible before the owner publishes");
const esPreview = getMenuLocalePreview(menu["PLATOS PRINCIPALES"][0], "es");
assert.deepEqual(esPreview, {
  name: "Bandeja paisa", description: "Traditional",
  translated: false, descriptionMissing: true,
}, "untranslated Spanish title falls back to existing product, never a fabricated translation");
const withoutDescription = getMenuLocalePreview(menu.BEBIDAS[0], "es");
assert.equal(withoutDescription.translated, false);
assert.equal(withoutDescription.descriptionMissing, false,
  "products without an original description must not be marked falsely incomplete");
assert.equal(menu["PLATOS PRINCIPALES"][0].name, "Bandeja paisa",
  "a read-only preview must not mutate the original RC ORDERA catalog");
assert.deepEqual(searchMenuProducts(menu, "BEBIDAS").map((hit) => hit.product.id), ["prod-masato"],
  "search by category returns the real product, not an invented catalog copy");
assert.deepEqual(searchMenuProducts(menu, "tradycyjna").map((hit) => hit.product.id), [],
  "description fields are not accidentally used as an uncontrolled search surface");
assert.deepEqual(searchMenuProducts(menu, "Bándeja").map((hit) => hit.product.id), ["prod-bandeja"],
  "search handles accents and case");
assert.deepEqual(searchMenuProducts(menu, " prod-Masato ").map((hit) => hit.product.id), ["prod-masato"],
  "search exact existing product IDs");
assert.equal(searchMenuProducts(menu, "").length, 0, "no result list for empty search");
assert.equal(searchMenuProducts(menu, "prod-", 1).length, 1, "limit bounds result count");
assert.equal(searchMenuProducts(menu, "prod-", 0).length, 0, "explicit zero limit blocks results");
const changed = updateProduct(menu, "PLATOS PRINCIPALES", "prod-bandeja", {
  price: 62.5,
  available: false,
  imageUrl: "https://example.com/bandeja.webp",
});
assert.equal(changed["PLATOS PRINCIPALES"][0].price, 62.5);
assert.equal(changed["PLATOS PRINCIPALES"][0].available, false);
assert.equal(menu["PLATOS PRINCIPALES"][0].price, 60, "must not mutate original");
assert.deepEqual(changed["PLATOS PRINCIPALES"][0].translations,
  original["PLATOS PRINCIPALES"][0].translations);
assert.equal(isSafeMenuRevision(menu, changed), true);
const soldOut = updateProduct(menu, "PLATOS PRINCIPALES", "prod-bandeja", { available: false });
assert.equal(soldOut["PLATOS PRINCIPALES"][0].available, false,
  "search shortcut only changes the selected product availability in the local draft");
assert.equal(menu["PLATOS PRINCIPALES"][0].available, true, "source snapshot is immutable");
assert.equal(soldOut["PLATOS PRINCIPALES"][0].price, 60, "quick stock toggle never changes the price");
assert.equal(soldOut["PLATOS PRINCIPALES"][0].station, "kitchen",
  "quick availability shortcut never changes kitchen routing");
assert.deepEqual(soldOut["PLATOS PRINCIPALES"][0].modifiers, ["extra-arepa"],
  "quick availability keeps existing internal product data");
assert.equal(isSafeMenuRevision(menu, soldOut), true, "owner revision validator permits availability toggle");
assert.equal(updateProduct(soldOut, "PLATOS PRINCIPALES", "prod-bandeja",
  { available: true })["PLATOS PRINCIPALES"][0].available, true,
  "a second toggle restores the previous availability without writing to the database");
const validDraftArchive = {
  restaurantId: "restaurant-owner-123",
  menuRevision: 9,
  status: "UNPUBLISHED_DRAFT",
  exportedAt: "2026-10-22T02:00:00Z",
  menu: changed,
};
const recovered = restoreUnpublishedMenuDraft(validDraftArchive, menu, 9, "restaurant-owner-123");
assert.equal(recovered["PLATOS PRINCIPALES"][0].price, 62.5,
  "draft-only recovery retains changed price without server writes");
assert.equal(menu["PLATOS PRINCIPALES"][0].price, 60,
  "recovery never mutates server snapshot");
assert.deepEqual(recovered["PLATOS PRINCIPALES"][0].modifiers, ["extra-arepa"],
  "recovery preserves original modifiers and station metadata");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, status: "LAST_READ_SERVER_SNAPSHOT" }, menu, 9, "restaurant-owner-123"),
  /borrador de esta sede/i, "server backups cannot be imported as unpublished drafts");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, restaurantId: "another-owner" }, menu, 9, "restaurant-owner-123"),
  /esta sede/i, "cross-restaurant drafts are forbidden");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, menuRevision: 8 }, menu, 9, "restaurant-owner-123"),
  /esta sede/i, "revision mismatch requires an explicit reconciliation");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, menu: { ...menu, "PLATOS PRINCIPALES": [{
    ...menu["PLATOS PRINCIPALES"][0], station: "bar",
  }] } }, menu, 9, "restaurant-owner-123"),
  /protegidos/i, "imported draft cannot overwrite station data");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, menu: { "PLATOS PRINCIPALES": [], BEBIDAS: [] } }, menu, 9, "restaurant-owner-123"),
  /protegidos/i, "injected removals not matching the safe revision guard fail");
assert.throws(() => restoreUnpublishedMenuDraft(
  { ...validDraftArchive, menu: JSON.parse('{"__proto__":[]}') },
  menu, 9, "restaurant-owner-123"),
  /protegidos/i, "prototype polluting draft keys are rejected");
assert.throws(() => restoreUnpublishedMenuDraft(null, menu, 9, "restaurant-owner-123"),
  /borrador de menú válido/i, "null archive fails closed");
const changedSummary = summarizeMenuChanges(menu, changed);
assert.equal(changedSummary.length, 1, "one changed product is one review row");
assert.equal(changedSummary[0].kind, "product_updated");
assert.deepEqual(changedSummary[0].fields, ["Precio", "Disponibilidad", "Fotografía"],
  "the review lists ALL edited product fields without exposing private metadata");
assert.equal(changedSummary[0].previousPrice, 60);
assert.equal(changedSummary[0].nextPrice, 62.5);
assert.deepEqual(Object.entries(undoMenuProductChange(menu, changed, "PLATOS PRINCIPALES", "prod-bandeja")),
  Object.entries(menu), "single-product undo restores exact old station, translations and modifiers");
const storedWebProduct = {
  id: "prod-web-00000000-0000-4000-8000-000000000099",
  name: "Arepa tradicional", description: "Con queso",
  price: 15, available: true, imageUrl: "", station: "kitchen",
  translations: { pl: { name: "Arepa", description: "" } },
};
const previouslyPublished = normalizeMenu({
  MAIN: [storedWebProduct],
  DRINKS: [{ id: "saved-drink", name: "Masato", price: 15, available: true, station: "bar" }],
});
assert.ok(previouslyPublished);
const movedStoredProduct = {
  MAIN: [],
  DRINKS: [
    previouslyPublished.DRINKS[0],
    { ...storedWebProduct, price: 1, station: "bar",
      translations: { pl: { name: "Fake", description: "" } } },
  ],
};
assert.equal(isSafeMenuRevision(previouslyPublished, movedStoredProduct), false,
  "a previously saved prod-web UUID cannot masquerade as a new dish in another category");
assert.equal(isSafeMenuRevision(previouslyPublished, {
  MAIN: [storedWebProduct],
  DRINKS: [previouslyPublished.DRINKS[0], storedWebProduct],
}), false, "an existing ID cannot be duplicated in another category");
const newCategory = addMenuCategory(menu, " Entradas   y  sopas ");
assert.ok(summarizeMenuChanges(menu, newCategory).some((event) =>
  event.kind === "category_added" && event.category === "Entradas y sopas"));
assert.deepEqual(newCategory["Entradas y sopas"], [], "new categories start empty");
assert.equal(isSafeMenuRevision(menu, newCategory), true, "owner may safely publish one empty category");
assert.equal(Object.hasOwn(menu, "Entradas y sopas"), false, "category edit never mutates source");
assert.throws(() => addMenuCategory(menu, "bebidas"), /duplicado/i, "case-insensitive duplicate rejected");
assert.throws(() => addMenuCategory(menu, "__proto__"), /inválido/i, "prototype pollution blocked");
assert.equal(isSafeMenuRevision(menu, addMenuCategory(newCategory, "Postres")), false,
  "at most one added category per publication");
const populatedNewCategory = addMenuProduct(newCategory, "Entradas y sopas", {
  id: "prod-web-00000000-0000-4000-8000-000000000101",
  name: "Sancocho", description: "Tradicional", price: 45, station: "kitchen",
});
assert.equal(isSafeMenuRevision(menu, populatedNewCategory), true,
  "new category may contain a validated new dish and preserve existing products");
assert.ok(summarizeMenuChanges(menu, populatedNewCategory).some((event) =>
  event.kind === "product_added" && event.productName === "Sancocho"));
assert.deepEqual(undoMenuProductChange(menu, populatedNewCategory, "Entradas y sopas",
  "prod-web-00000000-0000-4000-8000-000000000101"), newCategory,
  "undoing a new product leaves the newly drafted category untouched");
assert.equal(isSafeMenuRevision(menu, { "PLATOS PRINCIPALES": [], "Entradas y sopas": menu.BEBIDAS }), false,
  "existing populated categories cannot disappear");
assert.throws(() => removeEmptyMenuCategory(menu, "BEBIDAS"), /vacías/i,
  "cannot delete a populated category");
const removedNewEmptyCategory = removeEmptyMenuCategory(newCategory, "Entradas y sopas");
assert.equal(isSafeMenuRevision(menu, removedNewEmptyCategory), true, "create then remove is a no-op");
assert.equal(isSafeMenuRevision(menu, { ...menu, "Entradas y sopas": [], "Nueva categoría 2": [] }), false,
  "unsafe extra categories cannot be smuggled in");

const reorderedMenu = {
  BEBIDAS: menu.BEBIDAS.map(({ station, available, price, name, id, ...rest }) => ({
    ...rest, station, available, price, name, id,
  })),
  "PLATOS PRINCIPALES": menu["PLATOS PRINCIPALES"].map(
    ({ modifiers, translations, station, available, price, description, name, id, imageUrl }) => ({
      imageUrl, id, translations: {
        en: translations.en,
        pl: { description: translations.pl.description, name: translations.pl.name },
      },
      name, station, description, price, modifiers, available,
    }),
  ),
};
assert.notEqual(JSON.stringify(menu), JSON.stringify(reorderedMenu),
  "fixture must reproduce PostgreSQL JSONB-style key reordering");
assert.equal(areMenuSnapshotsEqual(menu, reorderedMenu), true,
  "key order across categories, products and translation fields is not a real editor change");
assert.equal(canonicalMenuSnapshot(menu), canonicalMenuSnapshot(reorderedMenu),
  "the canonical snapshot should ignore only object-key ordering");
assert.equal(menuDraftFingerprint(menu, 15), menuDraftFingerprint(reorderedMenu, 15),
  "owner review fingerprint must be stable through JSONB key reorder");
assert.notEqual(menuDraftFingerprint(menu, 15), menuDraftFingerprint(reorderedMenu, 16),
  "a server revision advance requires a NEW owner review even with identical content");
assert.equal(isConfirmedMenuSave(menu, reorderedMenu, 14, 15), true,
  "readback confirms persisted data across harmless JSONB ordering changes");
assert.equal(areMenuSnapshotsEqual(menu, changed), false,
  "an actual price/photo/availability change must still count as dirty");
assert.notEqual(menuDraftFingerprint(menu, 14), menuDraftFingerprint(changed, 14),
  "a price change invalidates the previously reviewed fingerprint");
assert.equal(areMenuSnapshotsEqual(menu, { ...menu, BEBIDAS: [
  { ...menu.BEBIDAS[0], station: "kitchen" },
] }), false, "changing protected kitchen stations must still be detected");
const productsReverse = normalizeMenu({ MAIN: [
  { id: "p1", name: "Plato uno", price: 10, available: true, station: "kitchen" },
  { id: "p2", name: "Plato dos", price: 20, available: true, station: "kitchen" },
] });
assert.ok(productsReverse);
assert.equal(areMenuSnapshotsEqual(productsReverse, { MAIN: [...productsReverse.MAIN].reverse() }), false,
  "product ARRAY ordering remains significant");
assert.equal(isConfirmedMenuSave(changed, JSON.parse(JSON.stringify(changed)), 12, 13), true,
  "read-back with advanced revision confirms actual persisted menu");
assert.equal(classifyMenuSaveOutcome(changed, 12, changed, 13), "confirmed",
  "verified readback proves the data was saved even when the RPC response is ambiguous");
assert.equal(classifyMenuSaveOutcome(changed, 12, null, null), "unverified",
  "a failed server read cannot justify retrying or declaring success");
assert.equal(classifyMenuSaveOutcome(changed, 12, changed, 12), "unverified",
  "stale readback does not establish a successful save");
assert.equal(classifyMenuSaveOutcome(changed, 12, menu, 13), "concurrent_change",
  "revision advance with different content indicates conflict or transformed write");
assert.equal(classifyMenuSaveOutcome(changed, 12, changed, 11), "unverified",
  "lower revision is never accepted");
assert.equal(classifyMenuSaveOutcome(changed, 12, changed, Number.NaN), "unverified",
  "invalid revisions must never pass a save guard");
assert.equal(isConfirmedMenuSave(changed, JSON.parse(JSON.stringify(changed)), 12, 12), false,
  "a stale read cannot claim the menu was saved");
assert.equal(isConfirmedMenuSave(changed, JSON.parse(JSON.stringify(changed)), 12, 11), false,
  "a lower revision cannot confirm a write");
assert.equal(isConfirmedMenuSave(changed, menu, 12, 13), false,
  "successful RPC with unchanged persisted prices must not show a false success");
assert.equal(isConfirmedMenuSave(changed, {
  ...changed, "PLATOS PRINCIPALES": [{...changed["PLATOS PRINCIPALES"][0], station: "bar"}],
}, 12, 13), false, "saving must preserve kitchen stations");
assert.equal(isConfirmedMenuSave(changed, {
  BEBIDAS: changed.BEBIDAS,
  "PLATOS PRINCIPALES": changed["PLATOS PRINCIPALES"].map(product => ({
    modifiers: product.modifiers,
    translations: product.translations,
    station: product.station,
    imageUrl: product.imageUrl,
    available: product.available,
    price: product.price,
    description: product.description,
    name: product.name,
    id: product.id,
  })),
}, 12, 13), true, "JSONB object-key reordering is not a failed save");
const translated = updateProduct(menu, "PLATOS PRINCIPALES", "prod-bandeja", {
  translations: {
    pl: { name: "Kolumbijska bandeja paisa", description: "Kolumbijskie danie" },
    en: { name: "Colombian bandeja paisa", description: "Traditional mixed plate" },
    es: { name: "Bandeja paisa", description: "Plato tradicional de Colombia" },
  },
});
assert.equal(isSafeMenuRevision(menu, translated), true, "language edits may pass without changing stations");
assert.equal(getProductTranslation(translated["PLATOS PRINCIPALES"][0], "pl").name,
  "Kolumbijska bandeja paisa", "Polish translation is saved into draft");
assert.equal(getProductTranslation(menu["PLATOS PRINCIPALES"][0], "pl").name,
  "Bandeja", "original menu remains intact");
assert.equal(translated["PLATOS PRINCIPALES"][0].modifiers[0],
  "extra-arepa", "existing modifiers are not lost");
assert.equal(getProductTranslation(menu["PLATOS PRINCIPALES"][0], "es").name,
  "", "missing Spanish translation is not fabricated");

const withFutureFields = normalizeMenu({
  MAIN: [{ ...original["PLATOS PRINCIPALES"][0], translations: {
    pl: { name: "Bandeja", description: "Tradycyjna", specialIngredient: "sos" },
    fr: { name: "Plateau", description: "Traditionnel" },
  } }],
});
assert.ok(withFutureFields);
const preserved = updateProduct(withFutureFields, "MAIN", "prod-bandeja", {
  translations: { pl: { name: "Bandeja paisa z Kolumbii", description: "Tradycyjna" } },
});
assert.equal(isSafeMenuRevision(withFutureFields, preserved), true);
assert.equal(preserved.MAIN[0].translations.pl.specialIngredient, "sos");
assert.equal(preserved.MAIN[0].translations.fr.name, "Plateau");
const tampered = {
  ...preserved,
  MAIN: [{ ...preserved.MAIN[0], translations: {
    ...preserved.MAIN[0].translations,
    fr: { name: "Malicious", description: "Overwritten" },
  } }],
};
assert.equal(isSafeMenuRevision(withFutureFields, tampered), false,
  "edits to unsupported languages remain forbidden");
assert.throws(() => updateProduct(menu, "PLATOS PRINCIPALES", "prod-bandeja", {
  translations: { pl: { name: "x".repeat(161), description: "" } },
}), /demasiado/);


assert.equal(isSafeMenuRevision(menu, { BEBIDAS: [] }), false);
assert.equal(isSafeMenuRevision(menu, {
  ...changed,
  BEBIDAS: [],
}), true, "one intentional deletion from a category is allowed");

const malicious = {
  ...changed,
  "PLATOS PRINCIPALES": [{...changed["PLATOS PRINCIPALES"][0], station: "cashier"}],
};
assert.equal(isSafeMenuRevision(menu, malicious), false, "kitchen station must not change");
assert.equal(normalizeMenu({
  A: [{ id: "x", name: "X", price: 10, available: true }],
  B: [{ id: "x", name: "Duplicate", price: 10, available: true }],
}), null, "duplicate product IDs blocked");

assert.ok(normalizeMenu({ "Precios": [{ id: "p", name: "Precio en céntimos", price: 0.29, available: true }] }), "decimal currency precision");
const makeId = (suffix) => `prod-web-00000000-0000-4000-8000-${suffix}`;
const createFields = (id, name) => ({
  id, name, description: "Hecho en casa", price: 0.29, station: "kitchen",
});
const firstAdded = addMenuProduct(menu, "BEBIDAS",
  createFields(makeId("000000000001"), "Limonada colombiana"));
const translatedAtCreation = addMenuProduct(menu, "BEBIDAS", {
  ...createFields(makeId("000000000023"), "Limonada colombiana"),
  translations: {
    pl: { name: "Kolumbijska lemoniada", description: "Orzeźwiająca cytryna" },
    es: { name: "Limonada colombiana", description: "Limón natural y agua" },
    en: { name: "Colombian lemonade", description: "Fresh lemonade" },
  },
});
const newTranslated = translatedAtCreation.BEBIDAS[1];
assert.deepEqual(newTranslated.translations, {
  es: { name: "Limonada colombiana", description: "Limón natural y agua" },
  pl: { name: "Kolumbijska lemoniada", description: "Orzeźwiająca cytryna" },
  en: { name: "Colombian lemonade", description: "Fresh lemonade" },
}, "all three owner-edited translations are included when adding a new product, without fabricated text");
assert.equal(isSafeMenuRevision(menu, translatedAtCreation), true,
  "creating a product with authentic PL/ES/EN translations satisfies the existing owner RPC guard");
assert.equal(newTranslated.price, 0.29, "translation creation preserves exact original item price");
assert.equal(newTranslated.station, "kitchen", "translation creation preserves kitchen routing");
assert.equal(menu.BEBIDAS.length, 1, "trilingual creation never mutates real menu snapshot");
assert.throws(() => addMenuProduct(menu, "BEBIDAS", {
  ...createFields(makeId("000000000024"), "Arepa"),
  translations: { de: { name: "Unsafe", description: "" } },
}), /traducciones/i, "unknown language keys cannot bypass the new-product validator");
assert.throws(() => addMenuProduct(menu, "BEBIDAS", {
  ...createFields(makeId("000000000025"), "Arepa"),
  translations: { pl: { name: "A".repeat(161), description: "" } },
}), /traducciones/i, "unreasonably long translations cannot enter owner drafts");
const duplicatedDish = duplicateMenuProductDraft(
  menu, "PLATOS PRINCIPALES", "prod-bandeja", makeId("000000000044"));
const duplicatedProduct = duplicatedDish["PLATOS PRINCIPALES"][1];
assert.equal(duplicatedProduct.name, "Bandeja paisa (copia)",
  "visible owner label makes the new draft visibly different from existing dish");
assert.equal(duplicatedProduct.id, makeId("000000000044"),
  "copy receives a new collision-resistant ID without reusing the original kitchen identity");
assert.equal(duplicatedProduct.available, false,
  "duplicates start sold out to prevent unintended customer purchases");
assert.equal(duplicatedProduct.price, 60, "copies keep price in PLN for explicit owner review");
assert.equal(duplicatedProduct.station, "kitchen", "copy retains the standard station only");
assert.equal(duplicatedProduct.imageUrl, "", "copy never reuses source photos unintentionally");
assert.equal(duplicatedProduct.description, "Traditional");
assert.deepEqual(duplicatedProduct.translations, {
  es: { name: "Bandeja paisa (copia)", description: "Traditional" },
  pl: { name: "Bandeja (kopia)", description: "Tradycyjna" },
  en: { name: "Bandeja (copy)", description: "" },
}, "existing supported translations copied with distinct draft labels");
assert.equal(duplicatedProduct.modifiers, undefined,
  "operational modifiers and hidden integration metadata must NOT be copied");
assert.equal(menu["PLATOS PRINCIPALES"][0].available, true,
  "creating a new draft never alters the original dish");
assert.deepEqual(menu["PLATOS PRINCIPALES"][0].modifiers, ["extra-arepa"],
  "the existing kitchen modifiers remain untouched");
assert.equal(isSafeMenuRevision(menu, duplicatedDish), true,
  "the usual owner RPC revision validator accepts the staged copy");
assert.throws(() => duplicateMenuProductDraft(
  menu, "PLATOS PRINCIPALES", "prod-bandeja", "prod-bandeja"),
  /ID inválido|duplicado/i, "reusing an ID must be blocked");
assert.throws(() => duplicateMenuProductDraft(
  menu, "PLATOS PRINCIPALES", "missing", makeId("000000000046")),
  /origen/i, "unknown dishes cannot be cloned");
const nonstandardStation = normalizeMenu({
  BEBIDAS: [{ id: "special", name: "Especial", price: 5, available: true, station: "oven" }],
});
assert.ok(nonstandardStation);
assert.throws(() => duplicateMenuProductDraft(
  nonstandardStation, "BEBIDAS", "special", makeId("000000000047")),
  /estación especial/i, "nonstandard station cannot be assigned to a copied dish");
const longTitleSource = normalizeMenu({
  ENTRADAS: [{ id: "long-title", name: "A".repeat(160), price: 8, available: true, station: "bar" }],
});
assert.ok(longTitleSource);
const longNameCopy = duplicateMenuProductDraft(
  longTitleSource, "ENTRADAS", "long-title", makeId("000000000048"));
assert.equal(longNameCopy.ENTRADAS[1].name.length, 160,
  "copy suffix respects strict 160-character names without truncating the suffix");
assert.equal(firstAdded.BEBIDAS.length, 2);
assert.deepEqual(Object.entries(undoMenuProductChange(menu, firstAdded, "BEBIDAS",
  makeId("000000000001"))), Object.entries(menu), "undo a new product without losing stored items");
const withTranslatedNew = updateProduct(firstAdded, "BEBIDAS",
  makeId("000000000001"), {
    translations: {
      pl: { name: "Kolumbijska lemoniada", description: "Cytryna i woda" },
      en: { name: "Colombian lemonade", description: "Refreshing citrus" },
    },
  });
assert.equal(isSafeMenuRevision(menu, withTranslatedNew), true,
  "new products may be translated before the first save");

assert.equal(isSafeMenuRevision(menu, firstAdded), true, "one creation is safe");
assert.equal(menu.BEBIDAS.length, 1, "source menu remains unchanged");
const secondAdded = addMenuProduct(firstAdded, "BEBIDAS",
  createFields(makeId("000000000002"), "Limonada de coco"));
const thirdAdded = addMenuProduct(secondAdded, "BEBIDAS",
  createFields(makeId("000000000003"), "Jugo de mora"));
assert.equal(isSafeMenuRevision(menu, thirdAdded), true);
const fourthAdded = addMenuProduct(thirdAdded, "BEBIDAS",
  createFields(makeId("000000000004"), "Extra"));
assert.equal(isSafeMenuRevision(menu, fourthAdded), false, "max 3 additions per save");
assert.throws(() => addMenuProduct(menu, "BEBIDAS",
  createFields("not-a-uuid", "Bad ID")), /inválido/);
assert.throws(() => addMenuProduct(firstAdded, "BEBIDAS",
  createFields(makeId("000000000001"), "Duplicate")), /duplicado/);

const oneRemoved = removeMenuProduct(menu, "BEBIDAS", "prod-masato");
assert.equal(isSafeMenuRevision(menu, oneRemoved), true, "one removal is safe");
assert.equal(summarizeMenuChanges(menu, oneRemoved)[0].kind, "product_removed",
  "review clearly labels a deleted product");
assert.deepEqual(Object.entries(undoMenuProductChange(menu, oneRemoved, "BEBIDAS", "prod-masato")),
  Object.entries(menu), "restore a deleted product at its original relative position");
const originalThree = normalizeMenu({ MAIN: [
  { id: "a", name: "A", price: 11, available: true, station: "kitchen" },
  { id: "b", name: "B", price: 12, available: true, station: "kitchen" },
  { id: "c", name: "C", price: 13, available: true, station: "kitchen" },
] });
assert.ok(originalThree);
const withMiddleRemoved = removeMenuProduct(originalThree, "MAIN", "b");
assert.deepEqual(undoMenuProductChange(originalThree, withMiddleRemoved, "MAIN", "b")
  .MAIN.map((item) => item.id), ["a", "b", "c"], "restoring a removed item retains relative ordering");
assert.equal(oneRemoved.BEBIDAS.length, 0, "empty category is allowed");
const removedTwice = removeMenuProduct(
  removeMenuProduct(firstAdded, "BEBIDAS", "prod-masato"),
  "PLATOS PRINCIPALES",
  "prod-bandeja",
);
assert.equal(isSafeMenuRevision(menu, removedTwice), false, "two removals are blocked");
assert.throws(() => removeMenuProduct({
  A: [{ id: "only", name: "Only", price: 1, available: true }],
}, "A", "only"), /último producto/);
const addedAndRemoved = removeMenuProduct(firstAdded, "PLATOS PRINCIPALES", "prod-bandeja");
assert.equal(isSafeMenuRevision(menu, addedAndRemoved), true, "1 add + 1 removal");
assert.equal(isSafeMenuRevision(menu, {
  ...menu, "PLATOS PRINCIPALES": [...menu["PLATOS PRINCIPALES"], {
    id: makeId("000000000005"), name: "Malicious", price: 1,
    available: true, station: "cashier",
  }],
}), false, "unsupported new product station blocked");
assert.equal(normalizeMenu(JSON.parse('{"__proto__":[]}')), null, "prototype pollution blocked");

assert.equal(validProductImageUrl("https://example.com/image.jpg"), true);
assert.equal(validProductImageUrl(["java", "script:alert(1)"].join("")), false);
assert.equal(validProductImageUrl("http://example.com"), false);
assert.equal(validProductImageUrl("https://u:p@example.com"), false);

assert.equal(detectProductImageMime(new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
])), "image/png");
assert.equal(detectProductImageMime(new Uint8Array([
  0xff, 0xd8, 0xff, 0x00, 0, 0, 0, 0, 0, 0, 0, 0,
])), "image/jpeg");
assert.equal(detectProductImageMime(new Uint8Array([
  82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80,
])), "image/webp");
assert.equal(detectProductImageMime(new Uint8Array(16)), null);

const catalogProduct = {
  id: "dish-1", category: "MAIN", name: "Bandeja paisa",
  description: "Descripción en español", price: 60,
  available: true, imageUrl: null, station: "kitchen",
  translations: {
    pl: { name: "Kolumbijska bandeja paisa", description: "Tradycyjne danie" },
    en: { name: "Colombian platter", description: "" },
  },
};
assert.equal(localizeRcOrderaProduct(catalogProduct, "pl").name,
  "Kolumbijska bandeja paisa", "Polish dish label is displayed");
assert.equal(localizeRcOrderaProduct(catalogProduct, "pl").description,
  "Tradycyjne danie", "Polish description is displayed");
assert.equal(localizeRcOrderaProduct(catalogProduct, "en").name,
  "Colombian platter", "English dish label is displayed");
assert.equal(localizeRcOrderaProduct(catalogProduct, "en").description,
  "", "Missing English description is not silently replaced with Spanish text");
assert.equal(localizeRcOrderaProduct(catalogProduct, "es").name,
  "Bandeja paisa", "No Spanish translation => use original name");
assert.equal(catalogProduct.name, "Bandeja paisa",
  "Localization never mutates the source product");
const localizedCategories = localizeRcOrderaCategories([
  { name: "PLATOS", products: [catalogProduct] },
], "pl");
assert.equal(localizedCategories[0].products[0].name, "Kolumbijska bandeja paisa");
assert.equal(localizedCategories[0].products[0].price, 60,
  "Published original prices must survive localization");
assert.equal(localizeRcOrderaProduct({
  ...catalogProduct,
  translations: { pl: { name: " ", description: "Fake" } },
}, "pl").name, "Bandeja paisa", "Blank translations never override real dish names");


const editorBase = menu["PLATOS PRINCIPALES"][0];
const unchangedFields = {
  name: "Bandeja paisa",
  description: "Traditional",
  priceText: "60,00",
  available: true,
  imageUrl: "",
  translations: {
    pl: { name: "Bandeja", description: "Tradycyjna" },
    es: { name: "", description: "" },
    en: { name: "Bandeja", description: "" },
  },
};
assert.equal(hasUnappliedProductChanges(editorBase, unchangedFields), false,
  "Formatted money without a real price change must not show pending edits");
assert.equal(hasUnappliedProductChanges(editorBase, {
  ...unchangedFields, name: "Nueva bandeja",
}), true, "An unapplied product title must be detected before changing products");
assert.equal(hasUnappliedProductChanges(editorBase, {
  ...unchangedFields, priceText: "NaN",
}), true, "Invalid in-progress price is still an unapplied edit");
assert.equal(hasUnappliedProductChanges(editorBase, {
  ...unchangedFields, available: false,
}), true, "Unchecked product availability is a real unapplied edit");
assert.equal(hasUnappliedProductChanges(editorBase, {
  ...unchangedFields, translations: {
    ...unchangedFields.translations,
    en: { name: "Colombian platter", description: "" },
  },
}), true, "Changing a translation must protect pending input");
assert.equal(hasUnappliedProductChanges(editorBase, {
  ...unchangedFields, imageUrl: "https://example.com/new-photo.jpg",
}), true, "Photo URL change must be applied before changing products");
const emptyNewProductForm = { name: "", description: "", priceText: "", station: "kitchen" };
assert.equal(hasUnappliedNewProductFields(emptyNewProductForm), false,
  "freshly opened new-product form is safe to navigate away from");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, name: " Arepa " }), true,
  "new product name typed but not added must block navigation");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, priceText: "0" }), true,
  "even a free-price draft is meaningful unsaved text");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, description: "Queso" }), true,
  "new-product description must not disappear on reload");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, station: "bar" }), true,
  "an unsubmitted station edit is an unsaved form change");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, translations: {
  pl: { name: " Nowy produkt ", description: "" },
} }), true, "typing only a Polish translation must block unsaved navigation");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, translations: {
  en: { name: "", description: "Traditional drink" },
} }), true, "typing only a translated description must block reload, logout and navigation");
assert.equal(hasUnappliedNewProductFields({ ...emptyNewProductForm, translations: {
  es: { name: " ", description: "" },
} }), false, "whitespace-only translation entries are not meaningful edits");
const { readFile } = await import("node:fs/promises");
const managerSource = await readFile("src/components/admin/RcOrderaMenuManager.tsx", "utf8");
for (const guard of [
  "hasUnappliedProductChanges(product",
  "onUnappliedChange={reportUnappliedChanges}",
  "unappliedChanges",
  "setErrorMessage(unappliedWarning)",
  "onUnappliedChange(false)",
  "setPendingLogout(true)",
  "pendingLogout && (hasUnappliedInputs || dirty)",
  "newProductFormHasInput(form",
  "readNewProductTranslations(values)",
  "translation-${locale}-name",
  "translation-${locale}-description",
  "translations: readNewProductTranslations(fields)",
  "Traducciones del producto nuevo · Polski / Español / English",
  "onInput={(event) => onUnappliedChange(newProductFormHasInput",
  "onUnappliedChange={setNewProductFormDirty}",
  "hasUnappliedInputs = unappliedChanges || newProductFormDirty",
  "setNewProductFormDirty(false)",
  "disabled={(!dirty && !hasUnappliedInputs) || busy}",
  "createCategory(event",
  "searchMenuProducts(draft, productSearch)",
  "function toggleAvailability(categoryName: string, id: string)",
  "function duplicateProduct(product: RcMenuProduct)",
  "duplicateMenuProductDraft(draft, activeCategory, product.id, newId)",
  "Duplicar plato · borrador agotado",
  "selected.station !== \"kitchen\" && selected.station !== \"bar\"",
  "setReviewedDraftFingerprint(null)",
  "updateProduct(draft, categoryName, id, { available: !current.available })",
  "if (!isSafeMenuRevision(original, next))",
  "setServerSnapshotEpoch((epoch) => epoch + 1)",
  "disabled={busy || hasUnappliedInputs || verificationUncertain}",
  "Marcar agotado · borrador",
  "Marcar disponible · borrador",
  "Vista previa · borrador local",
  "Comprueba los textos en los tres idiomas",
  "getMenuLocalePreview(selected, locale)",
  "auditMenuTranslations(draft, 24, translationReviewPage * 24)",
  "Páginas de traducciones pendientes",
  "24 siguientes →",
  "← 24 anteriores",
  "setTranslationReviewPage(0)",
  "incompleteProducts <= translationReviewPage * 24",
  "Revisión de traducciones del menú",
  "Productos pendientes de traducción",
  "setProductId(item.productId)",
  "setTranslationReviewLocale(null)",
  "disabled={busy || hasUnappliedInputs}",
  "Sin nombre traducido: se muestra el original.",
  "Falta descripción traducida.",
  "Imagen del borrador:",
  "Fotografía pendiente de aplicar",
  "validProductImageUrl(imageUrl.trim())",
  "referrerPolicy=\"no-referrer\"",
  "Revisa los cambios antes de guardar",
  "Confirmar y guardar en RC ORDERA",
  "reviewedDraftFingerprint === currentDraftFingerprint",
  "menuDraftFingerprint(draft, revision)",
  "areMenuSnapshotsEqual(current.menu, original)",
  "areMenuSnapshotsEqual(original, draft)",
  "setVerificationUncertain(true)",
  "if (verificationUncertain)",
  "undoMenuProductChange(original, draft, categoryName, id)",
  "menuChanges.slice(0, 100)",
  "menuChanges.length > 100",
  "disabled={!dirty || hasUnappliedInputs || busy || verificationUncertain || menuChanges.length > 100}",
  "publishedSelected.price !== selected.price",
  "setDraft(updateProduct(draft, activeCategory, id, data))",
  "removeEmptyMenuCategory(draft, activeCategory)",
  "classifyMenuSaveOutcome(",
  "setVerificationUncertain(true)",
  "rpcError = \"NETWORK_UNCERTAIN\"",
  "setVerificationUncertain(false)",
  "Descargar borrador sin publicar",
  "Recuperar borrador JSON",
  "restoreUnpublishedMenuDraft(parsed, current.menu, current.revision, config.restaurantId)",
  "current.revision !== revision",
  "newCategoryName.trim().length > 0",
  "setNewCategoryName(\"\")",
  "if (unappliedChanges || newProductFormDirty)",
  "UNPUBLISHED_DRAFT",
  "hasUnappliedInputs || revision === null || busy",
  "Descargar copia del servidor",
  "applied-but-unpublished menu edits",
  "Sí, desconectar y descartar",
]) {
  assert.ok(managerSource.includes(guard), `Missing unsaved-editor UX guard: ${guard}`);
}
console.log("PASS: un-applied product form fields protected independently of the RC ORDERA server menu draft");
console.log("PASS: menu editing preserves product IDs/metadata, validates prices and image signatures");
