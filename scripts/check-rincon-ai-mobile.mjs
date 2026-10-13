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

test("Rincón AI restores keyboard navigation without opening the phone keyboard", () => {
  assert.match(source, /useEffect\(/, "Keyboard listener only mounted when widget is open");
  assert.match(source, /if \(!isOpen\) \{\s*return;/);
  assert.match(source, /closeButtonRef\.current\?\.focus\(\)/,
    "Focus close button rather than textarea to avoid mobile keyboard pop-up");
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /setIsOpen\(false\);\s*launcherRef\.current\?\.focus\(\)/,
    "Esc must close and return focus to the Rincón AI launcher");
  assert.match(source, /document\.addEventListener\("keydown", handleEscape\)/);
  assert.match(source, /document\.removeEventListener\("keydown", handleEscape\)/,
    "Removing listener on close/unmount prevents leaked document handlers");
  assert.match(source, /aria-controls="rincon-ai-panel"/);
  assert.match(source, /id="rincon-ai-panel"/);
  assert.match(source, /ref=\{launcherRef\}/);
  assert.match(source, /ref=\{closeButtonRef\}/);
});

test("assistant links close the panel so it cannot cover menu, location or ordering", () => {
  assert.match(source, /message\.href[\s\S]*?onClick=\{\(\) => setIsOpen\(false\)\}/,
    "Reply action must collapse assistant before scrolling or navigating");
  for (const href of ['href="#menu"', "href={orderHref}", "href={contactHref}", 'href="#locations"']) {
    const i = source.indexOf(href, source.indexOf('id="rincon-ai-panel"'));
    assert.ok(i >= 0, `Missing functional Rincón AI quick link: ${href}`);
    assert.match(source.slice(i, i + 130), /onClick=\{\(\) => setIsOpen\(false\)\}/,
      `Rincón AI must not obscure its destination after ${href}`);
  }
});

test("many repeated questions cannot make the chat DOM grow without limit", () => {
  assert.match(source, /const MAX_VISIBLE_CHAT_MESSAGES = 40;/);
  const guardedUpdates = source.match(/\.slice\(-MAX_VISIBLE_CHAT_MESSAGES\)/g) ?? [];
  assert.equal(guardedUpdates.length, 2,
    "Both assistant and visitor messages require bounded history");
  assert.match(source, /maxLength=\{600\}/,
    "Each individual user message must have a reasonable length bound");
});
