/**
 * Validate public base URLs before they become canonicals, social links
 * or backend endpoints. A base URL is an ORIGIN, never a credential-bearing
 * URL with a path, query string, or hash.
 *
 * Local HTTP works only in local development. Production/preview builds
 * require HTTPS to avoid publishing insecure URLs or leaking anon keys.
 */
export function parsePublicHttpOrigin(
  input: string | undefined,
  allowLocalHttp = false,
): string | null {
  const candidate = input?.trim();
  if (!candidate || candidate.length > 2048) {
    return null;
  }

  try {
    const url = new URL(candidate);
    // Public HTTPS origins must use a DNS hostname, not a private IP
    // address or internal name. Server-side requests can carry API keys.
    // URL.hostname canonicalizes hexadecimal/octal IPv4 before this check.
    const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
    const isLoopback =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]";
    const isPublicDnsHostname =
      hostname.includes(".") &&
      !/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname) &&
      !hostname.startsWith("[") &&
      ![".localhost", ".local", ".internal", ".test", ".invalid"].some(
        (suffix) => hostname.endsWith(suffix),
      ) &&
      hostname !== "localhost";
    const allowedProtocol =
      (url.protocol === "https:" && isPublicDnsHostname) ||
      (allowLocalHttp && isLoopback && url.protocol === "http:");

    if (!allowedProtocol ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Fail closed to an owner-controlled origin when a public environment
 * variable contains an unsafe or malformed URL.
 */
export function safePublicHttpOrigin(
  input: string | undefined,
  fallback: string,
  allowLocalHttp = false,
): string {
  return parsePublicHttpOrigin(input, allowLocalHttp) ??
    parsePublicHttpOrigin(fallback, allowLocalHttp) ??
    "https://rinconcolombiano.pl";
}
