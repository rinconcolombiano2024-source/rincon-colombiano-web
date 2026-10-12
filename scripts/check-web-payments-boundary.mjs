import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const envTemplate = readFileSync(
  new URL("../.env.example", import.meta.url), "utf8",
);
const operations = readFileSync(
  new URL("../src/app/(system)/admin/operations/page.tsx", import.meta.url), "utf8",
);

test("public marketing web has no payment provider secret settings", () => {
  for (const name of [
    "NEXT_PUBLIC_PAYMENTS_ENABLED",
    "PAYMENT_PROVIDER",
    "PAYMENT_API_KEY",
    "PAYMENT_WEBHOOK_SECRET",
  ]) {
    assert.doesNotMatch(envTemplate, new RegExp(`^\\s*${name}=.*$`, "m"), name);
  }
});

test("CEO panel does not pretend to own RC ORDERA payment integrations", () => {
  assert.doesNotMatch(operations, /SumUp · Cobros por internet/);
  assert.doesNotMatch(operations, /desactivar SumUp/);
  assert.match(operations, /RC ORDERA conserva/);
  assert.match(operations, /no ejecuta pedidos de prueba/);
});
