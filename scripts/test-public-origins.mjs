import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  parsePublicHttpOrigin,
  safePublicHttpOrigin,
} from "../src/config/public-origin.ts";

test("public site, metadata and Supabase base origins reject hostile URL components", () => {
  for (const input of [
    "http://example.com",
    "http://localhost:3000",
    "http://127.0.0.1:54321",
    "https://user:password@example.com",
    "https://example.com/project",
    "https://example.com/?session=token",
    "https://example.com/#credentials",
    "https://example.com:99999",
    "https://example.com\\@evil.example",
    "data:text/html,<h1>unsafe</h1>",
    ["java", "script:alert(1)"].join(""),
    "",
    " ",
  ]) {
    assert.equal(parsePublicHttpOrigin(input), null, input);
  }
});

test("HTTPS host origins normalize safely, with no path or credentials", () => {
  assert.equal(parsePublicHttpOrigin("https://rinconcolombiano.pl/"), "https://rinconcolombiano.pl");
  assert.equal(parsePublicHttpOrigin(" https://project.supabase.co:443/ "), "https://project.supabase.co");
  assert.equal(parsePublicHttpOrigin("https://preview.vercel.app:8443/"), "https://preview.vercel.app:8443");
  assert.equal(parsePublicHttpOrigin(undefined), null);
});

test("HTTP loopback only works with explicit local-development permission", () => {
  assert.equal(parsePublicHttpOrigin("http://localhost:3000", true), "http://localhost:3000");
  assert.equal(parsePublicHttpOrigin("http://127.0.0.1:54321/", true), "http://127.0.0.1:54321");
  assert.equal(parsePublicHttpOrigin("http://[::1]:54321/", true), "http://[::1]:54321");
  assert.equal(parsePublicHttpOrigin("http://example.com", true), null);
  assert.equal(parsePublicHttpOrigin("http://localhost:3000/auth/v1", true), null);
  assert.equal(parsePublicHttpOrigin("http://localhost:3000", false), null);
});

test("malformed configured origins fail closed to the official HTTPS domain", () => {
  const fallback = "https://rinconcolombiano.pl";
  assert.equal(safePublicHttpOrigin("https://evil.example/redirect", fallback), fallback);
  assert.equal(safePublicHttpOrigin("http://evil.example", fallback), fallback);
  assert.equal(safePublicHttpOrigin("https://new.example/", fallback), "https://new.example");
  assert.equal(safePublicHttpOrigin(undefined, "http://localhost:3000", true), "http://localhost:3000");
  assert.equal(safePublicHttpOrigin(undefined, "http://localhost:3000", false), fallback);
});

test("site, SEO and Supabase all consume one tested origin validator", () => {
  const site = readFileSync("src/config/site.ts", "utf8");
  const seo = readFileSync("src/config/seo.ts", "utf8");
  const supabase = readFileSync("src/lib/supabase/config.ts", "utf8");
  assert.match(site, /safePublicHttpOrigin\(/);
  assert.match(site, /process\.env\.NODE_ENV === "production"/);
  assert.match(seo, /safePublicHttpOrigin\(/);
  assert.match(seo, /SEO_PRODUCTION_ORIGIN/);
  assert.match(supabase, /parsePublicHttpOrigin\(/);
  assert.match(supabase, /process\.env\.NODE_ENV !== "production"/);
  assert.match(supabase, /url: safeUrl/);
});
