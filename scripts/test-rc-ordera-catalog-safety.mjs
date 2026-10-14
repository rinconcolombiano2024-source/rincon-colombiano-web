import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  parsePublicMenuPrice,
  parsePublicMenuAvailability,
  parsePublicProductImageUrl,
  normalizePublicPlnSymbol,
} from "../src/integrations/rc-ordera/public-product-safety.ts";

test("accept exactly priced RC ORDERA products, including explicit free items", () => {
  for (const [input, expected] of [
    [0, 0], [0.01, 0.01], [8, 8], [12.5, 12.5],
    [40, 40], [9999, 9999], ["15", 15], ["15.50", 15.5],
    ["15,50", 15.5], [" 48,00 ", 48], ["0", 0], ["0.00", 0],
  ]) {
    assert.equal(parsePublicMenuPrice(input), expected, JSON.stringify(input));
  }
});

test("never display missing/malformed/negative/infinite price as 0 zł", () => {
  for (const raw of [
    undefined, null, "", " ", NaN, Infinity, -Infinity, -1, -0.01,
    false, true, [], {}, "free", "12xyz", "15 zł", "1e4", "0x10",
    "10,123", "15.999", "10.3abc", "9999.99", 10000, 10.999,
    "15,25,10", "10..0", "--1", "+20",
  ]) {
    assert.equal(parsePublicMenuPrice(raw), null, JSON.stringify(raw));
  }
});

test("preserve legacy omission of availability, never trust malformed explicit false", () => {
  assert.equal(parsePublicMenuAvailability(undefined, false), true,
    "Only absent field is treated as legacy available");
  assert.equal(parsePublicMenuAvailability(true, true), true);
  assert.equal(parsePublicMenuAvailability(false, true), false);
  for (const malformed of [undefined, null, "false", "true", "0", 0, 1, {}]) {
    assert.equal(parsePublicMenuAvailability(malformed, true), false,
      "Malformed, explicitly-supplied available must be unavailable");
  }
});

test("real public catalog uses validated offer data, not invented defaults", () => {
  const catalog = readFileSync("src/integrations/rc-ordera/public-catalog.ts", "utf8");
  assert.match(catalog, /const price = parsePublicMenuPrice\(readValue\(value, "price"\)\)/);
  assert.match(catalog, /if \(price === null\) \{\s*return null;\s*\}/);
  assert.match(catalog, /const available = parsePublicMenuAvailability\(/);
  assert.match(catalog, /Object\.hasOwn\(value, "available"\)/);
  assert.doesNotMatch(catalog, /available\s*:\s*available\s*!==\s*false/);
  assert.doesNotMatch(catalog, /readNumber\(\s*value,\s*"price",?\s*\)\s*\?\?\s*0/);
});

test("Warsaw menu cannot display currency labels that contradict PLN offer metadata", () => {
  for (const [raw, expected] of [
    [undefined, "zł"], [null, "zł"], ["", "zł"], [" zł ", "zł"],
    ["ZŁ", "zł"], ["zl", "zł"], ["PLN", "PLN"], [" pln ", "PLN"],
    ["EUR", "zł"], ["€", "zł"], ["USD", "zł"],
    ["<script>alert(1)</script>", "zł"], ["\nUSD\n", "zł"],
    [123, "zł"], [{ value: "EUR" }, "zł"],
  ]) {
    assert.equal(normalizePublicPlnSymbol(raw), expected);
  }
  const catalog = readFileSync("src/integrations/rc-ordera/public-catalog.ts", "utf8");
  assert.match(catalog, /normalizePublicPlnSymbol\(/,
    "RC ORDERA read-only settings must use the PLN-safe currency display");
  assert.doesNotMatch(catalog, /currencySymbol:\s*readString\(/,
    "Raw arbitrary catalog labels must never appear beside prices");
});

test("accept existing HTTPS product photos from RC ORDERA without fabricating uploads", () => {
  for (const raw of [
    "https://demo.supabase.co/storage/v1/object/public/rc-menu/lechona.webp",
    "https://images.example.com/tamal.jpg?width=640",
    " https://food.example.org/arepa.png ",
  ]) {
    const result = parsePublicProductImageUrl(raw);
    assert.ok(result?.startsWith("https://"), JSON.stringify(raw));
  }
  assert.equal(
    parsePublicProductImageUrl("https://demo.supabase.co/lechona.png#tracking"),
    "https://demo.supabase.co/lechona.png",
    "Fragments cannot be used to retrieve image assets",
  );
});

test("block script, private hosts, credentials and invalid product image sources", () => {
  for (const invalid of [
    undefined, null, false, "", "/", "/images/bandeja.png",
    "data:image/svg+xml,<svg/>", ["java", "script:alert(1)"].join(""),
    "http://example.org/image.jpg", "file:///etc/passwd",
    "blob:https://example.org/123",
    "https://user:password@example.org/picture.jpg",
    "https://localhost:3000/image.jpg",
    "https://example.local/photo.jpg", "https://169.254.169.254/latest",
    "https://127.0.0.1/secret", "https://192.168.10.1/food.jpg",
    "https://10.10.10.1/food.jpg", "https://172.16.0.3/image.jpg",
    "https://[::1]/image.jpg", "https://[fd00::1]/image.jpg",
    "https://[fe80::1]/image.jpg", "https://0.0.0.0/image.png",
    "https://203.0.113.4/photo.png", "https://printer/image.png",
    "https://cdn.example.com:8443/photo.jpg",
    `https://example.com/${"a".repeat(1700)}`,
  ]) {
    assert.equal(parsePublicProductImageUrl(invalid), null, JSON.stringify(invalid));
  }
});

test("the real public menu shows only validated RC ORDERA product photos", () => {
  const catalog = readFileSync("src/integrations/rc-ordera/public-catalog.ts", "utf8");
  const menu = readFileSync("src/app/[locale]/menu/page.tsx", "utf8");
  assert.match(catalog, /parsePublicProductImageUrl\(readString\(value, "imageUrl"\)\)/);
  assert.match(menu, /product\.imageUrl\s*\?\s*\(/,
    "No photo URL means no image and no false representation");
  assert.match(menu, /<Image[\s\S]*?src=\{product\.imageUrl\}[\s\S]*?alt=\{product\.name\}/,
    "Each image describes the actual item without inventing an alt label");
  assert.match(menu, /loading="lazy"/, "Images below the fold must lazy-load");
  assert.match(menu, /unoptimized/, "Do not proxy arbitrary admin-supplied CDN images through Next.js");
  assert.match(menu, /sizes="\(max-width: 767px\) 100vw, 50vw"/,
    "Product photos have responsive size hints");
});
