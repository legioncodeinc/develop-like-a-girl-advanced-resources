# Db routing

Use **Data Foundation** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain
Data Foundation owns PostgreSQL schema, keys, constraints, indexing, query plans, transactions, connection behavior and expand-backfill-contract migration reasoning for Neon Postgres through Drizzle. Qualify the driver, connection model and migration flow for the actual Vercel runtime. Preserve generic relational design and recovery methods, but do not turn a comparison of other managed databases or ORMs into a platform change.

## Trigger phrases
- "design this schema"
- "review this migration"
- "should this be jsonb or columns?"
- "we need a NOT NULL on a 100M-row table"
- "review this Drizzle schema and migration"
- Neon drivers, branches and Drizzle migrations are in scope for local preparation. Live branch creation, migration execution and restores require separate authorization and capable tools. Alternative database providers remain unavailable.
- "production query is slow, read this EXPLAIN"
- "is this index right?"

## Do NOT route when

- Customer authentication belongs to Identity; CMS collections belong to Payload Host.
- Security approval belongs to Security Review, and plan conformance belongs to Quality Review. Neither review executes migrations.
- Alternative database/ORM selection and live database operations exceed this local preparation method.

## Inputs the Specialist needs
- Existing DDL or Drizzle schema file (`schema.ts`) and recent migrations
- Query plans (`EXPLAIN (ANALYZE, BUFFERS)`) for performance work, not just "it's slow"
- Pooler config and `package.json` for ORM/platform versions
- Table size, since migration safety strategy depends on row count

## Outputs
- Schema spec, migration plan with lock classes, or indexing decision
- Drizzle/Neon connection or migration decision record
- Audit report classified must-fix / should-refactor / style

## Commonly sequenced with
- Security Review: audits RLS, PII, and encryption after this Specialist designs the hooks
- Quality Review: inspects post-migration results supplied by the authorized executor against the accepted plan


## Workload and provider fit

For an actual Neon/Postgres decision, inspect the selected local methods and current supplied project evidence. Normalize workload, ancillary identity/storage/realtime needs, connection modes, operations/recovery/exit and observed rate assumptions. Do not reuse categorical dated service-gap claims or guess a backfill.
