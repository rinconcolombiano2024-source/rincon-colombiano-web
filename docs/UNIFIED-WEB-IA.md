# Unified Rincón Colombiano Web + IA

The IA repository at b508d7e is imported under `apps/ia` as a complete source snapshot; its original history remains available at https://github.com/rinconcolombiano2024-source/IA/commits/b508d7e181640a65e437eaab687c5e1af78c02f0. Existing IA tools and standalone application remain intact. The Next.js website directly imports its provider adapters, model registry/router, fallback executor, provider health and runtime guard through `src/lib/rincon-ai/native.js`. The standalone server is not started or exposed by Next.js.

## Deployment

- Existing installations retain the protected HTTPS IA bridge when `RINCON_IA_MODE` is unset.
- To run chat inside the web deployment, set `RINCON_IA_MODE=native` and configure at least one supported provider's server-side key and text model (see `apps/ia/.env.example`). No browser or Windows executable contains these keys.
- Configure provider spending caps and deployment-wide firewall rate limits before enabling publicly. The built-in 12 requests/minute and two concurrent calls are **per running instance**, not distributed billing controls.
- `/api/rincon-ai/status` reports configuration availability, not successful paid inference. Test actual generation separately with authorized credentials.
- Native chat uses 8.5 seconds total, 4 seconds per provider attempt, bounded input/history, 900 output tokens and 64 KiB provider responses. It does not run web crawling, shell commands, file tools, payment or order mutations.
- Failed generation preserves the existing localized website assistance. Payment methods and checkout remain with SumUp/delivery partners; RC ORDERA is presented as pickup/pay-at-restaurant.

## Verification

`npm --prefix apps/ia test` retains the upstream tests. New adapter tests exercise the actual provider/router/fallback code with mocked HTTP, including safe fallback, limits, invalid responses and unavailable credentials. They do not prove live paid generation. Quality Gate also checks TypeScript, ESLint, builds and route smoke tests.

## Commercial verification

Official listings checked in public sources: Uber Eats, Glovo, Pyszne.pl and Wolt. No unambiguous Bolt restaurant URL was found; no invented link is published. The owner-provided SumUp host is used directly so moving the commercial domain cannot accidentally redirect checkout to a menu page.

Company identifiers cross-checked on Rejestr.io and WyszukiwarkaKRS: MENDEZ OSPINA SP. Z O.O.; NIP 9522265601; KRS 0001151475; REGON 540746543. Registered address is labelled separately from operating restaurants. No unverified bank/tax payment account is published. Privacy retention/provider details still require confirmation against actual deployment configuration.
