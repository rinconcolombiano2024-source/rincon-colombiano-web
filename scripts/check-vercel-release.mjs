import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const quality = read(".github/workflows/quality-gate.yml");
const staging = read(".github/workflows/vercel-staging-gate.yml");
const deployment = read(".github/workflows/vercel-preview-deploy.yml");
const alias = read(".github/workflows/audit-vercel-live-alias.yml");
const revisionSmoke = read("scripts/smoke-deployment-revision.mjs");
const guestJourney = read("scripts/smoke-live-guest-journey.mjs");
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
for (const workflow of [deployment, staging, alias]) {
  assert.match(workflow, /smoke-deployment-revision\.mjs/,
    "A deployed site MUST serve the reviewed git SHA before acceptance");
}
assert.match(quality, /smoke-deployment-revision\.mjs http:\/\/127\.0\.0\.1:3100/,
  "Production builds must publish a testable release revision");
assert.match(quality, /smoke-deployment-revision\.mjs http:\/\/127\.0\.0\.1:3101/,
  "Preview builds must publish a testable release revision");
assert.match(alias, /workflow_dispatch:/, "Live Vercel alias audit is manual only");
assert.match(alias, /https:\/\/rincon-colombiano-web\.vercel\.app/,
  "Audit the actual advertised web repository alias");
assert.doesNotMatch(alias, /secrets\.|--prod\b|vercel (?:deploy|promote)|dns\s+/,
  "Stale alias audit must remain entirely read-only and credential free");
assert.match(revisionSmoke, /redirect:\s*"manual"/,
  "Do not silently follow redirects to another host when checking a release");
assert.match(revisionSmoke, /STALE DEPLOYMENT/,
  "Never mark an older Vercel alias as published");
for (const workflow of [deployment, staging, alias]) {
  assert.match(workflow, /smoke-live-guest-journey\.mjs/,
    "No live/staging version can be accepted without actual PL/ES/EN order and CEO route checks");
}
assert.match(quality, /smoke-live-guest-journey\.mjs http:\/\/127\.0\.0\.1:3100/,
  "Production CI must exercise read-only real customer navigation");
assert.match(quality, /smoke-live-guest-journey\.mjs http:\/\/127\.0\.0\.1:3101/,
  "Preview CI must exercise read-only real customer navigation");
assert.match(guestJourney, /redirect: "manual"/,
  "A malicious redirect must not silently be followed");
assert.match(guestJourney, /validateVercelPreviewUrl/,
  "Release audit inputs must never be arbitrary network targets");
assert.match(guestJourney, /rincon-colombiano-pedidosapp\.vercel\.app/,
  "Customer order links must point to the actual RC ORDERA system");
assert.match(guestJourney, /\/admin\/menu/,
  "Test that CEO menu is inaccessible to unauthenticated visitors");
assert.doesNotMatch(guestJourney, /method:\s*"POST"|method:\s*"PUT"|method:\s*"PATCH"|method:\s*"DELETE"/,
  "Live guest acceptance must NEVER mutate merchant/order/payment data");
console.log("PASS: manual and CI guest route acceptance is read-only, origin-restricted and mandatory");

console.log("PASS: safe deployment gates enforce reviewed SHA on live alias, staging and preview builds");
