import { nativeRestaurantChat } from "@/lib/rincon-ai/native";
import { isVerifiedRinconAiPublicStatus, parseRinconAiPublicStatusUrl } from "@/lib/rincon-ai/public-status";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only integration bridge to the separate IA service.
 * This endpoint deliberately never forwards user input, auth credentials,
 * model requests or paid-provider tokens to the IA service.
 */
export async function GET(): Promise<NextResponse> {
  if (process.env["RINCON_IA_MODE"] === "native") {
    try {
      const available = nativeRestaurantChat().configured();
      return NextResponse.json({ available }, { status: available ? 200 : 503, headers: { "Cache-Control": "no-store" } });
    } catch {
      return NextResponse.json({ available: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }
  const configuredUrl = process.env["RINCON_IA_PUBLIC_STATUS_URL"]?.trim();

  if (!configuredUrl) {
    return NextResponse.json(
      { available: false, reason: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const endpoint = parseRinconAiPublicStatusUrl(configuredUrl);
  if (!endpoint) {
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

    // The IA repository's public endpoint reports public access, not whether
    // a paid model can generate a response. Never trust HTTP 200 or HTML alone.
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    let available = false;
    if (response.ok && contentType === "application/json") {
      const payload: unknown = await response.json();
      available = isVerifiedRinconAiPublicStatus(payload);
    }

    return NextResponse.json(
      { available, generationVerified: false },
      {
        status: available ? 200 : 503,
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
