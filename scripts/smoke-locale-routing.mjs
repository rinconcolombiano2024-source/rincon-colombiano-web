import assert from "node:assert/strict";

const origin = process.argv[2] ?? "http://127.0.0.1:3100";
async function request(path, headers = {}) {
  return fetch(new URL(path, origin), {
    redirect: "manual", headers, signal: AbortSignal.timeout(15000),
  });
}

for (const [path, destination] of [
  ["/es-CO", "/es"],
  ["/EN/menu", "/en/menu"],
  ["/pl-PL/menu?utm_source=campaign", "/pl/menu?utm_source=campaign"],
  ["/es_CO/menu", "/es/menu"],
]) {
  const response = await request(path, { cookie: "rc_locale=en" });
  assert.equal(response.status, 308, path);
  const target = new URL(response.headers.get("location"), origin);
  assert.equal(target.pathname + target.search, destination);
  assert.equal(target.origin, new URL(origin).origin);
  assert.equal((await request(destination)).status, 200, destination);
  console.log(`PASS canonical locale: ${path} -> ${destination}`);
}

for (const locale of ["es", "pl", "en"]) {
  assert.equal((await request(`/${locale}/menu`)).status, 200);
}
// These are the published legal slugs in all three languages. The cookie
// consent banner and route registry must not point to planned 404 aliases.
for (const locale of ["pl", "es", "en"]) {
  for (const slug of ["polityka-prywatnosci", "polityka-cookies"]) {
    const path = `/${locale}/${slug}`;
    const response = await request(path);
    assert.equal(response.status, 200, `Legal page ${path} must exist`);
    const html = await response.text();
    assert.ok(html.includes(`/${locale}/${slug}`), `Legal page ${path} must retain its canonical path`);
  }
}
console.log("PASS published privacy and cookie policies in PL ES EN");

for (const [headers, locale] of [
  [{ "accept-language": "de;q=1,es;q=0" }, "pl"],
  [{ "accept-language": "es-CO,en;q=0.5" }, "es"],
  [{ "accept-language": "en", cookie: "rc_locale=es" }, "es"],
]) {
  const response = await request("/menu", headers);
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, `/${locale}/menu`);
}
assert.equal(new URL((await request("/", { "accept-language": "es" })).headers.get("location"), origin).pathname, "/pl");
assert.equal((await request("/admin/manifest.webmanifest")).status, 200);
assert.equal((await request("/release.json")).status, 200);
console.log("PASS browser language exclusion, cookie priority, stable root and system bypasses");
