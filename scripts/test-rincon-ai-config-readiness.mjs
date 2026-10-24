import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { inspectRinconAiConfiguration } from "../src/lib/rincon-ai/config-readiness.ts";
import { isVerifiedRinconAiPublicStatus, parseRinconAiPublicStatusUrl } from "../src/lib/rincon-ai/public-status.ts";

test("native IA reports a missing model instead of inventing real conversation", () => {
  const result = inspectRinconAiConfiguration({ RINCON_IA_MODE: "native" }, false);
  assert.equal(result.configured, false);
  assert.equal(result.issue, "provider");
  assert.match(result.note, /OPENAI_API_KEY/);
});

test("a native provider is only setup-ready, not falsely live-certified", () => {
  const result = inspectRinconAiConfiguration({ RINCON_IA_MODE: "native" }, true);
  assert.equal(result.configured, true);
  assert.equal(result.issue, "none");
  assert.match(result.note, /Falta confirmar respuestas reales/);
});

test("remote bridge accepts only the exact authenticated HTTPS chat endpoint", () => {
  const base = {
    RINCON_IA_CHAT_ENDPOINT: "https://ai.example.com/api/restaurant-chat",
    RINCON_IA_CHAT_HOST: "ai.example.com",
    RINCON_IA_CHAT_TOKEN: "x".repeat(32),
  };
  assert.equal(inspectRinconAiConfiguration(base, false).configured, true);
  for (const changes of [
    { RINCON_IA_CHAT_ENDPOINT: "http://ai.example.com/api/restaurant-chat" },
    { RINCON_IA_CHAT_ENDPOINT: "https://ai.example.com/api/admin" },
    { RINCON_IA_CHAT_ENDPOINT: "https://ai.example.com/api/restaurant-chat?token=unsafe" },
    { RINCON_IA_CHAT_ENDPOINT: "https://attacker.example/api/restaurant-chat" },
    { RINCON_IA_CHAT_ENDPOINT: "https://user:secret@ai.example.com/api/restaurant-chat" },
    { RINCON_IA_CHAT_TOKEN: "too-short" },
    { RINCON_IA_CHAT_HOST: "" },
  ]) {
    const check = inspectRinconAiConfiguration({ ...base, ...changes }, false);
    assert.equal(check.configured, false, JSON.stringify(Object.keys(changes)));
    assert.equal(check.issue, "remote-settings");
  }
});

test("diagnostics never serialize any provider or bridge secret", () => {
  const secret = "PRIVATE_DONT_SHOW_IN_CEO_DASHBOARD";
  for (const check of [
    inspectRinconAiConfiguration({
      RINCON_IA_MODE: "native", OPENAI_API_KEY: secret,
    }, false),
    inspectRinconAiConfiguration({
      RINCON_IA_CHAT_ENDPOINT: "https://ai.example.com/api/restaurant-chat",
      RINCON_IA_CHAT_HOST: "ai.example.com",
      RINCON_IA_CHAT_TOKEN: secret.repeat(2),
    }, false),
  ]) {
    assert.ok(!JSON.stringify(check).includes(secret));
  }
});

test("CEO operations page is access controlled and distinguishes setup from successful chat", () => {
  const operations = readFileSync("src/app/(system)/admin/operations/page.tsx", "utf8");
  assert.match(operations, /const admin = await requireAdminIdentity\(\)/);
  assert.match(operations, /nativeRestaurantChat\(\)\.configured\(\)/);
  assert.match(operations, /rinconAi\.configured/);
  assert.match(operations, /Configurado · sin prueba de respuesta/);
  assert.match(operations, /Ningún token/);
});

test("IA public status only calls safe HTTPS public DNS origins", () => {
  assert.equal(
    parseRinconAiPublicStatusUrl("https://ai.example.com/api/public-status")?.href,
    "https://ai.example.com/api/public-status",
  );
  for (const unsafe of [
    "http://ai.example.com/api/public-status",
    "https://127.0.0.1/api/public-status",
    "https://0x7f000001/api/public-status",
    "https://[::1]/api/public-status",
    "https://[::ffff:127.0.0.1]/api/public-status",
    "https://192.168.1.5/api/public-status",
    "https://ai.local/api/public-status",
    "https://ai.internal/api/public-status",
    "https://ai.localhost/api/public-status",
    "https://localhost./api/public-status",
    "https://internal/api/public-status",
    "https://user:secret@ai.example.com/api/public-status",
    "https://ai.example.com:8443/api/public-status",
    "https://ai.example.com/api/public-status?token=secret",
    "https://ai.example.com/api/public-status#x",
    "https://ai.example.com/api/health",
    "https://ai.example.com.evil.test/api/public-status",
    "https://ai.example.com/api/public-status/extra",
  ]) {
    assert.equal(parseRinconAiPublicStatusUrl(unsafe), null, unsafe);
  }
});

test("IA public status requires actual IA JSON contract, never just HTTP 200", () => {
  const healthy = {
    ok: true,
    publicAccess: true,
    requiresAuthenticationForGeneration: true,
  };
  assert.equal(isVerifiedRinconAiPublicStatus(healthy), true);
  for (const invalid of [
    null, [], "OK", {}, { ok: true }, { ...healthy, ok: false },
    { ...healthy, publicAccess: false },
    { ...healthy, requiresAuthenticationForGeneration: false },
  ]) {
    assert.equal(isVerifiedRinconAiPublicStatus(invalid), false);
  }
  const route = readFileSync("src/app/api/rincon-ai/status/route.ts", "utf8");
  assert.match(route, /parseRinconAiPublicStatusUrl\(configuredUrl\)/);
  assert.match(route, /contentType === "application\/json"/);
  assert.match(route, /isVerifiedRinconAiPublicStatus\(payload\)/);
  assert.match(route, /generationVerified: false/);
  assert.doesNotMatch(route, /available: response\.ok/);
});
