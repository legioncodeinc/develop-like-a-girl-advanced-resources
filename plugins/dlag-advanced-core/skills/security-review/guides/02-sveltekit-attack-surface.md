# 02. SvelteKit server, browser and request attack surface

Read [Advanced workflow](advanced-workflow.md), [authorization](03-authorization-and-tenancy.md) and [concrete request cases](../references/advanced-request-cases.md). This is source review with Read/Grep/Glob/Skill only. No helper, provider call or test runs from this role.

## Inventory independently callable surfaces

Record the installed Svelte, SvelteKit, Vite and Vercel adapter versions and actual runtime. Read `hooks.server.ts`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`, universal `+page.ts`/`+layout.ts`, shared server functions and any installed remote-function exports. Include each method and route group, browser submissions, direct endpoint calls, navigation/data responses, downloads and previews. Do not presume a filename search is a complete inventory when routes are generated.

Map each surface to session verification, current membership/action authorization, query scope, output and effects. A layout load is not a universal authorization barrier for endpoints/actions. `await parent()` can order relevant loads, but is not authorization for unrelated handlers. Client `{#if user}`, `onMount`, `$effect`, redirects and invalidation improve UX without authorizing requests. Follow actual shared guards before alleging a missing check. Do not file a vulnerability merely because a layout also contains a redundant check.

## Hooks, locals and independent authorization

Read how the hook sets `event.locals`. The WorkOS integration must verify the actual configured session/token, environment, expiry and appropriate issuer/audience through its installed supported API. JWT decoding, a submitted organization ID or an `x-user-id` header is not a verified principal. Keep actor/session state request-local, never in module globals or server stores shared by requests.

Resolve current organization membership and action permission before Neon access. A valid session with an old organization claim cannot establish current membership. The actual source of current membership and revocation behavior must be identified, including synchronization lag if a local membership projection is used. If remote functions are present, authorize inside each callable server function; client-supplied routing hints and referring paths are not permission. Verify installed remote-function APIs rather than asserting a snapshot's transport/header behavior as current fact.

Review guard ordering before query/body-dependent side effects. SvelteKit `error` and `redirect` are control flow that must not be swallowed by a broad catch; inspect actual installed behavior and all refusal branches. Provider failures must not fall back to a privileged client or return previously loaded private data.

## Server-only imports and serialized data

Trace credential-bearing modules into `$lib/server`, `*.server.*` and the selected private environment APIs. Follow barrel/transitive imports from `.svelte` and universal load modules. Universal loads may run in browsers; server-load execution on the server does not keep returned data private. Review returned objects, nested relations, streamed promises, action success/failure payloads, remote query results, headers and error bodies as client-visible output. Return explicit fields, not session/provider/ORM objects. Do not echo a password, access token, connection string or hidden private field in validation failures.

Inspect SvelteKit public prefixes, `PUBLIC_*`, Vite `VITE_*`, custom `envPrefix`/define replacements, generated browser assets/source maps and serialized configuration. A type-only import is not a runtime secret import. A production build's boundary check, a test runner and source inspection prove different things. Require supplied production artifact evidence for a bundle-level absence claim.

## Form actions, endpoints, remote functions and CSRF

For every cookie-authenticated mutation, inspect the installed SvelteKit CSRF configuration and actual method/content-type/origin path. Include JSON endpoints, form encodings, remote calls when used, logout/account change, upload finalization and payment initiation. A framework form check is not proof every custom endpoint is protected. Review the canonical origin at the real Vercel proxy boundary, explicit trusted origins, callback exceptions and any custom anti-CSRF token. SameSite is defense in depth; CORS is not authentication. Avoid state-changing GET. Webhooks follow a separate bounded original-body signature contract and are not arbitrary unauthenticated mutation exceptions.

Validate input before effects and bound actual body bytes, field lengths, page sizes, uploads and expensive searches. Do not rely only on Content-Length. Retain the raw webhook body until supported signature verification is complete. Missing/invalid signatures or schema must cause no durable acceptance or business effect.

## Svelte rendering, redirects and outbound fetch

Svelte text interpolation is distinct from `{@html}`. Inventory raw HTML, DOM innerHTML/outerHTML, rich-text renderer output, Markdown transforms, dynamic URLs/attributes and imported content from Payload. Trace the writer and final sanitizer at the actual SSR/browser render boundary. A browser-only sanitizer does not prove server-rendered output safe. Use existing chosen rendering libraries and inspect their installed behavior; do not install one during review. Script execution requires a script-capable browser, while unsafe markup/links can cause harm without script execution.

Parse and restrict redirect destinations. Read `event.fetch` and `handleFetch` for dynamic destinations and forwarded Authorization/Cookie headers. An origin allowlist must use exact parsed scheme/host/port and address/redirect policy appropriate to the actual runtime. Do not forward credentials to a user-selected URL or assume a platform fetch default closes SSRF. Fixed approved origins simplify the boundary; public network probes are outside this role.

## Caches, prerendering and deployment

Private data must not enter public prerendered pages or shared CDN/cache entries. Inspect route options, adapter output, Cache-Control, Vercel cache rules, service workers and all success/error/redirect responses. Cache keys and invalidation must reflect tenant and permission changes. `ssr=false` is neither permission enforcement nor proof a route is public. A preview URL must still check draft access.

Review SvelteKit CSP configuration and actual emitted nonce/hash policy against the installed framework, not React's renderer API. Per-response nonces must not be reused in cached HTML. A static build needs a compatible static policy. Distinguish Report-Only observation from enforcement. Check WorkOS session cookies for Secure, HttpOnly, appropriate SameSite, Path/Domain, expiry, refresh, logout and revocation. Do not invent encryption or immediate revocation from a cookie name.

## Evidence and limits

For each reachable risk cite actor/input, guard, query/effect, output and exact source lines. Collect allowed, anonymous, wrong-tenant, removed-member, malformed-input and no-effect evidence from a separately authorized caller. React/JSX candidate scanners do not inspect `.svelte` templates and cannot clear these surfaces. Missing execution remains NOT RUN. Historical original SvelteKit review concepts informed this adaptation; no advisory ranges are asserted here. The targeted 2026-10-21 official documentation check is recorded in the source index; it does not establish installed application behavior. See [primary source locations](../references/official-sources.md).
