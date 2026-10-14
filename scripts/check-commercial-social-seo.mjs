import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = read("src/app/[locale]/page.tsx");
const menu = read("src/app/[locale]/menu/page.tsx");
const restaurant = read("src/app/[locale]/[...slug]/page.tsx");
const assistant = read("src/components/rincon-ai/RinconAiWidget.tsx");
const seo = read("src/config/seo.ts");

test("public menu never exposes internal catalog/connection technology copy", () => {
  assert.doesNotMatch(menu, /"[^"\n]*(?:RC ORDERA|publicznego katalogu|catálogo público|public RC ORDERA catalog)[^"\n]*"/i);
  for (const phrase of [
    "Aktualne menu restauracji",
    "Menú actual del restaurante",
    "Today's restaurant menu",
    "Ostateczną dostępność potwierdzisz",
    "Confirma su disponibilidad",
    "Final availability is confirmed",
  ]) {
    assert.ok(menu.includes(phrase), `Missing PL/ES/EN text: ${phrase}`);
  }
  assert.match(menu, /getRcOrderaPublicCatalog/);
  assert.match(menu, /buildRcOrderaOrderUrl/);
});

test("structured menu offers preserve genuine explicit zero prices without inventing free items", () => {
  const schema = read("src/config/seo-menu.ts");
  const catalog = read("src/integrations/rc-ordera/public-catalog.ts");
  const validation = read("src/integrations/rc-ordera/public-product-safety.ts");
  assert.match(schema, /product\.price\s*>=\s*0/,
    "Real explicitly free menu entries must not vanish from JSON-LD");
  assert.doesNotMatch(schema, /product\.price\s*>\s*0/,
    "Do not contradict genuine zero-PLN offers shown in the public menu");
  assert.match(schema, /product\.available/);
  assert.match(schema, /priceCurrency:\s*"PLN"/);
  assert.match(catalog, /parsePublicMenuPrice\(/);
  assert.match(validation, /if \(!Number\.isFinite\(numberValue\)/,
    "Only normalized valid source prices can reach the public menu and SEO");
});

test("home speaks as a Colombian restaurant in all three languages", () => {
  for (const text of [
    "Kolumbijskie smaki • Warszawa",
    "Sabor colombiano • Varsovia",
    "Colombian flavours • Warsaw",
    "Cocina, cultura y tradición colombiana",
    "Kolumbijska kuchnia, gościnność",
    "Colombian cuisine, warm hospitality",
  ]) {
    assert.ok(home.includes(text), `Missing customer copy: ${text}`);
  }
  assert.doesNotMatch(home, /"[^"\n]*technologia z Warszawy[^"\n]*"/);
  assert.doesNotMatch(home, /"[^"\n]*tecnología colombiana desde Varsovia[^"\n]*"/);
  assert.match(home, /buildRcOrderaOrderUrl/);
});

test("Rincón AI answers do not promise an unfinished AI integration", () => {
  for (const bad of [
    /Gdy połączenie z RC ORDERA/,
    /Cuando la conexión con RC ORDERA/,
    /When the RC ORDERA connection is active/,
    /La capa completa de IA/,
    /The full AI layer grounded/,
    /Pełne odpowiedzi AI/,
  ]) {
    assert.doesNotMatch(assistant, bad);
  }
  for (const good of [
    "programa de puntos y recompensas todavía no está activo",
    "points and rewards programme isn't active yet",
    "Program punktów i nagród nie jest jeszcze aktywny",
  ]) {
    assert.ok(assistant.includes(good));
  }
  assert.match(assistant, /copy\.allergyAnswer/);
  assert.match(assistant, /copy\.safety/);
});

test("SEO honors exact approved location title; structured business identity remains unchanged", () => {
  assert.match(seo, /readonly metadataTitle\?: string/);
  assert.match(seo, /input\.metadataTitle\s*\?\?\s*`\$\{input\.name\} \| \$\{city\}`/);
  assert.match(restaurant, /metadataTitle: seoCopy\.title/);
  assert.match(restaurant, /name: getRestaurantMetadataName/);
  assert.match(restaurant, /buildRestaurantJsonLd/);
  assert.match(restaurant, /indexable\s*=\s*restaurant\.status\s*===\s*"open"/);
});

test("published brand image is reused across home, menu and restaurant social cards", () => {
  for (const source of [home, menu, restaurant]) {
    assert.match(source, /getBrandOpenGraphImage/);
    assert.match(source, /getPrimaryBrandLogo/);
  }
  assert.match(menu, /buildRouteMetadata\("menu", rawLocale,/);
  assert.match(restaurant, /buildRestaurantMetadata\(/);
  assert.match(menu, /socialImage\.publicUrl/);
  assert.match(restaurant, /socialImage\.publicUrl/);
  assert.match(menu, /socialImage\.mimeType/);
  assert.match(restaurant, /socialImage\.mimeType/);
  assert.match(seo, /alternateLocale:/);
  assert.match(seo, /canonical,/);
});
