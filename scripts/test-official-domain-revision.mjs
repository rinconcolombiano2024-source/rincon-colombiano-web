import assert from "node:assert/strict";
import test from "node:test";
import { checkOfficialDomainRevision } from "../src/lib/admin/official-domain.ts";

const current = "a".repeat(40);
const outdated = "b".repeat(40);
const manifest = { id: "/admin", start_url: "/admin", scope: "/admin" };
const release = { project: "rincon-colombiano-web", revision: current };

function mockReply(path, overrides = {}) {
  const isManifest = path.endsWith("/admin/manifest.webmanifest");
  const status = isManifest ? (overrides.manifestStatus ?? 200) : (overrides.releaseStatus ?? 200);
  const payload = isManifest ? (overrides.manifest ?? manifest) : (overrides.release ?? release);
  const type = isManifest
    ? (overrides.manifestType ?? "application/manifest+json")
    : (overrides.releaseType ?? "application/json");
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": type },
  });
}

function mockFetch(overrides = {}, requests = []) {
  return async (url, options) => {
    const parsed = new URL(url);
    requests.push({ url: parsed.href, options });
    assert.equal(parsed.origin, "https://rinconcolombiano.pl");
    assert.ok(
      ["/admin/manifest.webmanifest", "/release.json"].includes(parsed.pathname),
      "Fixed allowlisted paths only",
    );
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "manual", "Do not trust redirected legacy sites");
    assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, undefined, "No login cookies sent");
    assert.equal(options.signal.aborted, false);
    return mockReply(parsed.pathname, overrides);
  };
}

test("exact official deploy revision plus valid admin manifest is ready", async () => {
  const requests = [];
  assert.equal(await checkOfficialDomainRevision(current, mockFetch({}, requests)), "ready");
  assert.equal(requests.length, 2);
  assert.equal(requests[0].options.signal, requests[1].options.signal,
    "Both read-only checks must share one bounded deadline");
});

test("stale, unknown, or incorrect release metadata blocks a launch", async () => {
  for (const overrides of [
    { release: { ...release, revision: outdated } },
    { release: { ...release, revision: null } },
    { release: { ...release, project: "other-project" } },
    { release: {} },
    { releaseStatus: 404 },
    { releaseStatus: 307 },
    { releaseType: "text/html" },
    { manifestStatus: 302 },
    { manifestType: "text/html" },
    { manifest: { ...manifest, scope: "/" } },
    { manifest: [] },
  ]) {
    const status = await checkOfficialDomainRevision(current, mockFetch(overrides));
    assert.equal(status, "not-published", JSON.stringify(overrides));
  }
});

test("absence or invalidity of current Git revision prevents any network work", async () => {
  for (const unknown of [null, "", "main", "a".repeat(39)]) {
    let called = false;
    const status = await checkOfficialDomainRevision(unknown, async () => {
      called = true;
      throw new Error("must never call");
    });
    assert.equal(status, "not-published");
    assert.equal(called, false);
  }
});

test("network errors and invalid JSON fail closed without claiming success", async () => {
  assert.equal(await checkOfficialDomainRevision(current, async () => {
    throw new Error("network offline");
  }), "unavailable");

  assert.equal(await checkOfficialDomainRevision(current, async (url) => {
    if (String(url).endsWith("release.json")) {
      return new Response("invalid json", {
        headers: { "content-type": "application/json" },
      });
    }
    return mockReply("/admin/manifest.webmanifest");
  }), "unavailable");
});

console.log("PASS: CEO official domain requires matching Git SHA and PWA manifest");
