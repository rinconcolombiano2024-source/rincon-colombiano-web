import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const windows = await readFile("desktop/RinconColombianoAdmin/Program.cs", "utf8");
const adminRoutes = [
  "/admin/operations", "/admin/menu", "/admin/home", "/admin/seo",
  "/admin/marketing", "/admin/brand", "/admin/content",
];
assert.match(windows, /HashSet<string> AdminShortcuts/,
  "Native CEO shortcuts must use an explicit route allowlist");
assert.match(windows, /AdminShortcuts.Contains\(path\)/,
  "Untrusted native navigation must be checked before opening WebView2");
assert.match(windows, /IsOfficialAdminNavigation\(target.AbsoluteUri\)/,
  "Native route navigation must remain within official HTTPS admin origin");
assert.match(windows, /if \(IsDisposed \|\| _connecting\)/,
  "CEO app must avoid overlapping connection checks and WebView2 setup");
assert.match(windows, /_connecting = false/,
  "CEO app must release the connection gate after errors");
for (const route of adminRoutes) {
  assert.ok(windows.includes(`"${route}"`),
    `Missing native CEO destination: ${route}`);
  const dir = route.replace("/admin/", "");
  await access(`src/app/(system)/admin/${dir}/page.tsx`);
}
const executableWindowsCode = windows.split("\n")
  .filter((line) => !line.trimStart().startsWith("//"))
  .join("\n");
assert.doesNotMatch(executableWindowsCode, /service_role|supabaseKey|adminPassword/,
  "Never embed privileged API keys or owner credentials in executable Windows code");

const editor = await readFile("src/components/admin/RcOrderaMenuManager.tsx", "utf8");
assert.match(editor, /serverSnapshotEpoch/,
  "Form state must reset when a remote menu snapshot is refreshed");
assert.match(editor, /setServerSnapshotEpoch\(\(value\) => value \+ 1\)/,
  "Server-save, reload or discarded draft should invalidate stale form state");
assert.match(editor, /\$\{selected.id\}:\$\{serverSnapshotEpoch\}/,
  "Product card must remount on an updated snapshot of the same product");
assert.match(editor, /window.addEventListener\("beforeunload", warnBeforeUnload\)/,
  "Protect uncommitted menu drafts from accidental browser closes or reloads");
assert.match(editor, /setBusy\(true\);[\s\S]*?Storage RLS/,
  "Image upload must lock product navigation until upload finishes");
assert.match(editor, /finally \{\s*setBusy\(false\);\s*\}/,
  "Upload lock must be released after errors as well as success");

console.log("PASS: Windows CEO official shortcuts and menu-editor snapshot/upload safety");
