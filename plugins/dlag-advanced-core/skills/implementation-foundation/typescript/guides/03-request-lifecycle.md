# Typed requests and SvelteKit SSR

Use the actual installed SvelteKit route declarations. In the existing SvelteKit 2 layout, +page.server.ts uses PageServerLoad/Actions and +server.ts uses RequestHandler from the route’s generated ./$types. The framework determines the generated location; do not transplant another major’s alias or hand-edit generated files. The separate Payload host has its own Next.js request conventions.

Verify WorkOS identity per request in hooks.server.ts and assign the validated principal to App.Locals. Every protected load, action and endpoint checks the principal and the operation’s current membership/ownership permission. A parent layout redirect or a type declaration alone does not authorize direct endpoint calls. Pass safe actor identifiers into the Neon/Drizzle layer; never accept the owner from form JSON.

Keep data access and secrets in server-only modules. Universal +page.ts loads can execute in the browser and must not import those modules. Server loads serialize only the explicitly selected display DTO. Avoid spreading a complete database row or session result. Nested routes need clear ownership of shared keys and data access.

For forms, use ordinary POST behavior first, then the existing progressive enhancement. Bound actual bytes, reject ambiguous repeated scalar keys and File values where not expected, validate fields, authorize, and perform the mutation. Use SvelteKit fail/error/redirect at their documented boundary; broad catches must not convert redirects into failures. Keep private cache headers and cookies intact.

After sign-in/out, maintain the real request lifecycle rather than pretending a cookie authenticates an already-computed context. Exercise server navigation and hydrated navigation, invalid input, logout, stale/aborted requests and concurrent users when testing a consuming application. Do not keep mutable current-user state in module globals on reused Vercel processes.

The supplied public-body.mjs is a framework-neutral Web Request/Response validator. A SvelteKit +server.ts adapter may pass event.request to it, but the example performs no authenticated mutation and supplies no WorkOS or database adapter. Preserve its byte limits and public error codes when integrating it.

Sources: [SvelteKit generated types](https://svelte.dev/docs/kit/types), [server-only modules](https://svelte.dev/docs/kit/server-only-modules). These source recipes do not claim a mounted application or live provider check.
