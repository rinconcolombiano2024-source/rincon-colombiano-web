/**
 * Read-only launch verification for the CEO dashboard.
 *
 * A legacy deployment (or a stale Next.js alias) may expose a valid PWA
 * manifest. That does not prove it contains the current Git revision.
 *
 * Never accept an arbitrary URL, follow redirects, send cookies, or accept
 * a missing Git commit SHA as successful publication.
 */
export type OfficialDomainState = "ready" | "not-published" | "unavailable";

const OFFICIAL_ORIGIN = "https://rinconcolombiano.pl";
const GIT_SHA = /^[a-f0-9]{40}$/i;

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function checkOfficialDomainRevision(
  expectedRevision: string | null,
  request: typeof fetch = fetch,
): Promise<OfficialDomainState> {
  // Without a cryptographically formatted revision identifier, we cannot
  // distinguish a correct deployment from a stale copy of the same website.
  if (!expectedRevision || !GIT_SHA.test(expectedRevision)) {
    return "not-published";
  }

  try {
    // Both read-only calls share one deadline: CEO status must never stall
    // for sequential network timeouts. No browser cookies are forwarded.
    const signal = AbortSignal.timeout(3500);
    const [manifestResponse, releaseResponse] = await Promise.all([
      request(`${OFFICIAL_ORIGIN}/admin/manifest.webmanifest`, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal,
        headers: { Accept: "application/manifest+json" },
      }),
      request(`${OFFICIAL_ORIGIN}/release.json`, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal,
        headers: { Accept: "application/json" },
      }),
    ]);

    if (manifestResponse.status !== 200 || releaseResponse.status !== 200) {
      return "not-published";
    }
    const manifestType = manifestResponse.headers.get("content-type") ?? "";
    const releaseType = releaseResponse.headers.get("content-type") ?? "";
    if (!manifestType.toLowerCase().includes("application/manifest+json") ||
        !releaseType.toLowerCase().includes("application/json")) {
      return "not-published";
    }

    const [manifest, release]: [unknown, unknown] = await Promise.all([
      manifestResponse.json(),
      releaseResponse.json(),
    ]);
    if (!isJsonObject(manifest) || !isJsonObject(release)) {
      return "not-published";
    }

    // These casts describe property names only; every value still requires
    // an explicit runtime check before the release can be marked ready.
    const manifestData = manifest as {
      readonly id?: unknown;
      readonly start_url?: unknown;
      readonly scope?: unknown;
    };
    const releaseData = release as {
      readonly project?: unknown;
      readonly revision?: unknown;
    };
    const rightManifest = manifestData.id === "/admin" &&
      manifestData.start_url === "/admin" &&
      manifestData.scope === "/admin";
    const rightRevision = releaseData.project === "rincon-colombiano-web" &&
      releaseData.revision === expectedRevision.toLowerCase();

    return rightManifest && rightRevision ? "ready" : "not-published";
  } catch {
    // Network/DNS/timeout or invalid JSON: status unknown, never green.
    return "unavailable";
  }
}
