# Private website analytics

The CEO panel at `/admin/analytics` reads the existing GA4 property's aggregate
reports. It does not create a second visitor database or claim that outbound
clicks are purchases. The existing Supabase admin guard runs before every read.
Windows CEO includes Statistics and Reviews shortcuts to the same protected pages.

## Two independent measurement systems

### A. Vercel Web Analytics — fastest way to count visits

The official `@vercel/analytics` Next.js SDK (pinned at 2.0.1) is mounted **only
after the visitor accepts optional website tracking**. Only commercial pages
in `/[locale]` (PL/ES/EN) render the SDK; administrative and authentication
pages do not. Unmounting a tracker alone cannot guarantee its injected
scripts are gone, so withdrawing consent reloads the site to clear the SDK.

An **authorized project owner** must still open **Vercel → Rincón Colombiano
Web → Analytics → Enable**, review any plan charges, then deploy a new
production build. The Analytics dashboard is separate from the CEO GA4
report. It does not retroactively count visits that occurred before
activation. Vercel Analytics is cookie-free but this site deliberately
holds tracking until optional consent; its totals may omit visitors who
reject consent or block scripts.

Do not interpret Vercel's `400 web_analytics_not_enabled` API response as
a traffic count of zero. Enable the service before expecting reports.
Official instructions: https://vercel.com/docs/analytics/quickstart

### B. Google Analytics 4 — private CEO reports

## Deployment connection

1. Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` for this website's GA4 stream and rebuild.
   The existing consent component loads GA only after optional-cookie acceptance.
2. Enable Google Analytics Data API in the service account's Google Cloud project.
3. Grant that service account **Viewer** access to the corresponding GA4 property.
4. Set server-only `GA_PROPERTY_ID` (numeric property ID, not the G- measurement ID),
   `GA_CLIENT_EMAIL`, and `GA_PRIVATE_KEY` in the deployment secret settings.
   The key accepts PEM newlines or escaped `\n`. Never commit real values.
5. Sign in to `/admin/analytics` and verify the 7, 30 and 90 day reports against GA.
   No real Google credentials are used by the automated tests.

Reports show users, sessions, page views, daily page views, top pages, acquisition
channels and `select_order_channel` click counts. Date ranges include today in the
property's timezone. Counts depend on consent, blocking and Google's processing
latency; they are not all visitors and cannot reconstruct earlier unmeasured visits.
No custom GA dimension is needed for these reports. No confirmed revenue is inferred.

The server uses fixed Google endpoints, read-only OAuth scope, a shared 10-second
deadline, a 256 KiB response limit, deduplicated requests and a bounded three-period
cache (60 seconds for success, 10 seconds for failure). Invalid responses and
permission failures display unavailable, never fabricated zero totals. OAuth tokens,
private keys and upstream errors are not returned to the UI or logged.

References:
- https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart
- https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/batchRunReports
- https://developers.google.com/identity/protocols/oauth2/service-account

Verification: `node --experimental-strip-types --test scripts/test-analytics-reports.mjs`
and `node scripts/smoke-admin-pwa.mjs http://127.0.0.1:3100` after building/starting.
