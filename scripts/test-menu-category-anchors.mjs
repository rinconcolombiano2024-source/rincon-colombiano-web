import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { withMenuCategoryAnchors } from "../src/integrations/rc-ordera/menu-category-anchors.ts";
import { localizeRcOrderaCategoryName, localizeRcOrderaProduct } from "../src/integrations/rc-ordera/localize-catalog.ts";

test("preserve current first category bookmarks and unique suffix collisions", () => {
  const entries = [
    { name: "Empanadas", productIds: ["a"] },
    { name: "Empanadas!", productIds: ["b"] },
    { name: "Empanadas 2", productIds: ["c"] },
    { name: "Empanadas", productIds: ["d"] },
  ];
  const output = withMenuCategoryAnchors(entries);
  assert.deepEqual(output.map((c) => c.anchorId), [
    "category-empanadas",
    "category-empanadas-2",
    "category-empanadas-2-2",
    "category-empanadas-3",
  ]);
  assert.deepEqual(output.map((c) => c.productIds), entries.map((c) => c.productIds));
  assert.deepEqual(entries.map((c) => Object.keys(c).sort()), Array(4).fill(["name", "productIds"]));
});

test("translated labels and empty symbols never duplicate or lose products", () => {
  const output = withMenuCategoryAnchors([
    { name: "Café", products: [1] },
    { name: "Cafe", products: [2] },
    { name: "🥟", products: [3] },
    { name: "☕", products: [4] },
    { name: "Tamal Tolimense", products: [5] },
  ]);
  assert.deepEqual(output.map((entry) => entry.anchorId), [
    "category-cafe",
    "category-cafe-2",
    "category-menu",
    "category-menu-2",
    "category-tamal-tolimense",
  ]);
  assert.equal(new Set(output.map((entry) => entry.anchorId)).size, output.length);
  assert.deepEqual(output.map((entry) => entry.products), [[1], [2], [3], [4], [5]]);
});

test("menu uses the same unique ID for category controls and destinations", () => {
  const page = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.match(page, /withMenuCategoryAnchors\(/);
  assert.match(page, /id:\s*category\.anchorId/);
  const browser = readFileSync("src/components/commercial/MenuCategoryBrowser.tsx", "utf8");
  assert.match(browser, /aria-controls=\{`menu-panel-\$\{index\}`\}/);
  assert.match(browser, /id=\{`menu-panel-\$\{index\}`\}/);
  assert.match(browser, /aria-pressed=\{selected === index\}/);
  assert.match(page, /id=\{\s*category\.anchorId\s*\}/);
  assert.match(browser, /key=\{category\.id\}/);
  assert.doesNotMatch(page, /buildCategoryId\(/);
});

test("official RC ORDERA categories import into the web with real PL/ES/EN labels", () => {
  const cases = {
    "BEBIDAS": ["Napoje", "Bebidas", "Drinks"],
    "COMBOS": ["Zestawy", "Combos", "Combos"],
    "ENTRADAS": ["Przystawki", "Entradas", "Starters"],
    "PLATOS PRINCIPALES": ["Dania główne", "Platos principales", "Main courses"],
    "Porciones": ["Porcje", "Porciones", "Side portions"],
  };
  for (const [original, names] of Object.entries(cases)) {
    for (const [i, locale] of ["pl", "es", "en"].entries()) {
      assert.equal(localizeRcOrderaCategoryName(original, locale), names[i],
        `official source category ${original} must have ${locale} public label`);
    }
  }
  assert.equal(localizeRcOrderaCategoryName("NUEVA CATEGORÍA", "pl"), "NUEVA CATEGORÍA",
    "CEO-created names not yet translated must be displayed honestly, not guessed");
});

test("public imported menu preserves permanent RC ORDERA anchors, IDs, prices and stock filters", () => {
  const source = [
    { name: "ENTRADAS", products: [
      { id: "id-original", name: "Empanada", price: 12, available: true,
        description: "Hecha en casa",
        translations: { pl: { name: "Empanada kolumbijska", description: "Domowa" } } },
      { id: "sold-out", name: "Agotado", price: 12, available: false, description: "" },
    ] },
    { name: "BEBIDAS", products: [
      { id: "id-drink", name: "Masato", price: 15, available: true, description: "" },
    ] },
  ];
  const anchors = withMenuCategoryAnchors(source);
  for (const locale of ["pl", "es", "en"]) {
    const imported = anchors.map((category) => ({
      ...category,
      name: localizeRcOrderaCategoryName(category.name, locale),
      products: category.products
        .filter((product) => product.available)
        .map((product) => localizeRcOrderaProduct(product, locale)),
    }));
    assert.deepEqual(imported.map((c) => c.anchorId),
      ["category-entradas", "category-bebidas"],
      "bookmarks must not change when visitor changes language");
    assert.equal(imported[0].products[0].id, "id-original");
    assert.equal(imported[0].products[0].price, 12);
    assert.equal(imported[0].products.length, 1,
      "unavailable products stay excluded from the commercial menu");
    assert.equal(imported[1].products[0].id, "id-drink");
    assert.equal(imported[1].products[0].price, 15);
  }
  assert.equal(source[0].name, "ENTRADAS",
    "the live source category must never be rewritten");
  assert.equal(source[0].products.length, 2,
    "no products should be changed in the RC ORDERA catalog");
});

test("the public page imports RC ORDERA directly rather than maintaining a parallel CMS menu", () => {
  const page = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.match(page, /getRcOrderaPublicCatalog\("czapelska"\)/);
  assert.match(page, /withMenuCategoryAnchors\(catalog\.categories\)/);
  assert.match(page, /localizeRcOrderaCategoryName\(category\.name, locale\)/);
  assert.match(page, /filter\(\(product\) => product\.available\)/);
  assert.match(page, /localizeRcOrderaProduct\(product, locale\)/);
  assert.match(page, /productos disponibles importados directamente/);
  const admin = readFileSync("src/app/(system)/admin/menu/page.tsx", "utf8");
  assert.match(admin, /Ver menú importado en nuestra web/);
  assert.match(admin, /Comparar con menú original RC ORDERA/);
});
