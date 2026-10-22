import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { withMenuCategoryAnchors } from "../src/integrations/rc-ordera/menu-category-anchors.ts";
import { resolveImportedMenuCategoryHash } from "../src/integrations/rc-ordera/menu-category-hash.ts";
import { orderImportedMenuCategories } from "../src/integrations/rc-ordera/customer-menu-order.ts";
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

test("show customer-friendly RC ORDERA category order, without touching product IDs or source", () => {
  const source = [
    { name: "BEBIDAS", products: ["drink-1"] },
    { name: "COMBOS", products: ["combo-1"] },
    { name: "NUEVA CATEGORÍA", products: ["custom-1"] },
    { name: "Porciones", products: ["side-1"] },
    { name: "PLATOS PRINCIPALES", products: ["dish-1"] },
    { name: "ENTRADAS", products: ["starter-1"] },
    { name: "POSTRES NUEVOS", products: ["dessert-1"] },
  ];
  // Anchors are computed before presentation sorting so bookmarked URLs and
  // collision suffixes remain independent of how tabs are displayed.
  const originalAnchors = withMenuCategoryAnchors(source);
  const sorted = orderImportedMenuCategories(originalAnchors);
  assert.deepEqual(sorted.map((c) => c.name), [
    "ENTRADAS", "PLATOS PRINCIPALES", "BEBIDAS",
    "COMBOS", "Porciones", "NUEVA CATEGORÍA", "POSTRES NUEVOS",
  ]);
  assert.deepEqual(sorted.map((c) => c.products), [
    ["starter-1"], ["dish-1"], ["drink-1"], ["combo-1"],
    ["side-1"], ["custom-1"], ["dessert-1"],
  ], "source product arrays and operational IDs must never be rearranged");
  assert.deepEqual(originalAnchors.map((c) => c.name), source.map((c) => c.name),
    "the sorting helper must not mutate the Supabase catalog");
  assert.equal(sorted.find((c) => c.name === "ENTRADAS").anchorId, "category-entradas",
    "old menu bookmarks are preserved");

  const repeated = orderImportedMenuCategories([
    { name: "postres nuevos", id: "first" },
    { name: "ENTRADAS", id: "starter" },
    { name: "POSTRES NUEVOS", id: "second" },
  ]);
  assert.deepEqual(repeated.map((c) => c.id), ["starter", "first", "second"],
    "new unknown categories keep their original relative positions");
});

test("all PL/ES/EN menus sort original keys before translating labels", () => {
  const page = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.match(page, /orderImportedMenuCategories\(withMenuCategoryAnchors\(catalog\.categories\)\)/);
  assert.match(page, /localizeRcOrderaCategoryName\(category\.name, locale\)/);
  assert.match(page, /filter\(\(product\) => product\.available\)/);
});

test("real menu bookmarks activate only known safe category tabs", () => {
  const categories = [
    { id: "category-entradas" },
    { id: "category-platos-principales" },
    { id: "category-bebidas" },
  ];
  assert.equal(resolveImportedMenuCategoryHash("#category-bebidas", categories),
    "category-bebidas", "direct link must open the beverage tab");
  assert.equal(resolveImportedMenuCategoryHash("#category-platos-principales", categories),
    "category-platos-principales");
  for (const invalid of ["", "#", "#missing", "#category-%broken",
    "category-bebidas", "#".concat("X".repeat(350)), "#%3Cscript%3E"]) {
    assert.equal(resolveImportedMenuCategoryHash(invalid, categories), null,
      `malformed or absent fragment ${invalid.slice(0,30)} must not change tabs`);
  }
  assert.equal(resolveImportedMenuCategoryHash("#category-bebidas", []), null,
    "catalog out of stock must not open a hidden or non-existent category");
});

test("mobile customer menu keeps category selection in URL and supports hashchange", () => {
  const widget = readFileSync("src/components/commercial/MenuCategoryBrowser.tsx", "utf8");
  assert.match(widget, /resolveImportedMenuCategoryHash\(window\.location\.hash, categories\)/);
  assert.match(widget, /window\.addEventListener\("hashchange", activateBookmark\)/);
  assert.match(widget, /window\.removeEventListener\("hashchange", activateBookmark\)/);
  assert.match(widget, /window\.history\.replaceState\(window\.history\.state, "", url\.href\)/);
  assert.match(widget, /onClick=\{\(\) => selectCategory\(category\.id\)\}/);
  assert.match(widget, /scrollIntoView\(\{ block: "start" \}\)/);
  assert.match(widget, /aria-pressed=\{selected === index\}/);
});

test("each imported product offers a real pickup order CTA in three languages", () => {
  const page = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.match(page, /href=\{orderHref\} target="_blank" rel="noopener noreferrer"/,
    "product action must use the same official RC ORDERA link as main menu");
  assert.match(page, /aria-label=\{\x60\$\{copy\.orderFromMenu\}: \$\{product\.name\}\x60\}/,
    "buttons remain accessible and identify the actual dish in every language");
  for (const expected of [
    "Zamów na wynos", "Wybierz produkt w RC ORDERA i zapłać w restauracji.",
    "Pedir para recoger", "Elige el producto en RC ORDERA y paga en el restaurante.",
    "Order for pickup", "Choose the item in RC ORDERA and pay at the restaurant.",
  ]) {
    assert.ok(page.includes(expected), `missing customer-facing localized text: ${expected}`);
  }
  assert.match(page, /buildRcOrderaOrderUrl\([\s\S]*?"czapelska"/,
    "all product CTAs must open the stable real restaurant checkout");
  assert.doesNotMatch(page, /product\.id.*searchParams|searchParams.*product\.id/,
    "never fake deep selection of a dish without RC ORDERA platform support");
});
