import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { withMenuCategoryAnchors } from "../src/integrations/rc-ordera/menu-category-anchors.ts";

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
