# Official sources

Consult current primary documentation and the installed version before relying on API-specific recipes. Source links establish reference grounding, not proof a local application compiled or a provider operation ran.

- [svelte.dev/docs/kit/routing](https://svelte.dev/docs/kit/routing)
- [svelte.dev/docs/kit/server-only-modules](https://svelte.dev/docs/kit/server-only-modules)
- [vercel.com/docs/functions/limitations](https://vercel.com/docs/functions/limitations)
- [www.postgresql.org/docs/current/transaction-iso.html](https://www.postgresql.org/docs/current/transaction-iso.html)

Svelte forms and SSR state guidance were refreshed from official documentation on 2026-10-20 to cover the imported archive's documented gaps. Do not infer unverified remote-function or server-boundary integration from older archives.

Checked 2026-10-21 for the transactional adapter recipe: [PostgreSQL SELECT and row locking](https://www.postgresql.org/docs/current/sql-select.html), [Vercel function limits](https://vercel.com/docs/functions/limitations). Provider-specific signatures, idempotency periods and acknowledgment codes remain adapter-specific and must be read from the selected provider documentation.
