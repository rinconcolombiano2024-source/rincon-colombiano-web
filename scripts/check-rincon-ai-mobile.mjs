import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/components/rincon-ai/RinconAiWidget.tsx", import.meta.url),
  "utf8",
);

test("collapsed Rincón AI stays above mobile bottom actions", () => {
  assert.match(source, /\$\{isOpen[\s\S]+?bottom-\[max\(5rem,env\(safe-area-inset-bottom\)\)\]/);
  assert.match(source, /sm:bottom-6/);
});

test("expanded Rincón AI is capped by mobile dynamic viewport", () => {
  assert.match(source, /h-\[min\(34rem,calc\(100dvh-7rem\)\)\]/);
  assert.match(source, /bottom-\[max\(1rem,env\(safe-area-inset-bottom\)\)\]/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
});
