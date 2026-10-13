import assert from "node:assert/strict";
import test from "node:test";
import { publicReleaseFingerprint } from "../src/lib/release/fingerprint.ts";

const sha1 = "a".repeat(40);
const sha2 = "B".repeat(40);

test("Vercel revision is preferred over GitHub CI revision", () => {
  assert.deepEqual(publicReleaseFingerprint({
    VERCEL_GIT_COMMIT_SHA: sha2,
    GITHUB_SHA: sha1,
  }), { project: "rincon-colombiano-web", revision: sha2.toLowerCase() });
});

test("GitHub CI revision is accepted only if full SHA", () => {
  assert.deepEqual(publicReleaseFingerprint({ GITHUB_SHA: sha1 }), {
    project: "rincon-colombiano-web", revision: sha1,
  });
  for (const invalid of ["main", "", "a".repeat(39), "z".repeat(40), "https://attacker.example"]) {
    assert.equal(publicReleaseFingerprint({ GITHUB_SHA: invalid }).revision, null);
  }
});

test("release response never exports any admin, database, or payment secret", () => {
  const result = publicReleaseFingerprint({
    VERCEL_GIT_COMMIT_SHA: sha1,
    GITHUB_SHA: sha2,
    SUPABASE_SERVICE_ROLE_KEY: "ultra-secret",
    STRIPE_SECRET_KEY: "payment-secret",
    VERCEL_TOKEN: "deployment-secret",
    RC_ORDERA_SUPABASE_ANON_KEY: "public-merchant-key",
  });
  const data = JSON.stringify(result);
  assert.deepEqual(Object.keys(result).sort(), ["project", "revision"]);
  assert.doesNotMatch(data, /ultra-secret|payment-secret|deployment-secret|public-merchant-key/);
});
