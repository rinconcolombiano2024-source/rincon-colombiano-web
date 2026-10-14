import assert from "node:assert/strict";
import test from "node:test";
import {
  getRcOrderaPublicAppUrl,
  getRcOrderaServerConfig,
  getRcOrderaIntegrationReadiness,
  buildRcOrderaOrderUrl,
} from "../src/integrations/rc-ordera/config.ts";

const vars = [
  "NODE_ENV",
  "RC_ORDERA_SUPABASE_URL",
  "RC_ORDERA_API_TIMEOUT_MS",
  "RC_ORDERA_SUPABASE_ANON_KEY",
  "RC_ORDERA_PUBLIC_APP_URL",
  "NEXT_PUBLIC_ORDER_APP_URL",
  "CZAPELSKA_LOCATION_ID",
];

function withEnv(overrides, fn) {
  const original = new Map(vars.map((key) => [key, process.env[key]]));
  try {
    for (const key of vars) {
      if (Object.hasOwn(overrides, key)) {
        if (overrides[key] === null) {
          delete process.env[key];
        } else {
          process.env[key] = overrides[key];
        }
      }
    }
    return fn();
  } finally {
    for (const [key, value] of original) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

const defaultApp = "https://rincon-colombiano-pedidosapp.vercel.app";
const config = {
  RC_ORDERA_SUPABASE_ANON_KEY: "a".repeat(48),
  RC_ORDERA_PUBLIC_APP_URL: null,
  NEXT_PUBLIC_ORDER_APP_URL: null,
};

test("RC ORDERA server requests reject remote HTTP and injected URL components", () => {
  withEnv({ ...config, NODE_ENV: "production" }, () => {
    for (const value of [
      "http://example.com",
      "http://localhost:54321",
      "https://user:password@example.com",
      "https://example.com/project",
      "https://example.com/?key=value",
      "https://example.com/#fragment",
      ["java", "script:alert(1)"].join(""),
    ]) {
      const server = withEnv({ RC_ORDERA_SUPABASE_URL: value }, getRcOrderaServerConfig);
      assert.equal(server, null, value);
    }
    const valid = withEnv(
      { RC_ORDERA_SUPABASE_URL: "https://project.supabase.co/" },
      getRcOrderaServerConfig,
    );
    assert.equal(valid?.supabaseUrl, "https://project.supabase.co");
  });
});

test("RC ORDERA timeout remains bounded and rejects junk or truncated numeric values", () => {
  const base = {
    ...config,
    NODE_ENV: "production",
    RC_ORDERA_SUPABASE_URL: "https://project.supabase.co",
  };
  for (const [input, expected] of [
    ["8000", 8000], ["1000", 1000], ["30000", 30000],
    ["100", 1000], ["999999", 30000],
    ["8000junk", 8000], ["0x10", 8000], ["8.5", 8000],
    ["1e5", 8000], ["-1", 8000], ["NaN", 8000],
    ["99999999999999999999999999999", 8000], ["", 8000],
  ]) {
    const result = withEnv({ ...base, RC_ORDERA_API_TIMEOUT_MS: input }, getRcOrderaServerConfig);
    assert.equal(result?.timeoutMs, expected, JSON.stringify(input));
  }
});

test("local HTTP is permitted only for local development", () => {
  const value = "http://127.0.0.1:54321";
  const server = withEnv({
    ...config,
    NODE_ENV: "development",
    RC_ORDERA_SUPABASE_URL: value,
  }, getRcOrderaServerConfig);
  assert.equal(server?.supabaseUrl, value);
  const production = withEnv({
    ...config,
    NODE_ENV: "production",
    RC_ORDERA_SUPABASE_URL: value,
  }, getRcOrderaServerConfig);
  assert.equal(production, null);
});

test("customer redirects fall back to trusted order origin for unsafe settings", () => {
  withEnv({ ...config, NODE_ENV: "production" }, () => {
    for (const value of [
      "http://evil.example",
      "http://localhost:3000",
      "https://user:pass@example.com",
      "https://example.com/cliente.html?secret=1",
      "https://example.com/#fragment",
      "data:text/html,<h1>bad</h1>",
    ]) {
      withEnv({ RC_ORDERA_PUBLIC_APP_URL: value }, () => {
        assert.equal(getRcOrderaPublicAppUrl(), defaultApp, value);
      });
    }
    withEnv({ RC_ORDERA_PUBLIC_APP_URL: "https://orders.example.com/" }, () => {
      assert.equal(getRcOrderaPublicAppUrl(), "https://orders.example.com");
    });
  });
});

test("Czapelska link preserves public restaurant ID and direct RC ORDERA client path", () => {
  withEnv({ ...config, NODE_ENV: "production" }, () => {
    const result = new URL(buildRcOrderaOrderUrl("czapelska"));
    assert.equal(result.origin, defaultApp);
    assert.equal(result.pathname, "/cliente.html");
    assert.equal(result.searchParams.get("store"), "9702bf42-2f50-46b2-8f8a-d5f80ba576d5");
    assert.equal(result.searchParams.get("app"), "v91.0.4");
  });
});


test("RC ORDERA readiness rejects invalid populated credentials and restaurant IDs without leaking secrets", () => {
  withEnv({
    ...config,
    NODE_ENV: "production",
    RC_ORDERA_SUPABASE_URL: "https://real-project.supabase.co",
    CZAPELSKA_LOCATION_ID: null,
  }, () => {
    const ready = getRcOrderaIntegrationReadiness();
    assert.equal(ready.configured, true);
    assert.deepEqual(ready.missing, []);
    assert.deepEqual(ready.invalid, []);

    for (const endpoint of [
      "http://public.example",
      "https://operator:password@public.example",
      "https://public.example/private/path",
      "https://public.example/?apikey=secret",
      "https://public.example/#fragment",
      "invalid-url",
    ]) {
      const result = withEnv(
        { RC_ORDERA_SUPABASE_URL: endpoint },
        getRcOrderaIntegrationReadiness,
      );
      assert.equal(result.configured, false, endpoint);
      assert.deepEqual(result.invalid, ["RC_ORDERA_SUPABASE_URL"], endpoint);
      assert.deepEqual(result.missing, []);
      assert.ok(!JSON.stringify(result).includes("secret"), "Do not leak credentials in diagnostics");
    }

    const shortKey = withEnv(
      { RC_ORDERA_SUPABASE_ANON_KEY: "short-key" },
      getRcOrderaIntegrationReadiness,
    );
    assert.equal(shortKey.configured, false);
    assert.deepEqual(shortKey.invalid, ["RC_ORDERA_SUPABASE_ANON_KEY"]);
    assert.deepEqual(shortKey.missing, []);
    assert.ok(!JSON.stringify(shortKey).includes("short-key"));

    const invalidStore = withEnv(
      { CZAPELSKA_LOCATION_ID: "wrong-restaurant" },
      getRcOrderaIntegrationReadiness,
    );
    assert.equal(invalidStore.configured, false,
      "Even if the stable public fallback keeps existing customer links working");
    assert.deepEqual(invalidStore.invalid, ["CZAPELSKA_LOCATION_ID"]);

    const validStore = withEnv(
      { CZAPELSKA_LOCATION_ID: "9702bf42-2f50-46b2-8f8a-d5f80ba576d5" },
      getRcOrderaIntegrationReadiness,
    );
    assert.equal(validStore.configured, true);
  });
});

test("readiness reports missing configuration separately and does not claim connection success", () => {
  const missing = withEnv({
    ...config,
    NODE_ENV: "production",
    RC_ORDERA_SUPABASE_URL: null,
    RC_ORDERA_SUPABASE_ANON_KEY: null,
    CZAPELSKA_LOCATION_ID: null,
  }, getRcOrderaIntegrationReadiness);
  assert.equal(missing.configured, false);
  assert.deepEqual(missing.missing, [
    "RC_ORDERA_SUPABASE_URL",
    "RC_ORDERA_SUPABASE_ANON_KEY",
  ]);
  assert.deepEqual(missing.invalid, []);
});

