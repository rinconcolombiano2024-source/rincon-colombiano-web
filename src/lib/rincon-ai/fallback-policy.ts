// Adapted from rinconcolombiano2024-source/IA src/core/fallback-executor.js.
// Server-side policy for retrying a restaurant AI provider after safe failures.
export const SAFE_FALLBACK_INTENTS = new Set([
  "router", "text", "document", "restaurant", "book", "code", "website", "repair",
]);
export type ProviderFailure = {
  code?: string;
  providerStatus?: number;
  isClientRequestError?: boolean;
};
export function isFallbackSafeIntent(intent: string): boolean {
  return SAFE_FALLBACK_INTENTS.has(intent.trim().toLowerCase());
}
export function isFallbackEligibleError(error: ProviderFailure | null | undefined): boolean {
  if (!error || error.isClientRequestError === true) return false;
  const code = String(error.code || "").trim().toUpperCase();
  if (code === "REQUEST_DEADLINE_EXCEEDED") return false;
  if (["PROVIDER_NETWORK_ERROR", "PROVIDER_INVALID_RESPONSE", "UPSTREAM_TIMEOUT"].includes(code)) return true;
  if (code === "PROVIDER_HTTP_ERROR") {
    const status = Number(error.providerStatus || 0);
    return [401, 403, 408, 409, 429].includes(status) || status >= 500;
  }
  return false;
}
