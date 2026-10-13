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

// The public domain is deliberately LAST. Verify the Windows test build
// can run separately, with no configurable or shared CEO login origin.
const windowsBuild = await readFile(".github/workflows/windows-ceo-desktop.yml", "utf8");
const windowsInstructions = await readFile("desktop/README-WINDOWS.md", "utf8");
const officialBranch = windows.indexOf("#else", windows.indexOf("#if RC_CEO_STAGING"));
const guardEnd = windows.indexOf("#endif", officialBranch);
assert.ok(officialBranch > 0 && guardEnd > officialBranch,
  "Staging/production origins must be selected only at compile time");
const stagingOrigin = windows.slice(windows.indexOf("#if RC_CEO_STAGING"), officialBranch);
const productionOrigin = windows.slice(officialBranch, guardEnd);
assert.match(stagingOrigin, /https:\/\/rincon-colombiano-web\.vercel\.app/,
  "Staging must be pinned to the exact Rincón Colombiano Web Vercel project alias");
assert.match(productionOrigin, /https:\/\/rinconcolombiano\.pl/,
  "Production executable must remain pinned to the real commercial domain");
assert.doesNotMatch(windows, /Environment\.GetEnvironmentVariable|args\[\d+\]|CommandLineArgs/,
  "Do not allow attackers to redirect the owner login by changing user-supplied URLs");
assert.match(stagingOrigin, /AppMode = " \[PRUEBAS · VERCEL\]"/,
  "Staging title needs an unmistakable visual warning");
assert.match(stagingOrigin, /ProfileDirectory = "CEODesktopStaging"/);
assert.match(productionOrigin, /ProfileDirectory = "CEODesktop"/);
assert.match(windows, /"RinconColombiano", ProfileDirectory, "WebView2"/,
  "No shared local auth cookies between staging and production apps");
assert.match(windows, /AllowAutoRedirect = false/,
  "No following redirects to SumUp or impersonated CEO login pages");
assert.match(windows, /IsPublishedOfficialAdminAsync\(/,
  "The environment-specific /admin manifest must be verified before opening the CEO login");

for (const [filename, expected] of [
  ["RinconColombiano-CEO-Windows-x64", "RinconColombianoAdmin.exe"],
  ["RinconColombiano-CEO-Windows-STAGING-x64", "RinconColombianoCEOStaging.exe"],
]) {
  assert.ok(windowsBuild.includes(filename) && windowsBuild.includes(expected),
    `Missing build or download for ${filename}`);
}
assert.match(windowsBuild, /DefineConstants=RC_CEO_STAGING/,
  "Staging build must compile the immutable staging branch");
assert.match(windowsBuild, /PublishSingleFile=true/,
  "Native CEO distributions must remain self-contained");
assert.match(windowsBuild, /Get-FileHash[\s\S]*?SHA256/,
  "Owner should receive a checksum for Windows binary verification");
assert.match(windowsInstructions, /BASES DE DATOS y cuentas de PRUEBA/,
  "Require isolated backend data before mutating test menus/payments");
assert.match(windowsInstructions, /NO CAMBIAR el DNS de SumUp/,
  "Windows test deployment must not force a premature DNS cutover");

assert.match(stagingOrigin, /ProfileDirectory = "CEODesktopStaging"/,
  "Staging app must not share production cookies");
assert.match(windows, /Assembly\.GetExecutingAssembly\(\)/,
  "Staging revision must come from signed-in developer build metadata, not from a user input");
assert.match(windows, /AssemblyInformationalVersionAttribute/,
  "The build-time reviewed SHA must be read from the staging executable");
assert.match(windows, /IsExpectedStagingRevisionAsync\(\)/,
  "Staging must enforce revision parity BEFORE opening the owner login");
assert.match(windows, /OfficialOrigin \+ "\/release\.json"/,
  "Staging must validate immutable revision against the same HTTPS alias");
assert.match(windows, /release\.RootElement/,
  "Reject non-JSON release metadata");
assert.match(windows, /project\.GetString\(\) != "rincon-colombiano-web"/,
  "Do not accept another project's stamp");
assert.match(windows, /StringComparison\.OrdinalIgnoreCase/,
  "Expected SHA and live SHA must match exactly");
assert.match(windows, /expectedRevision\.Length != 40/,
  "No version verification bypass for unset or default build values");
assert.match(windowsBuild, /InformationalVersion=\$env:GITHUB_SHA/,
  "GitHub revision is embedded in staging binary at build, not injected by end user");
assert.match(windowsBuild, /IncludeSourceRevisionInInformationalVersion=false/,
  "Do not append suffixes to the exact SHA used by release.json");
assert.match(windowsBuild, /GITHUB_SHA\.Length -ne 40/,
  "Fail staging build if a valid immutable Git SHA is unavailable");
assert.doesNotMatch(productionOrigin, /IsExpectedStagingRevisionAsync/,
  "Never add a staging gate to the existing official-domain production binary");


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
