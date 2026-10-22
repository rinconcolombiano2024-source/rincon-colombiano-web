import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/[locale]/canales-pedido/page.tsx", import.meta.url), "utf8");

test("localized order page has all supported languages", () => {
  for (const locale of ["pl", "es", "en"]) { assert.match(source, new RegExp(`\\b${locale}: \\{`)); }
});
test("both pickup links go straight to Czapelska's real RC ORDERA client menu", () => {
  const links = source.match(/href=\{buildRcOrderaOrderUrl\("czapelska"\)\}/g) ?? [];
  assert.equal(links.length, 2,
    "promotion and pickup CTAs must use the restaurant-specific ordering URL");
  assert.match(source, /import \{ buildRcOrderaOrderUrl \} from/);
  assert.doesNotMatch(source, /href="https:\/\/rincon-colombiano-pedidosapp\.vercel\.app\//,
    "generic landing URL does not preselect the actual restaurant");
  const config = readFileSync(new URL("../src/integrations/rc-ordera/config.ts", import.meta.url), "utf8");
  assert.ok(config.includes('url.pathname =') || config.includes('url.pathname =\n'),
    "helper must target customer checkout not admin");
  assert.match(config, /url\.searchParams\.set\(\s*"store",\s*restaurantId/);
  assert.match(config, /9702bf42-2f50-46b2-8f8a-d5f80ba576d5/,
    "stable official Czapelska public store identifier is preserved");
  assert.ok(source.includes("https://rincon-colombiano.sumupstore.com/produkty"),
    "SumUp remains independent from RC ORDERA cash pickup");
  assert.doesNotMatch(source, /APP_AUTH_PASSWORD|service_role/);
});
test("delivery links lead to identified restaurant listings", () => {
  for (const fragment of [
    "ubereats.com/pl/store/rincon-colombiano/",
    "glovoapp.com/pl/pl/warszawa/stores/rincon-colombiano-waw",
    "pyszne.pl/menu/rincon-colombiano",
    "wolt.com/pl/pol/warsaw/restaurant/rincon-colombiano",
  ]) { assert.ok(source.includes(fragment), fragment); }
});
test("external links are protected and SEO locales are declared", () => {
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /canonical:/);
  assert.match(source, /languages: \{ pl:/);
});
