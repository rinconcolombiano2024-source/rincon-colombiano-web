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


function isValidSupabaseUrl(
  value:
    string,
): boolean {
  try {
    const url =
      new URL(
        value,
      );

    if (
      url.protocol ===
      "https:"
    ) {
      return true;
    }

    return (
      url.protocol ===
        "http:" &&
      (
        url.hostname ===
          "localhost" ||
        url.hostname ===
          "127.0.0.1"
      )
    );
  } catch {
    return false;
  }
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

  if (
    !url ||
    !key ||
    !isValidSupabaseUrl(
      url,
    )
  ) {
    return null;
  }

  return {
    url,
    key,
  };
}
