/**
 * RINCÓN COLOMBIANO — real HTTP crawl of the production-built website.
 *
 * Run against the local Next.js production server from Quality Gate:
 *   node scripts/smoke-navigation.mjs http://127.0.0.1:3100
 *
 * Or against an explicitly authorized, deployed staging URL:
 *   node scripts/smoke-navigation.mjs https://preview.example
 *
 * It follows ONLY same-site public links and sitemap pages; it never sends
 * orders, attempts a login or touches RC ORDERA's payment flows.
 */
import assert from "node:assert/strict";

const runtimeOrigin = new URL(
  (process.argv[2] ?? "http://127.0.0.1:3100").replace(/\/+$/, ""),
);
const officialOrigin = "https://rinconcolombiano.pl";
const previewMode = process.argv.includes("--preview");
const LIMIT = 90;
const LOCALES = ["pl", "es", "en"];
const fetchedPages = new Map();

assert.ok(["http:", "https:"].includes(runtimeOrigin.protocol),
  "Test origin must be HTTP(S)");
assert.ok(!runtimeOrigin.username && !runtimeOrigin.password,
  "Never allow credentials in the test origin");

async function fetchSite(path) {
  const destination = new URL(path, runtimeOrigin);
  if (destination.origin !== runtimeOrigin.origin) {
    throw new Error(`Blocked cross-origin site crawl: ${destination}`);
  }
  const response = await fetch(destination, {
    redirect: "manual",
    headers: { Accept: "text/html,application/xml,*/*" },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.text();
  return { status: response.status, headers: response.headers, body };
}

function attributes(markup) {
  const result = new Map();
  const pattern = /([\w:-]+)\s*=\s*(["'])(.*?)\2/g;
  for (const match of markup.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[3]);
  }
  return result;
}

function extractLinks(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => attributes(match[0]));
}

function htmlIds(html) {
  return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
}

function canonicalFor(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.get("rel") === "canonical") {
      return attrs.get("href");
    }
  }
  return null;
}

function hasNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
    const attrs = attributes(match[0]);
    return ["robots", "googlebot"].includes(attrs.get("name")) &&
      /(?:^|[,\s])noindex(?:[,\s]|$)/i.test(attrs.get("content") ?? "");
  });
}

function localHref(href, sourcePath) {
  const value = href.replaceAll("&amp;", "&").trim();
  if (!value) { return null; }
  if (/^(?:javascript|data|vbscript):/i.test(value)) {
    throw new Error(`Unsafe link from ${sourcePath}: ${value.slice(0, 100)}`);
  }
  let absolute;
  try {
    absolute = new URL(value, officialOrigin + sourcePath);
  } catch {
    throw new Error(`Invalid link in ${sourcePath}: ${value.slice(0, 100)}`);
  }
  if (!["https:", "http:"].includes(absolute.protocol)) {
    return null; // tel:, mailto: and other non-navigation destinations
  }
  if (absolute.origin !== officialOrigin) {
    return null; // RC ORDERA, WhatsApp and public social platforms
  }
  // /produkty is the existing separately hosted SumUp storefront on the
  // canonical domain, not a Next.js page. Never crawl it against localhost:
  // Next.js legitimately redirects this unknown route to its locale router.
  // Keep this exception exact so other broken internal links still fail CI.
  if (absolute.pathname === "/produkty" && !absolute.search && !absolute.hash) {
    return null;
  }
  // Canonical links on production stay HTTPS; localhost is only the
  // smoke-test transport and must never leak into actual site hrefs.
  return { path: absolute.pathname + absolute.search, anchor: decodeURIComponent(absolute.hash.slice(1)) };
}

function expectedLocale(path) {
  const match = path.match(/^\/(pl|es|en)(?:\/|$)/);
  return match?.[1] ?? null;
}

function titleFor(html) {
  return html.match(/<title>([^<]{1,500})<\/title>/i)?.[1] ?? "";
}

function assertPublicPage(path, response, inSitemap) {
  assert.equal(response.status, 200, `Public route ${path} must return HTTP 200`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i,
    `Public route ${path} must respond with HTML`);
  assert.match(response.body, /<main\b/i, `Public route ${path} must render <main>`);
  const lang = expectedLocale(path);
  if (lang) {
    assert.match(response.body, new RegExp(`<html\\b[^>]*lang=["']${lang}["']`, "i"),
      `Rendered document language must match ${path}`);
  }
  if (inSitemap) {
    assert.equal(hasNoindex(response.body), previewMode,
      previewMode
        ? `Preview route ${path} MUST remain noindex`
        : `Indexed production page ${path} unexpectedly contains noindex`);
    assert.equal(canonicalFor(response.body), officialOrigin + path,
      `Indexed page ${path} must use the production canonical URL`);
    assert.ok(titleFor(response.body).trim().length >= 8,
      `Indexed page ${path} must have a substantive SEO title`);
  }
}

async function audit() {
  const xml = await fetchSite("/sitemap.xml");
  assert.equal(xml.status, 200, "Sitemap must return HTTP 200");
  assert.match(xml.headers.get("content-type") ?? "", /xml/i, "Sitemap must be XML");
  const indexed = [...xml.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"));
  assert.ok(indexed.length >= 9 && indexed.length <= LIMIT,
    `Expected a bounded list of live, indexable routes; got ${indexed.length}`);
  assert.equal(new Set(indexed).size, indexed.length, "Sitemap cannot repeat canonical URLs");
  assert.ok(!indexed.some((href) => /brzeska/i.test(href)),
    "Coming-soon Brzeska must not be indexed as an open restaurant");
  for (const locale of LOCALES) {
    assert.ok(indexed.includes(`${officialOrigin}/${locale}`), `Homepage must be indexed in ${locale}`);
    assert.ok(indexed.includes(`${officialOrigin}/${locale}/menu`), `Menu must be indexed in ${locale}`);
  }

  const sitemapPaths = new Set();
  for (const target of indexed) {
    const url = new URL(target);
    assert.equal(url.origin, officialOrigin, "Sitemap may only list the canonical production domain");
    assert.ok(!url.search && !url.hash, "Sitemap URL must not use tracking/query/anchor fragments");
    sitemapPaths.add(url.pathname);
  }

  // Collect only links rendered in HTML. This catches broken UI navigation,
  // but does not claim to test JavaScript interactions or external apps.
  const links = new Map();
  for (const path of sitemapPaths) {
    const page = await fetchSite(path);
    assertPublicPage(path, page, true);
    fetchedPages.set(path, page.body);
    const anchors = extractLinks(page.body);
    assert.ok(anchors.length > 0, `Indexed ${path} renders no links`);
    for (const attr of anchors) {
      const href = attr.get("href");
      if (!href) { continue; }
      const local = localHref(href, path);
      if (!local) { continue; }
      if (!links.has(local.path)) {
        links.set(local.path, []);
      }
      links.get(local.path).push({ source: path, anchor: local.anchor });
    }
    console.log(`PASS HTTP 200 / canonical / locale: ${path}`);
  }

  assert.ok(links.size > 0 && links.size <= LIMIT,
    `Unexpected public navigation size: ${links.size}. Review before adding a broad crawl.`);

  // Check every same-origin destination once. Strict 200 prevents a "button"
  // from quietly leading to a login redirect, gone page or unfound route.
  for (const [path, sources] of links) {
    if (!fetchedPages.has(path)) {
      const page = await fetchSite(path);
      assertPublicPage(path, page, false);
      fetchedPages.set(path, page.body);
    }
    const ids = htmlIds(fetchedPages.get(path));
    for (const { source, anchor } of sources) {
      if (anchor) {
        assert.ok(ids.has(anchor),
          `Broken anchor #${anchor} on ${path} (linked from ${source})`);
      }
    }
    console.log(`PASS public navigation: ${path}`);
  }

  console.log(`PASS: ${sitemapPaths.size} indexed pages, ${links.size} working public destinations, and all local anchors`);
}

await audit();
