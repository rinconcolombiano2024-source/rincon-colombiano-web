/**
 * Public, read-only deployment fingerprint. Git commit IDs are public in
 * GitHub; NEVER put environment-variable contents or other secrets here.
 *
 * Vercel's system variable takes precedence. GitHub's SHA is used only in
 * local CI smoke builds. Missing/malformed metadata fails closed as null.
 */
export function publicReleaseFingerprint(
  env: Readonly<Record<string, string | undefined>> = process.env,
): { readonly project: "rincon-colombiano-web"; readonly revision: string | null } {
  const candidate = env["VERCEL_GIT_COMMIT_SHA"] ?? env["GITHUB_SHA"];
  const revision = candidate && /^[0-9a-f]{40}$/i.test(candidate)
    ? candidate.toLowerCase()
    : null;

  return {
    project: "rincon-colombiano-web",
    revision,
  };
}
