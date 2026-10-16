import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION = 800;
const MAX_HISTORY = 6;
const MAX_RESPONSE = 1200;
const TIMEOUT_MS = 9000;

// Deliberately disabled until a protected IA service, rate limiting and
// operational budget controls are configured. Never expose Basic credentials
// to browsers or use the IA administrative API directly from the client.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const unavailable = () => NextResponse.json(
    { available: false, reason: "not_configured" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );

  // Reject cross-site browser requests before spending paid IA resources.
  // This is defense-in-depth, not a replacement for provider-side rate limits.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return NextResponse.json(
      { error: "unsupported_media_type" },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }

  const endpointString = process.env["RINCON_IA_CHAT_ENDPOINT"];
  const sharedToken = process.env["RINCON_IA_CHAT_TOKEN"];
  if (!endpointString || !sharedToken || sharedToken.length < 32) {
    return unavailable();
  }

  let endpoint: URL;
  try {
    endpoint = new URL(endpointString);
    const allowedHost = process.env["RINCON_IA_CHAT_HOST"];
    if (
      endpoint.protocol !== "https:" ||
      !allowedHost ||
      endpoint.hostname !== allowedHost ||
      endpoint.pathname !== "/api/restaurant-chat" ||
      endpoint.username || endpoint.password ||
      endpoint.search || endpoint.hash
    ) {
      return unavailable();
    }
  } catch {
    return unavailable();
  }

  let payload: unknown;
  try {
    // Bound the actual streamed bytes, not the untrusted Content-Length.
    // Cancel as soon as the limit is exceeded to avoid buffering large bodies.
    const reader = request.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > 5000) {
        await reader.cancel();
        return NextResponse.json({ error: "too_large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = payload as { question?: unknown; locale?: unknown; history?: unknown };
  if (
    typeof input.question !== "string" ||
    input.question.trim().length < 1 ||
    input.question.length > MAX_QUESTION ||
    !["es", "pl", "en"].includes(String(input.locale))
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const history = Array.isArray(input.history)
    ? input.history.slice(-MAX_HISTORY).filter(
      (entry): entry is { role: "user" | "assistant"; text: string } =>
        !!entry && typeof entry === "object" &&
        ["user", "assistant"].includes(entry.role) &&
        typeof entry.text === "string" && entry.text.length <= MAX_QUESTION,
    )
    : [];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sharedToken}`,
      },
      body: JSON.stringify({
        question: input.question.trim(),
        locale: input.locale,
        history,
      }),
    });
    if (!response.ok) { return unavailable(); }
    const result: unknown = await response.json();
    if (
      !result || typeof result !== "object" ||
      typeof (result as { answer?: unknown }).answer !== "string"
    ) { return unavailable(); }
    const answer = (result as { answer: string }).answer.trim();
    if (!answer || answer.length > MAX_RESPONSE) { return unavailable(); }
    return NextResponse.json(
      { available: true, answer },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return unavailable();
  }
}
