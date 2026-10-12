import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const operations = readFileSync(
  new URL("../src/app/(system)/admin/operations/page.tsx", import.meta.url),
  "utf8",
);
const docs = readFileSync(
  new URL("../docs/payments/SUMUP-TRANSITION.md", import.meta.url),
  "utf8",
);

test("CEO never claims SumUp is live before reconciled payments exist", () => {
  assert.match(operations, /SumUp · Cobros por internet/);
  assert.match(operations, /No activo/);
  assert.match(operations, /no hay un flujo de pago SumUp habilitado/);
  assert.doesNotMatch(operations, /desactivar SumUp/);
  assert.match(operations, /no activar cobros online/);
});

test("web remains marketing only: payment secrets and ledgers belong to RC ORDERA", () => {
  assert.match(docs, /Supabase Edge secrets/);
  assert.match(docs, /no confirma pago/);
  assert.match(docs, /no implementa reparto de fondos/);
  assert.match(docs, /No activar ningún proveedor/);
});
