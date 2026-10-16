import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only integration bridge to the separate IA service.
 * This endpoint deliberately never forwards user input, auth credentials,
 * model requests or paid-provider tokens to the IA service.
 */
export async function GET(): Promise<NextResponse> {
  const configuredUrl = process.env.RINCON_IA_PUBLIC_STATUS_URL?.trim();

  if (!configuredUrl) {
    return NextResponse.json(
      { available: false, reason: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let endpoint: URL;
  try {
    endpoint = new URL(configuredUrl);
    if (
      endpoint.protocol !== "https:" ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== "/api/public-status" ||
      /^(localhost|127\\.|10\\.|192\\.168\\.|169\\.254\\.|0\\.|172\\.(1[6-9]|2\\d|3[01])\\.|\\[?::1)/i.test(endpoint.hostname)
    ) {
      throw new Error("Unsafe IA status endpoint");
    }
  } catch {
    return NextResponse.json(
      { available: false, reason: "invalid_configuration" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(3000),
      headers: { Accept: "application/json" },
    });

    return NextResponse.json(
      { available: response.ok },
      {
        status: response.ok ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      { available: false, reason: "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
