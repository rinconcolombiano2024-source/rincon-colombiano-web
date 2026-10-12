/**
 * Prevent arbitrary release-gate input from turning GitHub Actions into an
 * HTTP probe of private networks, untrusted domains or leaked bypass tokens.
 *
 * This is exclusively for Vercel preview origins, NOT the public SumUp domain.
 */
export function validateVercelPreviewUrl(input) {
  if (typeof input !== "string" || input.length < 20 || input.length > 250 ||
      /[\s\u0000-\u001f]/.test(input)) {
    throw new Error("Provide a valid HTTPS Vercel preview URL without spaces or newlines.");
  }

  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Preview URL must be a complete, valid URL.");
  }

  if (url.protocol !== "https:" ||
      url.username || url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search || url.hash ||
      !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(url.hostname)) {
    throw new Error("Only direct HTTPS *.vercel.app preview origins are permitted; no path, port, query, credentials or fragments.");
  }
  return url.origin;
}
