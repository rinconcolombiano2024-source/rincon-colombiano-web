import { appendFileSync } from "node:fs";
import { validateVercelPreviewUrl } from "./vercel-preview-url.mjs";

try {
  const normalized = validateVercelPreviewUrl(process.env.PREVIEW_URL);
  const output = process.env.GITHUB_OUTPUT;
  if (!output) {
    throw new Error("Missing GitHub Actions output file.");
  }
  appendFileSync(output, `url=${normalized}\n`, "utf8");
  console.log("PASS: Vercel staging target is a safe HTTPS origin; no credentials, query or external redirects accepted.");
} catch (error) {
  console.error(`BLOCKED: ${error instanceof Error ? error.message : "Invalid preview URL"}`);
  process.exitCode = 1;
}
