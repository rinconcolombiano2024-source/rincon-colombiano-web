import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  parsePublicMenuPrice,
  parsePublicMenuAvailability,
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
