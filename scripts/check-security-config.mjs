import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const robots = readFileSync(new URL("../src/app/robots.ts", import.meta.url), "utf8");

test("global headers include basic browser protections", () => {
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert.ok(config.includes(header), `Missing ${header}`);
  }
});
test("production HSTS remains conditional", () => {
  assert.match(config, /if\s*\(\s*isProduction\s*\)\s*\{\s*securityHeaders\.push/);
});
test("robots excludes administrative and API routes", () => {
  for (const path of ["/admin", "/api"]) { assert.ok(robots.includes(`"${path}"`)); }
});
test("nonproduction robots disallows crawling", () => {
  assert.match(robots, /if\s*\(\s*!isProduction\s*\)/);
  assert.match(robots, /disallow:\s*"\/"/);
});
test("legacy redirect never sends checkout to an unverified target", () => {
  assert.ok(config.includes('source: "/produkty"'));
  assert.ok(!/source:\s*"\/(?:checkout|payment|cart)"/.test(config));
});
