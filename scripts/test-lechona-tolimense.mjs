import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  localizeRcOrderaCategories,
  localizeRcOrderaProduct,
} from "../src/integrations/rc-ordera/localize-catalog.ts";

const product = {
  id: "rc-ordera-original-product-id",
  category: "Platos típicos",
  name: "Lechón",
  description: "Cerdo tradicional",
  price: 40,
  available: true,
  imageUrl: "https://images.example/lechona.webp",
  station: "hot-kitchen",
  translations: {
    pl: { name: "Lechon", description: "Wieprzowina z groszkiem" },
    es: { name: "Lechón", description: "Cerdo con arveja" },
    en: { name: "Roast pork", description: "Traditional pork dish" },
  },
};

test("legacy lechón always displays the commercial name Lechona Tolimense in all languages", () => {
  for (const locale of ["pl", "es", "en"]) {
    const copy = structuredClone(product);
    const result = localizeRcOrderaProduct(copy, locale);
    assert.equal(result.name, "Lechona Tolimense", locale);
    assert.equal(result.description, product.translations[locale].description);
    assert.equal(result.id, product.id);
    assert.equal(result.price, 40);
    assert.equal(result.station, "hot-kitchen");
    assert.equal(result.imageUrl, product.imageUrl);
    assert.equal(result.available, true);
    assert.equal(result.category, product.category);
    assert.deepEqual(copy, product, "No source catalog mutation");
  }
});

test("only the exact historic dish label is corrected; never rewrite unrelated pork dishes", () => {
  for (const title of ["Lechón", "LECHON", "Lechona", "lechona tolimense", "Lechón Tolimense"]) {
    const actual = localizeRcOrderaProduct({
      ...product,
      name: title,
      translations: undefined,
    }, "pl");
    assert.equal(actual.name, "Lechona Tolimense", title);
    assert.equal(actual.description, product.description, "Original description preserved without translation");
  }

  for (const title of [
    "Lechón al horno", "Lechón 300 g", "Lechona vegetariana",
    "Chicharrón", "Tamal Tolimense",
  ]) {
    assert.equal(
      localizeRcOrderaProduct({
        ...product,
        name: title,
        translations: undefined,
      }, "es").name,
      title,
      "Other products must not be renamed",
    );
  }
});

test("incorrect name in an individual locale translation is also corrected", () => {
  const changed = localizeRcOrderaProduct({
    ...product,
    name: "Special dish",
    translations: {
      es: { name: "Lechón", description: "Real Colombian specialty" },
    },
  }, "es");
  assert.equal(changed.name, "Lechona Tolimense");
  assert.equal(changed.id, product.id);
});

test("localized menu keeps exact product identifiers and avoids duplicates", () => {
  const original = [{ name: "Típicos", products: [product, {
    ...product, id: "another-id", name: "Tamal Tolimense",
  }] }];
  for (const locale of ["pl", "es", "en"]) {
    const result = localizeRcOrderaCategories(original, locale);
    assert.equal(result.length, 1);
    assert.equal(result[0].products.length, 2);
    assert.equal(result[0].products[0].name, "Lechona Tolimense");
    assert.equal(result[0].products[0].id, product.id);
    assert.equal(result[0].products[1].id, "another-id");
    assert.equal(result[0].products[1].name, "Tamal Tolimense");
  }
});

test("all three branded homepages and featured menu use the full official dish name", () => {
  const home = readFileSync("src/app/[locale]/page.tsx", "utf8");
  const menu = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.equal((home.match(/title:\s*"Lechona Tolimense"/g) ?? []).length, 3);
  assert.equal((menu.match(/name:\s*"Lechona Tolimense"/g) ?? []).length, 3);
  assert.doesNotMatch(home, /title:\s*"Lechona"/);
});
