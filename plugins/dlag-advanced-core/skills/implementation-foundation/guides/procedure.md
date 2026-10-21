# TypeScript and HTTP Foundation procedure

1. Classify the target as a SvelteKit app, then read package.json, svelte.config.js, the lockfile and generated TypeScript configuration. Extend .svelte-kit/tsconfig.json with strict enabled. Preserve bundler resolution and type-only imports. Published-library NodeNext rules do not apply to app routes. Preserve the selected package manager; no drive-by monorepo migration.
2. Import PageServerLoad, Actions and RequestHandler from the route's generated ./$types. Type request-local state in src/app.d.ts. Keep credentials, Drizzle and provider SDKs in src/lib/server or .server.ts modules. A server load's return is sent to the browser, so return an explicit display projection, never a full session, token or database client. Forward data explicitly if a universal load wraps a server load.
3. Treat request bodies, params, queries, environment and external JSON as unknown until validated. Reuse the installed validator. Apply content type, actual byte, field-count and string limits before processing. Content-Length is untrusted; use a bounded reader for hostile raw bodies. Map malformed input to 400, unauthenticated APIs to 401, denied access to 403 or concealed 404, conflicts to 409 and provider failures to a safe 5xx.
4. Use loads for reads, actions or +server handlers for writes. Authenticate and authorize each route, action and endpoint with dlag-advanced-core:identity and dlag-advanced-core:data-foundation. A parent layout is not a sufficient permission gate. Keep SvelteKit form-origin checks enabled and apply an explicit same-origin/CSRF policy to cookie-authenticated JSON mutations.
5. Await required work. No request user state in module-level mutable variables. Return private/no-store for personalized responses. An action that changes cookies must update locals itself or redirect; hooks do not rerun during that same request. Preserve redirect/error control-flow exceptions rather than swallowing them in broad catches.
6. Raw provider webhooks use the installed official SDK verifier before parsing business fields. Persist event ID, payload hash and effect atomically; duplicate matching delivery returns success without repeating effects, changed-payload replay refuses, processing failure stays retryable. Required writes finish before acknowledging. No fire-and-forget work or invented queue.
7. Fill the worksheet, read edits back and request dlag-advanced-core:ready-check with observed evidence. Server-only compilation is distinct from SDK and live-provider execution.

The [example](../examples/recipe.ts) is an integration recipe, not an installed or compiled SDK guarantee. Save the [worksheet](../templates/worksheet.md) and consult [official sources](../references/official-sources.md) for the installed versions.

## Worked guidance

- [Bounded requests and response contracts](../guides/request-and-response.md)

## Full implementation reference

Use the [complete reading map](../README.md) for the reused TypeScript, HTTP and project-command methods, templates, worked examples and optional inert helpers. The existing Advanced request and provider boundaries remain authoritative.
