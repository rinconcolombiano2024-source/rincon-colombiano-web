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
    const isLoopback =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]";
    const allowedProtocol = url.protocol === "https:" ||
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
