import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { normalizePublishedReviews } from "../src/lib/community/published-reviews.ts";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const review = (n, overrides = {}) => ({
  id: id(n), display_name: "  Cliente  ", body: "  Muy rico  ",
  rating: 5, created_at: "2026-10-24T09:00:00Z", ...overrides,
});

test("preserves approved reviews while trimming accidental whitespace", () => {
  assert.deepEqual(normalizePublishedReviews([review(1)]), [{
    id: id(1), display_name: "Cliente", body: "Muy rico",
    rating: 5, created_at: "2026-10-24T09:00:00Z",
  }]);
});

test("rejects invalid database rows that could crash star rendering", () => {
  const invalid = [
    null, [], "review", {}, review(2, { rating: -1 }),
    review(3, { rating: 6 }), review(4, { rating: 2.5 }),
    review(5, { rating: "5" }), review(6, { rating: null }),
    review(7, { display_name: "" }), review(8, { body: " " }),
    review(9, { body: "x".repeat(1001) }),
    review(10, { display_name: "x".repeat(61) }),
    review(11, { id: "<script>" }),
    review(12, { created_at: null }),
  ];
  assert.deepEqual(normalizePublishedReviews(invalid), []);
  assert.deepEqual(normalizePublishedReviews({ reviews: [review(1)] }), []);
});

test("deduplicates published IDs and caps results to twelve", () => {
  const rows = [review(1), review(1), ...Array.from({ length: 20 }, (_, i) => review(i + 2))];
  const normalized = normalizePublishedReviews(rows);
  assert.equal(normalized.length, 12);
  assert.equal(new Set(normalized.map((row) => row.id)).size, 12);
  assert.equal(normalized[0].id, id(1));
  assert.equal(normalized[11].id, id(12));
});

test("public reviews route validates before returning and blocks upstream redirects", () => {
  const route = readFileSync(new URL("../src/app/api/customer-reviews/route.ts", import.meta.url), "utf8");
  assert.match(route, /reviews: normalizePublishedReviews\(reviews\)/);
  assert.match(route, /cache: "no-store", redirect: "error", signal:/);
  assert.match(route, /status=eq\.published/);
  assert.match(route, /return response\(\{ available: false, reviews: \[\] \}\)/);
});
