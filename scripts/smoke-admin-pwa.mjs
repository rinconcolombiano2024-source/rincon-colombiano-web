/**
 * Smoke test HTTP del panel de escritorio, sin cuentas ni dependencias.
 * Uso: node scripts/smoke-admin-pwa.mjs http://127.0.0.1:3100
 */
import assert from "node:assert/strict";

const origin = (process.argv[2] ?? "http://127.0.0.1:3100").replace(/\/+$/, "");
let errors = 0;

async function check(label, test) {
  try {
    await test();
    console.log(`PASS ${label}`);
  } catch (error) {
    errors += 1;
    console.error(`FAIL ${label}: ${String(error)}`);
  }
}

async function get(path) {
  return fetch(new URL(path, origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
}

await check("Manifiesto de administración", async () => {
  const response = await get("/admin/manifest.webmanifest");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/manifest\+json/);
  const manifest = await response.json();
  assert.equal(manifest.id, "/admin");
  assert.equal(manifest.start_url, "/admin");
  assert.equal(manifest.scope, "/admin/");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ["192x192", "512x512"]);
});

for (const size of [192, 512]) {
  await check(`Icono PNG ${size}x${size}`, async () => {
    const response = await get(`/admin/icons/${size}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /image\/png/);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual(Array.from(bytes.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  });
}

await check("Rechazo de tamaños arbitrarios", async () => {
  assert.equal((await get("/admin/icons/9999")).status, 404);
});

await check("Worker no almacena sesiones privadas", async () => {
  const response = await get("/admin/sw.js");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /javascript/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.text();
  assert.match(body, /event\.respondWith\(fetch\(event\.request\)\)/);
  assert.doesNotMatch(body, /caches\.open|localStorage/);
});

await check("Acceso a login", async () => {
  assert.equal((await get("/admin/login")).status, 200);
});

await check("Catálogo admin protegido sin sesión", async () => {
  const response = await get("/admin/menu");
  assert.ok([302, 303, 307, 308].includes(response.status));
  const destination = new URL(response.headers.get("location") ?? "", origin);
  assert.equal(destination.pathname, "/admin/login");
});

console.log(`Smoke admin PWA: ${errors} error(es)`);
if (errors > 0) process.exitCode = 1;
