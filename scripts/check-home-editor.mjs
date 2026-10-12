import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SEO_EDITABLE_ROUTES, validPublishedSeo } from "../src/config/seo-cms.ts";
import {
  HOME_EDITABLE_SECTIONS,
  HOME_EDITABLE_KEYS,
  validHomeCmsCopy,
} from "../src/config/home-cms.ts";

assert.equal(HOME_EDITABLE_SECTIONS.length, 11);
assert.equal(new Set(HOME_EDITABLE_KEYS).size, HOME_EDITABLE_KEYS.length,
  "Duplicate CMS keys will cause conflicting publications");
assert.ok(HOME_EDITABLE_KEYS.includes("home_seo"));
assert.ok(HOME_EDITABLE_KEYS.includes("home_services"));

for (const section of HOME_EDITABLE_SECTIONS) {
  const copy = { kind: section.kind, title: "Texto de prueba", body: "Cocina colombiana en Varsovia" };
  assert.equal(validHomeCmsCopy(section.key, copy), true);
  assert.equal(validHomeCmsCopy(section.key, { ...copy, title: " " }), false);
  assert.equal(validHomeCmsCopy(section.key, { ...copy, body: " " }), false);
  assert.equal(validHomeCmsCopy(section.key, { ...copy, title: "a".repeat(section.maxTitle + 1) }), false);
  assert.equal(validHomeCmsCopy(section.key, { ...copy, body: "a".repeat(section.maxBody + 1) }), false);
  assert.equal(validHomeCmsCopy(section.key, { ...copy, kind: "article" }), false);
}
assert.equal(validHomeCmsCopy("home_unknown", {
  title: "Title", body: "Description", kind: "page",
}), false, "Cannot accept unknown editable areas");

const home = await readFile("src/app/[locale]/page.tsx", "utf8");
assert.doesNotMatch(home, /La web de Rincón Colombiano será el centro de contacto con la marca/);
assert.doesNotMatch(home, /The Rincón Colombiano website is becoming the central relationship point/);
assert.doesNotMatch(home, /Strona Rincón Colombiano jest centralnym punktem kontaktu z marką/);
assert.match(home, /getPublishedCmsTextBatch/);
assert.match(home, /home_seo/);
const widget = await readFile("src/components/rincon-ai/RinconAiWidget.tsx", "utf8");
assert.match(widget, /sm:block/, "Floating AI launcher should hide expanded copy on narrow screens");

console.log("PASS: 11 editable commercial/SEO areas and mobile sales copy guard");

assert.deepEqual(SEO_EDITABLE_ROUTES.map((route) => route.key), [
  "home_seo", "menu_seo", "location_czapelska_seo",
]);
assert.equal(validPublishedSeo("menu_seo", {
  kind: "page", title: "Kolumbijskie jedzenie Warszawa", body: "Kuchnia kolumbijska w Warszawie",
}), true);
assert.equal(validPublishedSeo("location_brzeska_seo", {
  kind: "page", title: "Brzeska", body: "Coming soon",
}), false, "SEO editing never marks unopened Brzeska as an active location");
assert.equal(validPublishedSeo("home_seo", {
  kind: "page", title: "a".repeat(71), body: "ok",
}), false, "SEO titles have strict length caps");

const contentActions = await readFile("src/app/(system)/admin/content/actions.ts", "utf8");
assert.match(contentActions, /function isValidManagedDocument\(/,
  "Managed SEO/content CMS must use server-side validation");
assert.match(contentActions, /validPublishedSeo\(key, doc\)/,
  "SEO titles and descriptions must be validated by allowlisted route");
assert.match(contentActions, /validHomeCmsCopy\(key, doc\)/,
  "Home text length limits must not rely on HTML maxLength only");
assert.match(contentActions, /if \(!isValidManagedDocument\(contentKey, rawKind, title, body\)\)/,
  "Malicious CMS POST must not bypass commercial-editor bounds");
assert.match(contentActions, /if \(!isValidManagedDocument\(managedKey,/,
  "Legacy drafts must be validated before publication");
for (const route of [
  "/pl/menu", "/es/restaurantes/czapelska", "/en/locations/czapelska",
  "/admin/home", "/admin/seo",
]) {
  assert.ok(contentActions.includes(route), `Missing publication revalidation: ${route}`);
}
console.log("PASS: server validates published commercial CMS documents and refreshes edited SEO routes");
