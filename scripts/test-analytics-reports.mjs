import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { analyticsPeriod, createAnalyticsReporter } from '../src/lib/analytics/reports.ts';

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
