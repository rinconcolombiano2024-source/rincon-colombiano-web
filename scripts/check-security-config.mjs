import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const robots = readFileSync(new URL("../src/app/robots.ts", import.meta.url), "utf8");

test("global headers include basic browser protections", () => {
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert.ok(config.includes(header), `Missing ${header}`);
  }
});
test("production HSTS remains conditional", () => {
  assert.match(config, /if\s*\(\s*isProduction\s*\)\s*\{\s*securityHeaders\.push/);
});
test("robots excludes administrative and API routes", () => {
  for (const path of ["/admin", "/admin/", "/api", "/api/", "/r", "/r/"]) {
    assert.ok(robots.includes(`"${path}"`), `Missing private route ${path}`);
  }
});
test("localized customer account metadata is never indexable", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/layout.tsx", import.meta.url), "utf8");
  assert.match(account, /export async function generateMetadata\(/);
  assert.match(account, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/);
  assert.match(account, /googleBot:\s*\{\s*index:\s*false,\s*follow:\s*false/);
  assert.match(account, /isSupportedLocale\(locale\)/);
  for (const title of ["Konto klienta", "Cuenta de cliente", "Customer account"]) {
    assert.ok(account.includes(title), `Missing localized account title: ${title}`);
  }
});
test("nonproduction robots disallows crawling", () => {
  assert.match(robots, /if\s*\(\s*!isProduction\s*\)/);
  assert.match(robots, /disallow:\s*"\/"/);
});
test("legacy redirect never sends checkout to an unverified target", () => {
  assert.ok(config.includes('source: "/produkty"'));
  assert.ok(!/source:\s*"\/(?:checkout|payment|cart)"/.test(config));
});

test("production robots uses the canonical sitemap host", () => {
  assert.match(robots, /SEO_PRODUCTION_ORIGIN/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /host:\s*SEO_PRODUCTION_ORIGIN/);
});

test("customer sign-in is visible in homepage desktop and mobile navigation", () => {
  const homepage = readFileSync(new URL("../src/app/[locale]/page.tsx", import.meta.url), "utf8");
  const accountLinks = homepage.match(/href=\{\`\/\$\{locale\}\/account\`\}/g) ?? [];
  assert.ok(accountLinks.length >= 2, "Homepage must expose account links in desktop and mobile headers");
  for (const label of ["Iniciar sesión", "Zaloguj się", "Sign in"]) {
    assert.ok(homepage.includes(label), `Missing localized sign-in label: ${label}`);
  }
});

test("commercial navigation keeps a customer account link", () => {
  const navigation = readFileSync(new URL("../src/components/commercial/CommercialNavigation.tsx", import.meta.url), "utf8");
  assert.ok(navigation.includes("account"), "Commercial pages must retain customer account navigation");
});

test("cookie consent uses the localized legal route registry", () => {
  const consent = readFileSync(new URL("../src/components/commercial/CookieConsent.tsx", import.meta.url), "utf8");
  assert.ok(consent.includes('buildRoutePath("privacy", locale)'));
  assert.ok(consent.includes('buildRoutePath("cookies", locale)'));
  assert.ok(!consent.includes('href={`/${locale}/polityka-prywatnosci`}'), "Polish privacy slug must not be hardcoded for all languages");
});

test("customer OTP login recovers from network errors and never traps the submit button", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  assert.match(account, /await client\.auth\.signInWithOtp\(/);
  assert.match(account, /catch\s*\{\s*setNotice\(copy\.unavailable\)/);
  assert.match(account, /finally\s*\{\s*setPending\(false\)/);
  assert.match(account, /if\s*\(error\)\s*\{\s*setNotice\(copy\.unavailable\);\s*return;/);
  assert.match(account, /listener\.subscription\.unsubscribe\(\)/);
});

test("customer ordering remains external until payments are verified", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  assert.ok(account.includes("https://rincon-colombiano-pedidosapp.vercel.app/"));
  assert.ok(account.includes('rel="noopener noreferrer"'));
  assert.ok(!account.includes("service_role"), "No privileged database key should be used by client account UI");
});

test("scratch-and-win rewards remain disabled until legal and secure redemption are ready", () => {
  const rewards = readFileSync(new URL("../src/config/reward-campaign.ts", import.meta.url), "utf8");
  assert.match(rewards, /enabled:\s*false/);
  assert.match(rewards, /maxGrandPrizeValuePln:\s*500/);
  assert.match(rewards, /grandPrizeMaxPeople:\s*2/);
  for (const safeguard of ["oneTimeServerIssuedToken", "serverSideAtomicRedemption", "antiReplay", "legalReviewBeforeLaunch", "verifiedPurchaseOrStaffAuthorization"]) {
    assert.ok(rewards.includes(safeguard), `Missing campaign safeguard: ${safeguard}`);
  }
  assert.match(rewards, /return rewardCampaign\.enabled\s*&&/);
});

test("rewards cannot launch with undefined milestone rules or unapproved prize budget", () => {
  const rewards = readFileSync(new URL("../src/config/reward-campaign.ts", import.meta.url), "utf8");
  assert.match(rewards, /milestoneBasis:\s*"undecided"/);
  assert.match(rewards, /milestoneRulesApproved:\s*boolean/);
  assert.match(rewards, /prizeBudgetApproved:\s*boolean/);
  assert.match(rewards, /rewardCampaign\.milestoneBasis !== "undecided"/);
  assert.match(rewards, /marketingOptInMustBeSeparate:\s*true/);
});

test("customer auth listener ignores events after component unmount", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  assert.match(account, /onAuthStateChange\(\(_event, session\) => \{\s*if \(active\) \{ setUserEmail/);
  assert.match(account, /return \(\) => \{ active = false; listener\.subscription\.unsubscribe\(\); \}/);
});

test("customer account shows authentication errors even when already signed in", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  const notice = '{notice && <p role="status" aria-live="polite"';
  assert.equal(account.split(notice).length - 1, 1, "Auth notice should be rendered once");
  assert.ok(account.indexOf(notice) > account.indexOf('</form>'), "Notice must remain visible after sign-out failure");
});

test("cookie consent updates are broadcast across browser tabs", () => {
  const cookies = readFileSync(new URL("../src/components/commercial/CookieConsent.tsx", import.meta.url), "utf8");
  assert.match(cookies, /event\.key === KEY \|\| event\.key === null/);
  assert.match(cookies, /event\.newValue/);
  assert.match(cookies, /next === "accepted" \? "accepted" : "rejected"/);
  assert.equal(cookies.split('new CustomEvent("rc-consent-change"').length - 1, 2);
});

test("customer sign-out prevents duplicate requests and clears pending after failures", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  const signout = account.slice(account.indexOf("async function signOut()"), account.indexOf("\n  return (", account.indexOf("async function signOut()")));
  assert.match(signout, /if \(!config \|\| pending\) \{ return; \}/);
  assert.match(signout, /setPending\(true\)/);
  assert.match(signout, /finally \{\s*setPending\(false\)/);
  assert.match(account, /onClick=\{signOut\} disabled=\{pending\}/);
});

test("menu category controls target labeled category panels", () => {
  const menu = readFileSync(new URL("../src/components/commercial/MenuCategoryBrowser.tsx", import.meta.url), "utf8");
  assert.match(menu, /aria-controls=\{`menu-panel-\$\{index\}`\}/);
  assert.match(menu, /id=\{`menu-panel-\$\{index\}`\}/);
  assert.match(menu, /aria-label=\{categories\[index\]\?\.name\}/);
  assert.match(menu, /hidden=\{selected !== index\}/);
});

test("optional cookie consent fails closed when browser storage is unavailable", () => {
  const cookies = readFileSync(new URL("../src/components/commercial/CookieConsent.tsx", import.meta.url), "utf8");
  assert.match(cookies, /let persisted = false/);
  assert.match(cookies, /localStorage\.setItem\(KEY, next\);\s+persisted = true/);
  assert.match(cookies, /revokeTracking = next === "rejected" && localStorage\.getItem\(KEY\) === "accepted"/);
  assert.match(cookies, /if \(revokeTracking && persisted\) \{\s+window\.location\.reload\(\)/);
  assert.match(cookies, /persisted \? next : "rejected"/);
  assert.match(cookies, /setChoice\(persisted \? next : null\)/);
  assert.match(cookies, /detail: effectiveChoice/);
});

test("menu category selection survives reorder and removed categories", () => {
  const menu = readFileSync(new URL("../src/components/commercial/MenuCategoryBrowser.tsx", import.meta.url), "utf8");
  assert.match(menu, /useState<string \| null>\(null\)/);
  assert.match(menu, /Math\.max\(0, categories\.findIndex\(\(category\) => category\.id === selectedId\)\)/);
  assert.match(menu, /const selectCategory = \(id: string\) => \{[\s\S]*?setSelectedId\(id\)/,
    "category selection must update state from a real category id");
  assert.match(menu, /onClick=\{\(\) => selectCategory\(category\.id\)\}/,
    "clicks must route through state and URL synchronization");
});

test("customer account waits for session verification before showing sign-in", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  assert.match(account, /useState\(Boolean\(config\)\)/);
  assert.match(account, /checkingSession \? \(/);
  assert.match(account, /setCheckingSession\(false\)/);
  assert.match(account, /checking: "Comprobando tu sesión…"/);
});

test("customer account loading ends only after verified getUser resolution", () => {
  const account = readFileSync(new URL("../src/app/[locale]/account/page.tsx", import.meta.url), "utf8");
  assert.match(account, /getUser\(\)[\s\S]*?setCheckingSession\(false\)/);
  assert.match(account, /onAuthStateChange\(\(_event, session\) => \{\s*if \(active\) \{ setUserEmail\(session\?\.user\?\.email \?\? null\); \}/);
});
