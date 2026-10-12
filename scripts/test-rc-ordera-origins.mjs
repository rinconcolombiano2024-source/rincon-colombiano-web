import assert from "node:assert/strict";
import test from "node:test";
import {
  getRcOrderaPublicAppUrl,
  getRcOrderaServerConfig,
  buildRcOrderaOrderUrl,
} from "../src/integrations/rc-ordera/config.ts";

const vars = [
  "NODE_ENV",
  "RC_ORDERA_SUPABASE_URL",
  "RC_ORDERA_SUPABASE_ANON_KEY",
  "RC_ORDERA_PUBLIC_APP_URL",
  "NEXT_PUBLIC_ORDER_APP_URL",
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
      "javascript:alert(1)",
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
