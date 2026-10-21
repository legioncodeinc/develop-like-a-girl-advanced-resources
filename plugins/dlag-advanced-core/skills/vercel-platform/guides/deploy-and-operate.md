# Prepare the SvelteKit and Payload deployment

The deliverable is a reproducible project layout, configuration and deployment handoff. Publishing is an explicit operator action. Use Vercel Node functions for the app backend, a separate Payload application for CMS routes and editor login, Neon for data, and R2 for objects.

## Choose the actual installed framework syntax

| Installed framework | Configuration | Private environment | Local library imports |
|---|---|---|---|
| SvelteKit 2 | Existing `svelte.config.js`; recent 2.x can also use documented Vite configuration | `$env/dynamic/private` or the project's existing explicit environment setup | `$lib/...` |
| SvelteKit 3 | `sveltekit({...})` in `vite.config.ts` | Declare names in `src/env.ts`; import from `$app/env/private` | `#lib/...` through package imports |

The bundled existing `.ts` recipes target SvelteKit 2. Do not upgrade an existing project to make them fit. For a newly selected Kit 3 project translate these three boundaries together, using its generated types. Node SDKs, server ownership and business contracts remain the same. [Current migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).

```ts
// Kit 3 vite.config.ts: merge with existing plugins/options.
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';
export default defineConfig({ plugins: [sveltekit({ adapter: adapter() })] });
```

```ts
// Kit 3 src/env.ts: declare only names this app uses.
import { defineEnvVars } from '@sveltejs/kit/env';
export const variables = defineEnvVars({
  DATABASE_URL: {},
  WORKOS_API_KEY: {},
  WORKOS_CLIENT_ID: {},
  WORKOS_COOKIE_PASSWORD: {},
  WORKOS_ISSUER: {},
  APP_ORIGIN: {}
});
```

```ts
// Kit 3 server-only consumer. A named private import never reaches page data.
import { DATABASE_URL } from '$app/env/private';
export function databaseUrl(): string {
  if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');
  return DATABASE_URL;
}
```

For Kit 3 configure `"imports": { "#lib": "./src/lib/index.js", "#lib/*": "./src/lib/*" }` in the consuming package and include the correct file extension. Do not add an index file solely to match an unused example import. Kit 2 retains the existing [adapter example](../examples/recipe.ts). Copying Kit 3 configuration into a pinned Kit 2 project is not a repair.

## Separate deployment roots

| Surface | Project root | Runtime owns | Does not receive |
|---|---|---|---|
| Site/app | accepted SvelteKit app directory | SSR, actions, API routes, WorkOS sessions | Payload editor session secrets unless explicitly required by its CMS integration |
| CMS | accepted Payload/Next.js directory | `/admin`, CMS API, editor auth, CMS migrations/media policy | WorkOS app session signing password or app-only payment credentials |

Inspect existing scripts rather than inventing build commands. The SvelteKit adapter emits Vercel Build Output; do not point a Node SSR app at a static `dist` folder. Set each Vercel project's root independently in a monorepo. Shared source packages must be available from that root and included in its existing build graph. Payload is not a second router inside SvelteKit.

Select a supported Node major compatible with both the installed framework and SDKs, record it in the project manifest, and match Vercel's setting. Avoid force-pinning the newest major. Check actual account function duration, request/response size and deployment limits before specifying them. Large user files go directly to authorized R2 storage; local filesystem paths are not durable application storage.

## Route and caching policy

- Prerender public static pages only when their data and preview requirements allow it.
- Render authenticated pages dynamically. Set private/no-store on personalized data and endpoint responses; do not attach ISR to login, app, admin, billing, file or draft-preview routes.
- Validate permissions in every protected leaf load/action/endpoint. A layout guard is not API authorization.
- Keep server SDKs and secret imports under server-only modules. Preserve SvelteKit form CSRF protection; manually protect cookie-authenticated JSON mutations with exact origin checks and appropriate request tokens.
- Await required durable writes. An unawaited promise after returning is not a delivery guarantee.
- Put a bound on request streams before parsing a webhook, JSON or upload. Content-Length is advisory and can be absent or false.
- Cache published CMS content according to the product's freshness policy. Draft preview uses explicit authentication and private/no-store, never a shared public cache key.

## Environment and release handoff

Use the [secret mapping guide](../../secrets/guides/environment-map.md) to tie each Doppler config to the exact Vercel project and target. Preview must use preview WorkOS callbacks, database, R2 bucket/prefix, email sender policy and Stripe test mode. An arbitrary preview URL cannot be trusted as an OAuth return destination.

Before an authorized deployment, save: branch/commit, project/root, exact build/check commands, selected runtime, environment-name matrix, reviewed migration order, hostnames/callbacks, smoke routes and rollback target. Run existing affected local checks when authorized. After deployment, record its exact URL and revision, then check public page, protected redirect, owned write, cross-owner refusal and selected optional integrations. A source build proves neither provider configuration nor deployed behavior.

Rollback may restore code without undoing a database migration, secret rotation, sent message or payment. Use expand-compatible migrations and document whether the previous version can run against the new schema. Do not delete data to make rollback look clean.

Sources checked 2026-10-21: [SvelteKit Vercel adapter](https://svelte.dev/docs/kit/adapter-vercel), [Kit 3 migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-3), [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [function limits](https://vercel.com/docs/functions/limitations), [Doppler Vercel integration](https://docs.doppler.com/docs/vercel).
