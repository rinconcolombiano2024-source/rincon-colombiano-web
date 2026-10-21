import assert from "node:assert/strict";
import { localizeRcOrderaCategories, localizeRcOrderaProduct } from "../src/integrations/rc-ordera/localize-catalog.ts";
import {
  addMenuProduct, removeMenuProduct,
  detectProductImageMime, isSafeMenuRevision, isConfirmedMenuSave,
  getProductTranslation, hasUnappliedProductChanges,
  normalizeMenu, updateProduct, validProductImageUrl,
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
assert.equal(isConfirmedMenuSave(changed, JSON.parse(JSON.stringify(changed)), 12, 13), true,
  "read-back with advanced revision confirms actual persisted menu");
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
const { readFile } = await import("node:fs/promises");
const managerSource = await readFile("src/components/admin/RcOrderaMenuManager.tsx", "utf8");
for (const guard of [
  "hasUnappliedProductChanges(product",
  "onUnappliedChange={reportUnappliedChanges}",
  "unappliedChanges",
  "setErrorMessage(unappliedWarning)",
  "onUnappliedChange(false)",
  "setPendingLogout(true)",
  "isConfirmedMenuSave(draft, current.menu, revision, current.revision)",
  "applied-but-unpublished menu edits",
  "Sí, desconectar y descartar",
]) {
  assert.ok(managerSource.includes(guard), `Missing unsaved-editor UX guard: ${guard}`);
}
console.log("PASS: un-applied product form fields protected independently of the RC ORDERA server menu draft");
console.log("PASS: menu editing preserves product IDs/metadata, validates prices and image signatures");
