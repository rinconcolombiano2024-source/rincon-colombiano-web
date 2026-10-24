/**
 * Read-only acceptance check for an ACTUALLY running public web deployment.
 * It does not sign in, create orders, follow redirects, read cookies,
 * inspect private merchant data, send payments, or change DNS.
 *
 * Usage:
 *   node scripts/smoke-live-guest-journey.mjs http://127.0.0.1:3100
 *   node scripts/smoke-live-guest-journey.mjs https://rincon-colombiano-web.vercel.app
 *
 * Production domain cutover remains a separate owner-approved operation.
 */
import assert from "node:assert/strict";
import { validateVercelPreviewUrl } from "./vercel-preview-url.mjs";

const argument = process.argv[2];
assert.ok(argument, "An explicit local CI or Vercel deployment origin is required");
const origin = new URL(argument);
const localOrigins = new Set(["http://127.0.0.1:3100", "http://127.0.0.1:3101"]);
assert.equal(origin.pathname, "/", "Do not accept paths, only deployment origins");
assert.equal(origin.search, "");
assert.equal(origin.hash, "");
assert.equal(origin.username, "");
assert.equal(origin.password, "");
assert.ok(localOrigins.has(origin.origin) && origin.href === `${origin.origin}/` ||
  origin.origin === validateIfVercel(argument),
"Only the two local CI ports and HTTPS *.vercel.app deployment origins are allowed");

function validateIfVercel(value) {
  try {
    return validateVercelPreviewUrl(value);
  } catch {
    return null;
  }
}

const LOCALE_PATHS = {
  pl: "/pl/zamow",
  es: "/es/pedir",
  en: "/en/order",
};
const ORDER_HOST = "rincon-colombiano-pedidosapp.vercel.app";
const RESTAURANT_ID = "9702bf42-2f50-46b2-8f8a-d5f80ba576d5";
let checks = 0;

async function get(path) {
  const destination = new URL(path, origin);
  assert.equal(destination.origin, origin.origin);
  const response = await fetch(destination, {
    method: "GET",
    redirect: "manual",
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });
  return response;
}

for (const [locale, orderPath] of Object.entries(LOCALE_PATHS)) {
  const home = await get(`/${locale}`);
  assert.equal(home.status, 200, `Home ${locale} must respond HTTP 200`);
  assert.match(home.headers.get("content-type") ?? "", /text\/html/i);
  const homepage = await home.text();
  assert.match(homepage, /Rincón Colombiano/i,
    `Home ${locale} must display real restaurant branding`);
  assert.match(homepage, /Czapelska 33/i,
    `Home ${locale} must display actual Czapelska restaurant`);
  assert.match(homepage, /Brzeska 10/i,
    `Home ${locale} must preserve future branch information`);
  checks += 5;

  const menu = await get(`/${locale}/menu`);
  assert.equal(menu.status, 200, `Menu ${locale} must not return 404`);
  assert.match(menu.headers.get("content-type") ?? "", /text\/html/i);
  const menuHtml = await menu.text();
  assert.match(menuHtml, /Lechona Tolimense/i,
    `Menu ${locale} must preserve official authentic dish name`);
  assert.match(menuHtml, /Rincón Colombiano/i,
    `Menu ${locale} must retain official restaurant brand`);
  checks += 4;

  // Customer authentication is accessible but must never become a
  // searchable public landing page. Check the actual built HTML, not
  // only source text or the preview-wide robots.txt policy.
  const account = await get(`/${locale}/account`);
  assert.equal(account.status, 200, `Customer account ${locale} must respond HTTP 200`);
  assert.match(account.headers.get("content-type") ?? "", /text\/html/i);
  const accountHtml = await account.text();
  const robotsMeta = [...accountHtml.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => /\bname=["']robots["']/i.test(tag));
  assert.ok(robotsMeta && /\bnoindex\b/i.test(robotsMeta) && /\bnofollow\b/i.test(robotsMeta),
    `Customer account ${locale} must declare noindex,nofollow in its own metadata`);
  checks += 3;

  const order = await get(orderPath);
  assert.ok([302, 303, 307, 308].includes(order.status),
    `${orderPath} must redirect, not serve a fake checkout`);
  const header = order.headers.get("location");
  assert.ok(header, `Missing order destination for ${orderPath}`);
  const destination = new URL(header, origin);
  assert.equal(destination.protocol, "https:");
  assert.equal(destination.hostname, ORDER_HOST,
    `Never send customers to an arbitrary payment/order host from ${orderPath}`);
  assert.equal(destination.pathname, "/cliente.html");
  assert.equal(destination.searchParams.get("store"), RESTAURANT_ID,
    "Preserve real Czapelska ID; do not create parallel product/order accounts");
  checks += 6;
  console.log(`PASS: ${locale} homepage, real menu and safe RC ORDERA customer redirect`);
}

// Verify that unauthenticated visitors cannot simply browse CEO private pages.
// These are read-only requests; do not send credentials or allow redirects.
const login = await get("/admin/login");
assert.equal(login.status, 200, "CEO sign-in must exist before desktop acceptance");
checks += 1;
for (const path of ["/admin/menu", "/admin/seo", "/admin/operations"]) {
  const response = await get(path);
  assert.ok([302, 303, 307, 308].includes(response.status),
    `Protected CEO page ${path} must redirect unauthenticated visitors`);
  const target = new URL(response.headers.get("location") ?? "", origin);
  assert.equal(target.origin, origin.origin, "CEO auth must stay on same web host");
  assert.equal(target.pathname, "/admin/login");
  checks += 3;
}
console.log(`PASS: ${checks} live read-only customer-route/CEO access checks on ${origin.origin}`);
console.log("NOT CERTIFIED: mobile visual quality, real catalog freshness, authenticated CEO edits, fiscal receipts, checkout, BLIK/Stripe/SumUp payments, Windows runtime or DNS cutover");
