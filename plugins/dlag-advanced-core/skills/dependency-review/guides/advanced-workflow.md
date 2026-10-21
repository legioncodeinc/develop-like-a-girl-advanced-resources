# Check Advanced dependency fit

Use the supplied manifest and lockfile together. The declared semver range is not the installed version. Read local project configuration to establish the actual adapters and APIs before advising a change.

| Area | Compatibility boundary to inspect |
| --- | --- |
| Svelte/SvelteKit/Vite | Installed major versions, plugin configuration, route types and adapter support |
| Tailwind/shadcn-svelte | Existing CSS setup, copied component exports and underlying primitive versions |
| Neon/Drizzle | Driver execution model, transaction/session needs and migration tool pairing |
| WorkOS | Installed SDK request/session API, callback and cookie behavior |
| Payload | Compatible Payload, Next.js, database/storage/email adapters and generated types |
| Stripe | Server SDK API version, browser Elements integration and webhook event version |
| R2/Resend | Runtime support, request limits and error semantics of the selected client |

Do not silently upgrade a project because an example targets a newer API. Prefer a compatible repair within the current project; if an upgrade is actually required, explain the affected surface and migration before changing it. A copied UI component is owned code and may need explicit adaptation even when the dependency version did not change.

For an advisory use exact installed version, affected range, fixed version, reachable feature and dated primary advisory. Separate a detected vulnerable package from evidence the application exposes the vulnerable path. If current advisory access is unavailable to this read-only role, report freshness as unknown; do not reuse an old all-clear.

Inspect added install scripts, unexpected registries or URLs, lockfile churn and unnecessary packages in the actual diff. An approval for a feature is not permission to introduce unrelated libraries. Return a concise disposition with impact and one recommended action. Package installation, scanning, upgrades and lockfile generation belong to a caller whose tools and authorization allow them.
