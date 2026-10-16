import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/[locale]/pedir/page.tsx", import.meta.url), "utf8");

test("localized order page has all supported languages", () => {
  for (const locale of ["pl", "es", "en"]) assert.match(source, new RegExp('\\b' + locale + ': \\{ title:'));
});
test("direct ordering keeps RC ORDERA and no invented checkout", () => {
  assert.match(source, /https:\/\/rincon-colombiano-pedidosapp\.vercel\.app\//);
  assert.doesNotMatch(source, /sumupstore\.com|APP_AUTH_PASSWORD|service_role/);
});
test("delivery links lead to identified restaurant listings", () => {
  for (const fragment of [
    "ubereats.com/pl/store/rincon-colombiano/",
    "glovoapp.com/pl/pl/warszawa/stores/rincon-colombiano-waw",
    "pyszne.pl/en/menu/rincon-colombiano",
    "wolt.com/pl/pol/warsaw/restaurant/rincon-colombiano",
  ]) assert.ok(source.includes(fragment), fragment);
});
test("external links are protected and SEO locales are declared", () => {
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /canonical:/);
  assert.match(source, /languages: \{ pl:/);
});
