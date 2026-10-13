import { parsePublicHttpOrigin } from "@/config/public-origin";

export interface SupabasePublicConfig {
  readonly url:
    string;

  readonly key:
    string;
}


function readEnvironmentVariable(
  name:
    string,
): string | null {
  const value =
    process.env[
      name
    ];

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length >
    0
    ? normalized
    : null;
}


/**
 * A malformed backend base URL must never receive the public API key.
 * Production always enforces HTTPS; loopback HTTP is local-only.
 */
function normalizeSupabaseOrigin(value: string): string | null {
  return parsePublicHttpOrigin(
    value,
    process.env.NODE_ENV !== "production",
  );
}


export function getSupabasePublicConfig():
  SupabasePublicConfig | null {
  const url =
    readEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_URL",
    );

  const publishableKey =
    readEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );

  const legacyAnonKey =
    readEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );

  const key =
    publishableKey ??
    legacyAnonKey;

  const safeUrl =
    url ? normalizeSupabaseOrigin(url) : null;

  if (!safeUrl || !key) {
    return null;
  }

  return {
    url: safeUrl,
    key,
  };
}
