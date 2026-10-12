import assert from "node:assert/strict";
import { evaluateLaunchReadiness, isLaunchCertified } from "../src/lib/admin/release-readiness.ts";

const empty = evaluateLaunchReadiness({
  officialDomain: "not-published",
  rcOrderaStatus: "not-configured",
  productCount: 0,
  publishedBrandSlots: [],
  publishedCampaignLocales: [],
});
assert.equal(empty.length, 6);
assert.equal(isLaunchCertified(empty), false);
assert.equal(empty.find((gate) => gate.id === "domain")?.state, "blocked");
assert.equal(empty.find((gate) => gate.id === "catalog")?.state, "blocked");
assert.equal(empty.find((gate) => gate.id === "brand")?.state, "attention");
assert.equal(empty.find((gate) => gate.id === "campaigns")?.state, "attention");
assert.equal(empty.find((gate) => gate.id === "orders")?.state, "blocked");

const fullAutomation = evaluateLaunchReadiness({
  officialDomain: "ready",
  rcOrderaStatus: "ready",
  productCount: 42,
  publishedBrandSlots: [
    "logo_primary", "favicon", "hero_primary",
    "food_featured_1", "food_featured_2", "food_featured_3",
  ],
  publishedCampaignLocales: ["pl", "es", "en"],
});
assert.equal(fullAutomation.filter((gate) => gate.state === "ready").length, 5);
assert.equal(isLaunchCertified(fullAutomation), false,
  "Automated readiness may never certify payments without true E2E tests");

const noMenu = evaluateLaunchReadiness({
  officialDomain: "ready", rcOrderaStatus: "ready", productCount: 0,
  publishedBrandSlots: [], publishedCampaignLocales: [],
});
assert.equal(noMenu.find((gate) => gate.id === "catalog")?.state, "blocked");

console.log("PASS: release readiness never confuses green CI with production acceptance");
