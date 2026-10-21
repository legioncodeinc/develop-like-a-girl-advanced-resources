# Payload CMS and Next.js security boundary

This guide applies only to the separate Payload 3/Next.js CMS. The customer application remains SvelteKit. The [React catalog](../react/playbook.md) supplies full client/SSR/RSC check pairs and historical advisory qualification for this surface only; its scanners do not cover Svelte. Use Read/Grep/Glob/Skill and return source-cited findings. Never execute the examples or operate the CMS from this review role.

## Separate principals and access enforcement

Inventory Payload config, authenticated editor collection, collection/field access callbacks, custom endpoints, hooks, REST/GraphQL routes and Local API callers. The built-in editor session is independent of WorkOS customer sessions. Trace the principal reaching each operation and refuse a customer token being treated as an editor. Confirm supported cookie/CSRF/CORS/secret configuration from installed versions. Do not hardcode claims about a default from old research.

Inspect Local API access override behavior. Calls acting on behalf of an editor or public visitor need an explicit reviewed access decision and authenticated principal as appropriate, including `overrideAccess: false` where the actual installed API uses that option. A server-to-server call with an override is privileged and needs its own bounded authorization and selected response fields. A custom hook or endpoint can bypass a collection gate if it invokes a privileged Local API operation.

## Public content, drafts and files

Trace the SvelteKit site's published-content fetch to the exact CMS query. Public queries must exclude drafts, unpublished versions, private collections and restricted fields. Preview routes need explicit editor authorization and cannot cache private results publicly. A hidden admin UI, an obscure preview URL, a client filter or a Next layout redirect is not API access control. Check pagination, relationship population, depth, custom fields and error responses for incidental disclosure.

For media, check collection access plus R2 S3 object-key permission. Do not trust a client-supplied bucket/key or a public URL to implement private media policy. Validate size/type/count, server-owned keys and finalize ownership. Published assets and private editorial material need separate intentional delivery rules.

## Next server boundaries and delivery

Inventory Route Handlers and any Server Actions/custom RSC code actually used by Payload extensions. Each independently callable operation requires its own verified principal, permission and bounded input; middleware/proxy or layout checks alone do not establish coverage. Map response serialization and cache scope for public, editor and preview actors. Avoid forwarding CMS secrets to client components or the SvelteKit content consumer. Secrets remain in the separate server environment delivered through Doppler's approved configuration.

Review public `NEXT_PUBLIC_*`, server-to-client props, action validation echoes, raw HTML/MDX renderers, custom client components and generated source maps. Trace redirect and outbound-fetch inputs and credentials. Identify the actual deployment adapter/runtime and caching rules for the CMS separately from the app. Preserve CSP/security headers on error/redirect/preview paths.

## Dependency and proof contract

Pin the actual Payload, Next.js, React, React DOM, serialization and database/storage/email adapter versions from this CMS lockfile. Use current supplied primary advisory ranges to judge affected versions and reachability. An offline React advisory table is historical evidence, not today's all-clear or a complete Next.js advisory database. Record unsupported/missing advisory coverage explicitly.

Required target evidence depends on the change: published visitor access allowed, draft/private data denied, authenticated editor actions allowed, wrong/removed editor denied, direct endpoint access denied without authority, isolated cache behavior and no secrets in client output. Mocks and static findings do not establish live editor sessions, provider access or deployment readiness. Route implementation to the installed `dlag-advanced-core:payload-host` capability; no new CMS role is created.
