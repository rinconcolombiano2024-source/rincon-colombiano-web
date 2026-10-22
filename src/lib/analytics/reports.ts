import { createSign } from "node:crypto";

type Environment = Record<string, string | undefined>;
type Row = { label: string; values: number[] };
export type AnalyticsResult =
  | { status: "not-configured" | "unavailable" }
  | { status: "ready"; totals: number[]; days: Row[]; pages: Row[]; sources: Row[]; orderClicks: number; updatedAt: string; timeZone: string };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

/** The CEO may inspect setup without using credentials or calling Google. */
export function getAnalyticsReadiness(env: Environment = process.env): {
  trackingConfigured: boolean;
  reportingConfigured: boolean;
} {
  const tracking = env['NEXT_PUBLIC_GA_MEASUREMENT_ID'] ?? "";
  return {
    trackingConfigured: /^G-[A-Z0-9]+$/.test(tracking),
    reportingConfigured: /^\d+$/.test(env['GA_PROPERTY_ID'] ?? "") &&
      Boolean(env['GA_CLIENT_EMAIL']?.endsWith(".iam.gserviceaccount.com")) &&
      Boolean(env['GA_PRIVATE_KEY']),
  };
}

export function analyticsPeriod(value: unknown): 7 | 30 | 90 {
  return value === "7" ? 7 : value === "90" ? 90 : 30;
}

type Payload = { rows?: unknown; metricValues?: unknown; value?: unknown; dimensionValues?: unknown; access_token?: unknown; reports?: unknown; metadata?: unknown; timeZone?: unknown };

function record(value: unknown): Payload {
  if (!value || typeof value !== "object" || Array.isArray(value)) { throw new Error("Invalid report"); }
  return value as Payload;
}

function rows(value: unknown, metrics: number, hasDimension: boolean): Row[] {
  const report = record(value);
  if (report.rows === undefined) { return []; } // GA omits rows for an empty report.
  if (!Array.isArray(report.rows) || report.rows.length > 100) { throw new Error("Invalid rows"); }
  return report.rows.map((value: unknown) => {
    const row = record(value);
    const values = row.metricValues;
    if (!Array.isArray(values) || values.length !== metrics) { throw new Error("Invalid metrics"); }
    const numbers = values.map((value: unknown) => {
      const text = record(value).value;
      if (typeof text !== "string" || !/^\d+$/.test(text)) { throw new Error("Invalid count"); }
      const count = Number(text);
      if (!Number.isSafeInteger(count)) { throw new Error("Invalid count"); }
      return count;
    });
    const dimensions = row.dimensionValues;
    const label = hasDimension && Array.isArray(dimensions) ? record(dimensions[0]).value : "";
    if (typeof label !== "string" || label.length > 2048) { throw new Error("Invalid label"); }
    return { label, values: numbers };
  });
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new Error("Analytics unavailable");
  }
  const reader = response.body?.getReader();
  if (!reader) { throw new Error("Empty response"); }
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { break; }
      size += value.byteLength;
      if (size > 262144) { throw new Error("Oversized response"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}

/** Server-only Google reporting. Call only AFTER the existing admin guard.
 * Fixed endpoints, read-only scope, no browser credentials and bounded requests.
 */
export function createAnalyticsReporter({ env = process.env, fetchImpl = fetch, now = Date.now }: {
  env?: Environment; fetchImpl?: typeof fetch; now?: () => number;
} = {}) {
  const cache = new Map<number, { expires: number; result: AnalyticsResult }>();
  const pending = new Map<number, Promise<AnalyticsResult>>();

  async function query(days: 7 | 30 | 90): Promise<AnalyticsResult> {
    const property = env['GA_PROPERTY_ID'];
    const email = env['GA_CLIENT_EMAIL'];
    const privateKey = env['GA_PRIVATE_KEY']?.replace(/\\n/g, "\n");
    if (!getAnalyticsReadiness(env).reportingConfigured || !property || !email || !privateKey) {
      return { status: "not-configured" };
    }
    try {
      const issued = Math.floor(now() / 1000);
      const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
      const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: issued, exp: issued + 300 })}`;
      const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url");
      const signal = AbortSignal.timeout(10000);
      const token = record(await boundedJson(await fetchImpl(TOKEN_URL, {
        method: "POST", cache: "no-store", redirect: "error", signal,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }).toString(),
      })));
      if (typeof token.access_token !== "string" || !token.access_token) { throw new Error("Missing token"); }
      const base = { dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: "today" }], limit: "100" };
      const metric = (name: string) => ({ name });
      const response = record(await boundedJson(await fetchImpl(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`, {
        method: "POST", cache: "no-store", redirect: "error", signal,
        headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [
          { ...base, metrics: ["totalUsers", "sessions", "screenPageViews"].map(metric) },
          { ...base, dimensions: [{ name: "date" }], metrics: [metric("screenPageViews")], orderBys: [{ dimension: { dimensionName: "date" } }] },
          { ...base, dimensions: [{ name: "pagePath" }], metrics: [metric("screenPageViews")], limit: "10", orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }] },
          { ...base, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [metric("sessions")], limit: "10", orderBys: [{ metric: { metricName: "sessions" }, desc: true }] },
          { ...base, metrics: [metric("eventCount")], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "select_order_channel" } } } },
        ] }),
      })));
      const reports = response.reports;
      if (!Array.isArray(reports) || reports.length !== 5) { throw new Error("Incomplete reports"); }
      const metadata = record(record(reports[0]).metadata ?? {});
      return {
        status: "ready", totals: rows(reports[0], 3, false)[0]?.values ?? [0, 0, 0],
        days: rows(reports[1], 1, true), pages: rows(reports[2], 1, true), sources: rows(reports[3], 1, true),
        orderClicks: rows(reports[4], 1, false)[0]?.values[0] ?? 0,
        updatedAt: new Date(now()).toISOString(),
        timeZone: typeof metadata.timeZone === "string" ? metadata.timeZone : "Google Analytics",
      };
    } catch { return { status: "unavailable" }; } // Never leak credentials or upstream bodies.
  }

  return async (period: unknown): Promise<AnalyticsResult> => {
    const days = analyticsPeriod(period);
    const saved = cache.get(days);
    if (saved && saved.expires > now()) { return saved.result; }
    const running = pending.get(days);
    if (running) { return running; }
    const request = query(days).then(result => {
      cache.set(days, { result, expires: now() + (result.status === "ready" ? 60000 : 10000) });
      return result;
    }).finally(() => pending.delete(days));
    pending.set(days, request);
    return request;
  };
}

export const getAnalyticsReport = createAnalyticsReporter();
