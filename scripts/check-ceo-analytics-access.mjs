import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Protect discoverability of visit statistics regardless of GA4 status.
const page = readFileSync(new URL("../src/app/(system)/admin/analytics/page.tsx", import.meta.url), "utf8");
const statusSplit = page.indexOf('{report.status !== "ready" ? (');
const vLink = 'href="https://vercel.com/jhon-mendez-s-projects/rincon-colombiano-web/analytics"';
const gLink = 'href="https://analytics.google.com/"';

test("CEO exposes Vercel visit statistics for both connected and unconfigured GA4 states", () => {
  assert.ok(statusSplit > 0, "The report status branch must exist");
  assert.ok(page.indexOf(vLink) > 0 && page.indexOf(vLink) < statusSplit,
    "Vercel Analytics must be outside and above the conditional report");
  assert.ok(page.indexOf(gLink) > 0 && page.indexOf(gLink) < statusSplit,
    "Google Analytics must remain available when a report is ready");
  assert.equal(page.split(vLink).length - 1, 1, "Avoid duplicate Vercel dashboard buttons");
  assert.equal(page.split(gLink).length - 1, 1, "Avoid duplicate GA4 dashboard buttons");
  assert.match(page, /aria-label="Abrir servicios de estadísticas"/);
  assert.match(page, /rel="noopener noreferrer"/);
});

test("CEO does not invent visitor counts when GA4 is not configured", () => {
  assert.match(page, /El contador de visitantes todavía no está conectado/);
  assert.match(page, /No inventamos cifras/);
  assert.match(page, /las visitas anteriores a la activación no se pueden reconstruir/);
});
