import assert from "node:assert/strict";
import {
  addMenuProduct, removeMenuProduct,
  detectProductImageMime, isSafeMenuRevision,
  getProductTranslation,
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

console.log("PASS: menu editing preserves product IDs/metadata, validates prices and image signatures");
