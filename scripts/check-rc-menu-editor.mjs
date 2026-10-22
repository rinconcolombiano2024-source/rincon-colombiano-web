import assert from "node:assert/strict";
import { localizeRcOrderaCategories, localizeRcOrderaProduct } from "../src/integrations/rc-ordera/localize-catalog.ts";
import {
  addMenuProduct, addMenuCategory, removeEmptyMenuCategory, removeMenuProduct,
  detectProductImageMime, isSafeMenuRevision, isConfirmedMenuSave, classifyMenuSaveOutcome,
  getProductTranslation, hasUnappliedProductChanges, hasUnappliedNewProductFields,
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
  "onInput={(event) => onUnappliedChange(newProductFormHasInput",
  "onUnappliedChange={setNewProductFormDirty}",
  "hasUnappliedInputs = unappliedChanges || newProductFormDirty",
  "setNewProductFormDirty(false)",
  "disabled={(!dirty && !hasUnappliedInputs) || busy}",
  "createCategory(event",
  "searchMenuProducts(draft, productSearch)",
  "Vista previa · borrador local",
  "Revisa los cambios antes de guardar",
  "Confirmar y guardar en RC ORDERA",
  "reviewedDraftFingerprint === draftFingerprint",
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
