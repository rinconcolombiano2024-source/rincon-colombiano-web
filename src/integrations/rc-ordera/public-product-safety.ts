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
