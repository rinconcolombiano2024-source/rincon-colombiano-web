import assert from "node:assert/strict";
import { validateVercelPreviewUrl } from "./vercel-preview-url.mjs";

const accepted = [
  ["https://rincon-colombiano-web-team.vercel.app", "https://rincon-colombiano-web-team.vercel.app"],
  ["https://rc-web-git-main-test.vercel.app/", "https://rc-web-git-main-test.vercel.app"],
];
for (const [input, output] of accepted) {
  assert.equal(validateVercelPreviewUrl(input), output);
}

for (const candidate of [
  "http://preview-project.vercel.app",
  "https://vercel.app",
  "https://preview-project.vercel.app.evil.example",
  "https://evil.com",
  "https://127.0.0.1",
  "https://localhost:3000",
  "https://preview-project.vercel.app:444",
  "https://user:password@preview-project.vercel.app",
  "https://preview-project.vercel.app/admin",
  "https://preview-project.vercel.app/?x=bypass",
  "https://preview-project.vercel.app/?x=1#anchor",
  "https://preview-project.vercel.app\nevil=yes",
  "https://-bad.vercel.app",
  "https://bad-.vercel.app",
  "https://preview_project.vercel.app",
  "https://preview.project.vercel.app",
  "https://rinconcolombiano.pl",
  "",
  null,
]) {
  assert.throws(() => validateVercelPreviewUrl(candidate));
}

console.log("PASS: staging URL gate accepts only clean HTTPS project.vercel.app origins");
