import { isIP } from "node:net";

/**
 * The remote IA public-status URL is an outbound server request. Reject local
 * destinations and malformed URLs before issuing it. DNS rebinding still
 * requires network-level egress controls; this is a configuration guard.
 */
export function parseRinconAiPublicStatusUrl(input: string | undefined): URL | null {
  const value = input?.trim();
  if (!value || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const unbracketedHost = host.startsWith("[") && host.endsWith("]")
      ? host.slice(1, -1)
      : host;
    const internalSuffixes = [
      ".localhost", ".local", ".internal", ".lan", ".home.arpa",
      ".test", ".invalid", ".onion",
    ];

    if (
      url.protocol !== "https:" ||
      url.username || url.password || url.port ||
      url.search || url.hash ||
      url.pathname !== "/api/public-status" ||
      host.endsWith(".") ||
      !host.includes(".") ||
      isIP(unbracketedHost) !== 0 ||
      host === "localhost" ||
      internalSuffixes.some((suffix) => host.endsWith(suffix))
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * A 200 response alone is not proof that the IA status API was reached.
 * Match the exact public contract implemented by the separate IA repository.
 * This confirms its public health route, NOT paid-model readiness.
 */
export function isVerifiedRinconAiPublicStatus(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  const status = payload as {
    ok?: unknown;
    publicAccess?: unknown;
    requiresAuthenticationForGeneration?: unknown;
  };
  return status.ok === true &&
    status.publicAccess === true &&
    status.requiresAuthenticationForGeneration === true;
}
