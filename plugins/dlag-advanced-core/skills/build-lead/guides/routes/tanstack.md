# Tanstack routing

Use **Application Data UI** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain
App Data UI owns client data/query caching, mutations, invalidation, accessible tables, forms and virtualization inside the selected Svelte application. First ask whether SvelteKit load functions and form actions already meet the need. Confirm actual installed package versions and APIs before a concrete TanStack recipe. Use only the installed Svelte-compatible Query/Table/Form/Virtual APIs verified by the selected App Data UI method. SvelteKit remains the router; do not infer Svelte support for TanStack Router or Start.

## Trigger phrases
- "add TanStack Query"
- "qualify an installed Svelte query library"
- "build a data table"
- "TanStack Form validation"
- "virtualize this list"
- "should I use TanStack Router"
- "do I actually need TanStack Query here or can the route loader handle it"

## Do NOT route when
- Route/component design belongs to Svelte Foundation or Design Foundation, while this owner handles the data/table/form boundary.
- Hosting and cache configuration belong to Vercel Platform; preserve the query/SSR interaction as an explicit boundary.
- The ask is the underlying database schema behind a query function or table's row data: route to Data Foundation.
- Replacing SvelteKit routing or using an unsupported framework adapter requires a scope decision; do not install a workaround.

## Inputs the Specialist needs
- Confirmation of the Svelte project, installed versions and selected SvelteKit SSR runtime.
- Whether SvelteKit load functions/form actions already solve the problem before reaching for TanStack Query.
- The specific library in play (Query, Table, Form, Virtual) and, for Query, whether the prefetch runs through a browser-safe or server-only loader.

## Outputs
- A recommendation on whether TanStack Query is warranted versus SvelteKit load functions/form actions.
- SSR-safe Query client setup, mutation/invalidation strategy, or a Svelte-compatible Table configuration.
- A Form validation setup choosing between TanStack Form and the selected route action/form contract.
- An explicit compatibility and scope warning for requests to replace the selected router.

## Commonly sequenced with
- Design Foundation: for the surrounding route/component markup the table or form renders into.
- Vercel Platform: when SSR prefetch or response-cache policy crosses the execution boundary. Never share a customer query cache across server requests.
- Data Foundation: for the data source behind a query function or table's row data.
