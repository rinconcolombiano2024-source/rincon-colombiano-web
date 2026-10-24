/**
 * Prevent drift between UI slot registry and database CHECK/RPC allowlists.
 * No dependencies or database credentials required. Run in CI.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registrySource = await readFile("src/config/brand-slots.ts", "utf8");
const migration = await readFile(
  "supabase/migrations/202610120002_web_brand_commercial_slots.sql",
  "utf8",
);

function parseSlots(raw) {
  return [...raw.matchAll(/"([a-z][a-z0-9_]*)"/g)].map((match) => match[1]);
}

function parseSqlSlots(raw) {
  return [...raw.matchAll(/'([a-z][a-z0-9_]*)'/g)].map((match) => match[1]);
}

function assertSameSlots(actual, expected, message) {
  const ordered = (values) => [...new Set(values)].sort();
  assert.deepEqual(ordered(actual), ordered(expected), message);
}

const registry = registrySource.match(/BRAND_SLOTS\s*=\s*\[([\s\S]*?)\]\s*as const/);
assert.ok(registry, "Missing central BRAND_SLOTS registry");
const expected = parseSlots(registry[1]);
assert.ok(expected.length >= 8, "Brand registry unexpectedly empty");

const constraints = [...migration.matchAll(/check \(slot in \(([^)]*)\)\)/g)];
assert.equal(constraints.length, 2, "Asset and publication CHECK constraints required");

for (const [index, constraint] of constraints.entries()) {
  assertSameSlots(
    parseSqlSlots(constraint[1]),
    expected,
    `Database slot CHECK #${index + 1} differs from TypeScript`,
  );
}

const rpc = migration.match(/p_slot not in\s*\(([^)]*)\)/i);
assert.ok(rpc, "RPC input allowlist is missing");
assertSameSlots(parseSqlSlots(rpc[1]), expected, "RPC slot allowlist differs from TypeScript");

assert.match(
  migration,
  /revoke all on function public\.web_brand_register_asset[^;]*from public, anon, authenticated/,
  "Registration RPC must not grant public writes",
);
assert.match(
  migration,
  /grant execute on function public\.web_brand_register_asset[^;]*to service_role/,
  "Registration RPC must stay service_role-only",
);
console.log(`PASS: ${expected.length} commercial media slots agree in UI, SQL and RPC`);

// The public brand reader carries an apikey and bearer header. Supabase
// redirects must fail closed rather than forwarding them to another origin.
const brandReader = await readFile("src/lib/brand/public-brand.ts", "utf8");
const brandFetch = brandReader.match(/await fetch\\(\\s*requestUrl,\\s*\\{([\\s\\S]*?)\\n\\s*\\},\\s*\\)/);
assert.ok(brandFetch, "Public brand request must use a bounded fetch options object");
assert.match(brandFetch[1], /\\bredirect\\s*:\\s*["']error["']/, "Public brand fetch must reject redirects");
assert.match(brandFetch[1], /\\bAuthorization\\s*:/, "Public brand fetch must use the guarded auth header");
assert.match(brandFetch[1], /\\bapikey\\s*:/, "Public brand fetch must guard the API key");
console.log("PASS: authenticated public brand reads reject upstream redirects");
