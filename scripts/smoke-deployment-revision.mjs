import assert from "node:assert/strict";
import { validateVercelPreviewUrl } from "./vercel-preview-url.mjs";

const input = process.argv[2];
const expected = process.argv[3];

assert.match(expected ?? "", /^[0-9a-f]{40}$/i,
  "Pass a 40-character GitHub commit SHA, not a branch name");
assert.ok(input, "A deployed HTTPS URL or local CI URL is required");

const candidate = new URL(input);
assert.equal(candidate.username, "");
assert.equal(candidate.password, "");
assert.equal(candidate.search, "");
assert.equal(candidate.hash, "");
assert.equal(candidate.pathname, "/", "Use only the website origin");
const host = candidate.hostname.toLowerCase();
const local = candidate.protocol === "http:" &&
  (host === "127.0.0.1" || host === "localhost");
assert.ok(local || candidate.origin === validateVercelPreviewUrl(input),
  "Only loopback HTTP for local CI or verified HTTPS *.vercel.app accepted");

const url = new URL("/release.json", candidate);
const response = await fetch(url, {
  redirect: "manual",
  signal: AbortSignal.timeout(12000),
  headers: { Accept: "application/json", "Cache-Control": "no-cache" },
});
assert.equal(response.status, 200,
  `Deployment not certified: ${url.href} returned HTTP ${response.status}. The live alias may be stale, inaccessible or protected.`);
assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
assert.match(response.headers.get("cache-control") ?? "", /no-store/i,
  "Version stamp must not be cached across releases");
const metadata = await response.json();
assert.ok(metadata && typeof metadata === "object" && !Array.isArray(metadata));
assert.equal(metadata.project, "rincon-colombiano-web");
assert.match(metadata.revision ?? "", /^[0-9a-f]{40}$/i,
  "Deployed website does not expose an auditable Vercel/GitHub git SHA");
assert.equal(metadata.revision.toLowerCase(), expected.toLowerCase(),
  `STALE DEPLOYMENT: expected reviewed GitHub commit ${expected}, got ${metadata.revision}; do not point rinconcolombiano.pl to this alias yet`);
console.log(`PASS: ${candidate.origin} is actually running GitHub revision ${metadata.revision}`);
console.log("PASS: publication version matches reviewed source; this is NOT a payment/order/DNS acceptance test");
