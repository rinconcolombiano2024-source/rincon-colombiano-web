import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { analyticsPeriod, createAnalyticsReporter, getAnalyticsReadiness } from '../src/lib/analytics/reports.ts';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const env = { GA_PROPERTY_ID: '12345', GA_CLIENT_EMAIL: 'reports@test.iam.gserviceaccount.com', GA_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
const row = (values, label) => ({ metricValues: values.map(value => ({ value: String(value) })), ...(label ? { dimensionValues: [{ value: label }] } : {}) });
const fixture = () => ({ reports: [
  { rows: [row([12, 18, 30])], metadata: { timeZone: 'Europe/Warsaw' } },
  { rows: [row([30], '20261018')] }, { rows: [row([20], '/pl')] },
  { rows: [row([10], 'Organic Search')] }, { rows: [row([4])] },
] });

test('only supported periods are accepted; absent configuration never calls Google', async () => {
  assert.deepEqual(['7','30','90','365','0',undefined,['7']].map(analyticsPeriod), [7,30,90,30,30,30,30]);
  for (const config of [{}, { ...env, GA_PROPERTY_ID: '123/evil' }, { ...env, GA_CLIENT_EMAIL: 'wrong@example.com' }]) {
    const read = createAnalyticsReporter({ env: config, fetchImpl: () => assert.fail('Unexpected request') });
    assert.deepEqual(await read('30'), { status: 'not-configured' });
  }
});

test('read-only signed OAuth, bounded reports, real totals, deduplication and expiry', async () => {
  let now = 1792281600000;
  let calls = 0;
  const read = createAnalyticsReporter({ env, now: () => now, fetchImpl: async (url, init) => {
    calls++;
    assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error'); assert.ok(init.signal);
    if (url === 'https://oauth2.googleapis.com/token') {
      const jwt = new URLSearchParams(init.body).get('assertion').split('.');
      const claims = JSON.parse(Buffer.from(jwt[1], 'base64url'));
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/analytics.readonly');
      assert.equal(claims.exp - claims.iat, 300);
      assert.ok(verify('RSA-SHA256', Buffer.from(jwt.slice(0, 2).join('.')), publicKey, Buffer.from(jwt[2], 'base64url')));
      return Response.json({ access_token: 'test-token' });
    }
    assert.equal(url, 'https://analyticsdata.googleapis.com/v1beta/properties/12345:batchRunReports');
    assert.equal(init.headers.Authorization, 'Bearer test-token');
    const body = JSON.parse(init.body);
    assert.equal(body.requests.length, 5);
    assert.equal(body.requests[0].dateRanges[0].startDate, '29daysAgo');
    assert.equal(body.requests[4].dimensionFilter.filter.stringFilter.value, 'select_order_channel');
    return Response.json(fixture());
  } });
  const results = await Promise.all([read('30'), read('30')]);
  assert.equal(calls, 2); assert.deepEqual(results[0], results[1]);
  assert.deepEqual(results[0].totals, [12,18,30]); assert.equal(results[0].orderClicks, 4);
  await read('30'); assert.equal(calls, 2);
  now += 61000; await read('30'); assert.equal(calls, 4);
});

test('API failure and malformed reports never look like zero traffic or expose secrets', async () => {
  for (const response of [() => new Response('private provider error', {status:403}), () => Response.json({reports:[]}), () => { const data = fixture(); data.reports[0].rows[0].metricValues[0].value = 'NaN'; return Response.json(data); }]) {
    let calls=0;
    const read = createAnalyticsReporter({ env, fetchImpl: async () => ++calls === 1 ? Response.json({access_token:'secret'}) : response() });
    assert.deepEqual(await read('7'), {status:'unavailable'});
  }
});

test('empty valid reports represent no measured visits', async () => {
  let calls=0;
  const read = createAnalyticsReporter({ env, fetchImpl: async () => ++calls === 1 ? Response.json({access_token:'test'}) : Response.json({reports:[{},{},{},{},{}]}) });
  const result = await read('90');
  assert.equal(result.status,'ready'); assert.deepEqual(result.totals,[0,0,0]); assert.equal(result.orderClicks,0);
});

test('oversized response is cancelled; timeout and signing failure are safe', async () => {
  let cancelled=false;
  const read = createAnalyticsReporter({env,fetchImpl:async()=>new Response(new ReadableStream({pull(c){c.enqueue(new Uint8Array(262145));},cancel(){cancelled=true;}}))});
  assert.deepEqual(await read('30'),{status:'unavailable'}); assert.equal(cancelled,true);
  const timeout = createAnalyticsReporter({env,fetchImpl:async()=>{throw new DOMException('secret','TimeoutError');}});
  assert.deepEqual(await timeout('30'),{status:'unavailable'});
  const badKey = createAnalyticsReporter({env:{...env,GA_PRIVATE_KEY:'invalid'},fetchImpl:()=>assert.fail('Must not call Google')});
  assert.deepEqual(await badKey('30'),{status:'unavailable'});
});

test('report reads follow admin authorization and desktop shortcuts are wired', () => {
  const page = readFileSync('src/app/(system)/admin/analytics/page.tsx','utf8');
  assert.ok(page.indexOf('await requireAdminIdentity()') < page.indexOf('await getAnalyticsReport('));
  assert.match(page,/force-dynamic/);
  const desktop = readFileSync('desktop/RinconColombianoAdmin/Program.cs','utf8');
  assert.match(desktop,/\("Estadísticas", "\/admin\/analytics"\)/);
});

test('CEO configuration status tells the truth without exporting credentials', () => {
  assert.deepEqual(getAnalyticsReadiness({}), {
    trackingConfigured: false, reportingConfigured: false,
  }, 'no GA variables does NOT mean zero recorded users');
  assert.deepEqual(getAnalyticsReadiness(env), {
    trackingConfigured: false, reportingConfigured: true,
  }, 'service-account reports and client-side tracking are separate');
  assert.deepEqual(getAnalyticsReadiness({ ...env, NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-ABC123XYZ' }), {
    trackingConfigured: true, reportingConfigured: true,
  });
  assert.deepEqual(getAnalyticsReadiness({ ...env, NEXT_PUBLIC_GA_MEASUREMENT_ID: 'https://attacker.com' }), {
    trackingConfigured: false, reportingConfigured: true,
  }, 'reject malformed client measurement IDs');
  assert.deepEqual(getAnalyticsReadiness({ ...env, GA_PRIVATE_KEY: undefined }), {
    trackingConfigured: false, reportingConfigured: false,
  }, 'missing private key must never be shown as reporting ready');

  const admin = readFileSync('src/app/(system)/admin/page.tsx','utf8');
  const page = readFileSync('src/app/(system)/admin/analytics/page.tsx','utf8');
  assert.match(admin, /getAnalyticsReadiness\(\)/);
  assert.match(admin, /Conectar medición/);
  assert.match(admin, /module\.key === "analytics" && !analyticsConfigured/);
  assert.match(page, /await requireAdminIdentity\(\)/);
  assert.match(page, /readiness\.trackingConfigured/);
  assert.match(page, /readiness\.reportingConfigured/);
  assert.match(page, /No inventamos cifras/);
  assert.match(page, /Activarlo no conecta automáticamente/);
  assert.doesNotMatch(page, /GA_PRIVATE_KEY\s*:/,
    'never display or hardcode secret values in CEO web page');
});

test('official Vercel Next.js tracker is consent-gated and excludes private CEO pages', () => {
  const packageJSON = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(packageJSON.dependencies['@vercel/analytics'], '2.0.1');

  const customerLayout = readFileSync('src/app/[locale]/layout.tsx', 'utf8');
  const adminLayout = readFileSync('src/app/(system)/layout.tsx', 'utf8');
  const analytics = readFileSync('src/components/commercial/ConsentAnalytics.tsx', 'utf8');
  const consent = readFileSync('src/components/commercial/CookieConsent.tsx', 'utf8');
  assert.match(customerLayout, /<ConsentAnalytics \/>/);
  assert.doesNotMatch(adminLayout, /ConsentAnalytics|<Analytics/,
    'admin logins, sensitive settings and CEO reports must not be visitor events');
  assert.match(analytics, /import \{ Analytics \} from "@vercel\/analytics\/next"/);
  assert.match(analytics, /return allowed \? <Analytics \/> : null/,
    'Vercel tracker must never mount when consent was rejected or not yet chosen');
  assert.match(analytics, /localStorage\.getItem\(CONSENT_KEY\) === "accepted"/);
  assert.match(analytics, /window\.addEventListener\("rc-consent-change", update\)/);
  assert.match(consent, /revokeTracking = next === "rejected" && localStorage\.getItem\(KEY\) === "accepted"/);
  assert.match(consent, /if \(revokeTracking && persisted\) \{\s*window\.location\.reload\(\)/,
    'revoking consent must remove an injected analytics SDK from the document');
  assert.match(consent, /event\.oldValue === "accepted" && next !== "accepted"/,
    'revocation in a second browser tab must also stop tracking in this tab');
});
