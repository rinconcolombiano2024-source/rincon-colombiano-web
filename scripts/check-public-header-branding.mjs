import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const homepage = readFileSync("src/app/[locale]/page.tsx", "utf8");
const menu = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
const locations = readFileSync("src/app/[locale]/[...slug]/page.tsx", "utf8");
const brand = readFileSync("src/lib/brand/public-brand.ts", "utf8");

test("all customer pages use the same approved published brand logo", () => {
  for (const [name, page] of [["home", homepage], ["menu", menu], ["restaurant", locations]]) {
    assert.match(page, /getPrimaryBrandLogo\(/,
      `${name} must load the owner's existing approved published logo`);
    assert.match(page, /primaryBrandLogo\.publicUrl/,
      `${name} must display the published asset URL instead of a new hardcoded graphic`);
  }
  assert.match(brand, /return getPublishedBrandAsset\([\s\S]*?"logo_primary"/);
});

test("menu and restaurant headers retain accessible safe fallback on narrow phones", () => {
  for (const [name, page] of [["menu", menu], ["restaurant", locations]]) {
    const header = page.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
    assert.match(header, /aria-label="Rincón Colombiano"/,
      `${name} home brand link must remain identifiable when wordmark hides on narrow phones`);
    assert.match(header, /primaryBrandLogo \? \(/,
      `${name} displays approved logo if available`);
    assert.match(header, /bg-contain bg-left bg-no-repeat/,
      `${name} must render without cropping official artwork`);
    assert.match(header, /aria-hidden="true"/,
      `${name} decorative logo must not duplicate accessible title`);
    assert.match(header, /min-\[480px\]:inline/,
      `${name} must reserve mobile space for working order actions`);
    assert.match(header, /RC\s*<\/span>/,
      `${name} must not be left with a broken logo if Supabase is unavailable`);
    assert.doesNotMatch(header, /https?:\/\//,
      `${name} must not embed arbitrary remote branding`);
  }
});

test("menu and location logo uses existing cache-safe public brand source", () => {
  assert.match(brand, /next:\s*\{[\s\S]*?revalidate:/,
    "Use existing short TTL cache instead of a new uncached request for every visit");
  assert.match(menu, /Promise\.all\(\[[\s\S]*?getRcOrderaPublicCatalog\("czapelska"\),\s*getPrimaryBrandLogo\(\)/,
    "Menu catalog and logo requests run concurrently, avoiding extra latency");
});
