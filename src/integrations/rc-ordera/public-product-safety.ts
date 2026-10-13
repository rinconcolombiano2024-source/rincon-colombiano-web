/**
 * Public catalog commercial safety.
 *
 * A missing or malformed price is NOT a free (0 zł) product. Accept exactly
 * representable prices within the RC ORDERA owner editor's 0..9999 range.
 * Never round, coerce booleans or take a numeric prefix of malformed input.
 */
export function parsePublicMenuPrice(value: unknown): number | null {
  let numberValue: number;

  if (typeof value === "number") {
    numberValue = value;
  } else if (typeof value === "string") {
    const text = value.trim();
    // Accept conventional decimal PLN strings, including Polish comma.
    if (!/^(?:0|[1-9][0-9]{0,3})(?:[.,][0-9]{1,2})?$/.test(text)) {
      return null;
    }
    numberValue = Number(text.replace(",", "."));
  } else {
    return null;
  }

  if (!Number.isFinite(numberValue) ||
      numberValue < 0 ||
      numberValue > 9999 ||
      Math.abs(numberValue * 100 - Math.round(numberValue * 100)) >= 0.000001) {
    return null;
  }

  return numberValue;
}

/**
 * RC ORDERA legacy public catalogs may omit "available": historically this
 * means available. Preserve that behavior ONLY when the field is absent.
 * When it IS supplied, unknown types must never silently become "available".
 */
export function parsePublicMenuAvailability(
  rawValue: unknown,
  fieldPresent: boolean,
): boolean {
  if (typeof rawValue === "boolean") {
    return rawValue;
  }
  return !fieldPresent;
}


/**
 * A public product photo is rendered in customers' browsers, never fetched by
 * the Next.js server. Accept owner-configured external HTTPS photos without
 * userinfo, script/data/blob/file schemes, loopback or local-network hosts.
 * Missing or unsafe links simply render the text-only menu card.
 *
 * RC ORDERA remains the source of truth; this is read-only validation and
 * never modifies the stored image URL.
 */
export function parsePublicProductImageUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const input = value.trim();
  if (!input || input.length > 1600 || /[\u0000-\u001f\u007f]/u.test(input)) {
    return null;
  }
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (
      url.protocol !== "https:" ||
      !hostname || url.username || url.password ||
      (url.port !== "" && url.port !== "443") ||
      !hostname.includes(".") ||
      /^\\d{1,3}(?:\\.\\d{1,3}){3}$/u.test(hostname) ||
      (hostname.startsWith("[") && hostname.endsWith("]")) ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".test") ||
      hostname === "[::1]" ||
      /^127\./u.test(hostname) ||
      /^10\./u.test(hostname) ||
      /^192\.168\./u.test(hostname) ||
      /^169\.254\./u.test(hostname) ||
      /^172\.(?:1[6-9]|2[0-9]|3[01])\./u.test(hostname)
    ) {
      return null;
    }
    // No fragment (it has no role in HTTP asset retrieval).
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
