import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
function response(data: unknown, status = 200) { return NextResponse.json(data, { status, headers }); }
function config() { return getSupabasePublicConfig(); }
export async function GET() {
  const cfg = config();
  if (!cfg) { return response({ reviews: [] }); }
  try {
    const result = await fetch(`${cfg.url}/rest/v1/customer_reviews?select=id,display_name,body,rating,created_at&status=eq.published&order=created_at.desc&limit=12`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      cache: "no-store", signal: AbortSignal.timeout(3500),
    });
    if (!result.ok) { return response({ reviews: [] }); }
    const reviews: unknown = await result.json();
    return response({ reviews: Array.isArray(reviews) ? reviews : [] });
  } catch { return response({ reviews: [] }); }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") { return response({ error: "forbidden" }, 403); }
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") { return response({ error: "unsupported_media_type" }, 415); }
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) { return response({ error: "forbidden" }, 403); }
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (!/^\d+$/.test(contentLength) || !Number.isSafeInteger(declaredLength)) { return response({ error: "invalid_request" }, 400); }
    if (declaredLength > 2500) { return response({ error: "too_large" }, 413); }
  }
  const cfg = config();
  if (!cfg) { return response({ error: "unavailable" }, 503); }
  let payload: { name?: unknown; body?: unknown; rating?: unknown; website?: unknown };
  try {
    // Enforce the limit while reading, including when Content-Length is missing or false.
    const reader = request.body?.getReader();
    if (!reader) { return response({ error: "invalid_json" }, 400); }
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) { break; }
      size += value.byteLength;
      if (size > 2500) {
        try { await reader.cancel(); } catch { /* Client may already be disconnected. */ }
        return response({ error: "too_large" }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as typeof payload;
  } catch { return response({ error: "invalid_json" }, 400); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) { return response({ error: "invalid_request" }, 400); }
  if (payload.website) { return response({ ok: true, pending: true }, 202); }
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const rating = payload.rating;
  if (name.length < 2 || name.length > 60 || body.length < 10 || body.length > 1000 || !Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5) { return response({ error: "invalid_request" }, 400); }
  try {
    const result = await fetch(`${cfg.url}/rest/v1/customer_reviews`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(3500),
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ display_name: name, body, rating }),
    });
    if (!result.ok) { return response({ error: "unavailable" }, 503); }
    return response({ ok: true, pending: true }, 202);
  } catch { return response({ error: "unavailable" }, 503); }
}
