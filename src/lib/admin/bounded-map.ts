/**
 * Bounded concurrency for nonessential CEO diagnostics.
 * Strictly preserves list order, forwards errors to the caller, and never
 * initiates financial transactions or modifies data.
 */
export async function mapWithConcurrencyLimit<T, U>(
  source: readonly T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<U>,
): Promise<U[]> {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new RangeError("INVALID_CONCURRENCY_LIMIT");
  }
  const result: U[] = new Array(source.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < source.length) {
      const current = cursor++;
      result[current] = await mapper(source[current], current);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, source.length) }, () => worker()),
  );
  return result;
}
