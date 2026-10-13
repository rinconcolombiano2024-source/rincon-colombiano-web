/**
 * Real GET-only migration test. Prevent backlinks to the former SumUp
 * catalogue from falling into 404/locale-proxy loops after launch.
 * No orders, cart state, payments or authenticated routes are touched.
 */
import assert from "node:assert/strict";

const origin = new URL(
  (process.argv[2] ?? "http://127.0.0.1:3100").replace(/\/+$/, ""),
);

assert.ok(["http:", "https:"].includes(origin.protocol));
assert.ok(!origin.username && !origin.password);

const cases = [
  ["/produkty", 308],
  ["/product/tamal-tolimense", 307],
  ["/product/arepa-80gr", 307],
  ["/produkt/chocolate-con-queso-1", 307],
  ["/kategoria/entradas-przystawki", 307],
  ["/kategoria/dania-glowne", 307],
  ["/category/drinks", 307],
];

for (const [source, expectedStatus] of cases) {
  const url = new URL(source, origin);
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, expectedStatus,
    `Preserve legacy ${source} without a 404 or unwanted permanent product redirect`);
  const location = response.headers.get("location");
  assert.ok(location, `Legacy URL ${source} needs a Location header`);
  const target = new URL(location, url);
  assert.equal(target.pathname, "/pl/menu",
    `Old ${source} must lead to the current customer menu`);
  assert.equal(target.origin, origin.origin,
    `Legacy redirect must not leave the official web host`);
  console.log(`PASS ${source} -> ${target.pathname} (${response.status})`);
}

// Never interpret the old cart or checkout as catalogue pages. These paths
// require a separate merchant-approved migration policy.
console.log("PASS: verified live SumUp catalogue URLs have a safe PL menu fallback; old checkout/payment paths untouched");
