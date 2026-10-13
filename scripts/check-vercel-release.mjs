import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const quality = read(".github/workflows/quality-gate.yml");
const staging = read(".github/workflows/vercel-staging-gate.yml");
const deployment = read(".github/workflows/vercel-preview-deploy.yml");
const publicSmoke = read("scripts/smoke-public.mjs");
const navigationSmoke = read("scripts/smoke-navigation.mjs");
const robots = read("src/app/robots.ts");
const seo = read("src/config/seo.ts");

assert.match(robots, /disallow:\s*"\/"/, "Preview must reject crawling by robots");
assert.match(seo, /if\s*\(\s*!isSeoProductionEnvironment\(\)/,
  "SEO must block previews from search indexes");
for (const script of [publicSmoke, navigationSmoke]) {
  assert.match(script, /process\.argv\.includes\("--preview"\)/,
    "Preview assertions must be explicitly opt-in");
  assert.match(script, /previewMode/,
    "Preview checks must not weaken production tests");
}
assert.match(publicSmoke, /previewMode \? blocksAllCrawlers : !blocksAllCrawlers/,
  "Preview crawler policy must be the opposite of production");
assert.match(navigationSmoke, /assert\.equal\(hasNoindex\(response\.body\), previewMode/,
  "Preview HTML must have noindex, indexed production must not");
assert.match(quality, /preview-seo:/, "CI must actually build with Vercel preview environment");
assert.match(quality, /VERCEL_ENV: preview/);
assert.match(quality, /smoke-public\.mjs http:\/\/127\.0\.0\.1:3101 --preview/);
assert.match(quality, /smoke-navigation\.mjs http:\/\/127\.0\.0\.1:3101 --preview/);
assert.match(staging, /smoke-public\.mjs "\$SITE_ORIGIN" --preview/);
assert.match(staging, /smoke-navigation\.mjs "\$SITE_ORIGIN" --preview/);

assert.match(deployment, /workflow_dispatch:/, "Deployment must be manual only");
assert.match(deployment, /if: github\.ref == 'refs\/heads\/main'/,
  "Deploy only reviewed main");
assert.match(deployment, /secrets\.VERCEL_TOKEN/);
assert.match(deployment, /secrets\.VERCEL_ORG_ID/);
assert.match(deployment, /secrets\.VERCEL_PROJECT_ID/);
assert.match(deployment, /vercel pull --yes --environment=preview/);
assert.match(deployment, /vercel build --token/);
assert.match(deployment, /vercel deploy --prebuilt/);
assert.match(deployment, /validate-vercel-preview\.mjs/,
  "Never forward an unverified deployment URL");
assert.doesNotMatch(deployment, /vercel (?:promote|rollback)|--prod\b|dns\s+/, 
  "Preview automation must never promote, change production or DNS");
assert.doesNotMatch(deployment, /upload-artifact/, "Avoid upload of secrets in build output");
assert.match(deployment, /smoke-admin-pwa\.mjs/);
assert.match(deployment, /smoke-public\.mjs "\$SITE_ORIGIN" --preview/);
assert.match(deployment, /smoke-navigation\.mjs "\$SITE_ORIGIN" --preview/);
console.log("PASS: production indexable, staging noindex, deploy manual only, secrets protected, no DNS/real payment operations");
