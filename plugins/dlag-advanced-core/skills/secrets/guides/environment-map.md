# Map secrets to the runtime that needs them

Create a name-only table for the consuming project before writing imports. Doppler holds values; the repo describes names and boundaries. Public configuration is intentionally exposed and never substitutes for server authorization.

| Name | Consumer | Visibility | Purpose |
|---|---|---|---|
| `DATABASE_URL` | app server | private | Neon runtime role and pooler connection |
| `MIGRATION_DATABASE_URL` | approved migration process | private, separate scope | reviewed schema changes; not browser/runtime distribution |
| `WORKOS_API_KEY` | app server | private | customer identity API |
| `WORKOS_CLIENT_ID` | app server | configuration, keep server-only unless needed | selected application |
| `WORKOS_ISSUER` | app server | configuration | exact accepted JWT issuer for this environment |
| `WORKOS_COOKIE_PASSWORD` | app server | private | stable sealed-session encryption key |
| `WORKOS_WEBHOOK_SECRET` | selected app webhook | private | WorkOS event verification |
| `APP_ORIGIN` | app server | configuration | fixed callback/origin policy |
| `R2_ENDPOINT`, `R2_BUCKET` | owning app/CMS server | configuration | fixed R2 target |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | owning app/CMS server | private | scoped S3-compatible access |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | selected mail sender/callback | private | transactional send and delivery verification |
| `RESEND_FROM` | mail sender | configuration | verified approved sender |
| `PAYLOAD_SECRET` | CMS only | private | editor/session cryptographic configuration |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | optional app billing | private | test/live-selected server integration |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional app browser | intentionally public | Stripe.js initialization |

Only selected integrations need their variables. Do not require Stripe credentials for an app with payments disabled. CMS may need a separate database URL and separate R2 credentials under its own config; identical names in different projects do not mean shared values. Keep marketing content APIs read-only for the site where possible.

## Doppler to Vercel mapping

Fill exact non-secret names in the [worksheet](../templates/worksheet.md): Doppler project/config, Vercel project/environment, branch restriction if used, and consuming runtime. Separate development, preview and production mappings. Do not sync one full all-service secret set to every app.

The current Doppler integration supports Config, Secret and Dynamic variable types. Public framework-prefixed variables must remain Config-visible on Vercel; using Dynamic with public values marked Unmasked in Doppler allows them alongside protected secret values. Treat any change to that setup as a provider configuration action. R2 credentials should use `R2_*` names because Vercel reserves common `AWS_*` credential variables. [Doppler integration reference](https://docs.doppler.com/docs/vercel).

## Local server use

For Kit 2 use [the private config helper](../examples/recipe.ts). Validate on first service use, and report missing names only. A deployment with email disabled should not fail its public page merely because email credentials are absent. Avoid importing an all-services eager validation module into every request.

For Kit 3 explicitly declare required names in `src/env.ts` and import named private values. See the [framework version guide](../../vercel-platform/guides/deploy-and-operate.md). Never use a dynamic catch-all export of private config through a shared barrel that client components consume. Avoid serializing SDK clients, process.env, env objects or thrown provider responses into page/action data.

A checked-in `.env.example` can list empty names and comments only. Existing `.env` files remain ignored. Do not run `printenv`, dump a Doppler download, or paste dashboard values into a report to prove wiring. Operator-authorized local injection can run the existing project command through Doppler without checking values into files. The skill itself does not grant provider or credential access.

## Rotate without breaking unrelated services

1. Identify the credential's exact consumers, current deployment references and provider revocation semantics by name.
2. Prepare the code/config compatibility change and rollback before editing the provider.
3. Under explicit authorization, create or rotate the selected credential and update only its Doppler config/sync targets.
4. Confirm the sync and deploy/restart needed to consume it. Test the specific service with an authorized non-destructive operation.
5. Revoke the predecessor only after consumers have moved, where overlapping validity is supported. For cookie keys, decide forced logout versus a documented supported rotation path.

A rollback deployment does not resurrect a revoked credential. Record success/failure and names, never values. If a secret leaks, stop exposing it, rotate through the approved process and assess repository/log history separately; editing it out of the current file alone is not revocation.

Sources checked 2026-10-21: [Doppler Vercel sync](https://docs.doppler.com/docs/vercel), [SvelteKit private environments](https://svelte.dev/tutorial/kit/env-private), [server-only modules](https://svelte.dev/docs/kit/server-only-modules).
