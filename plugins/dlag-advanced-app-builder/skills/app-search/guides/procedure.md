# Application Search procedure

1. Save the linked search contract: records, actor/organization scope, query limit, allowlisted filters/order, page cap and returned fields. Start with bounded lexical search over existing data. No embeddings, AI provider or vector migration is selected.
2. Use dlag-advanced-core:identity and dlag-advanced-core:data-foundation. Verify the session and organization membership before queries. Apply the same permission predicate before candidates, counts, autocomplete, snippets and caches. A client-supplied owner ID never broadens scope.
3. Parse input through the linked helper. Parameterize text values with Drizzle/SQL bindings; never interpolate raw filter/order SQL. Decide whether % and _ are literal or wildcard input and escape accordingly when using LIKE. Use websearch_to_tsquery/tsvector only when the schema/index contract supports them. Limit returned text and escape rendered snippets instead of raw HTML insertion.
4. Use deterministic ordering with unique ID tie-breaker and bounded page size. Offset is valid for small lists with documented concurrent-write drift; if a cursor is needed, bind it to query/filter/scope/order/version and reject tampering/mismatch. Do not promise snapshot consistency without implementing it.
5. Render SvelteKit GET search form, no-result/validation/unavailable states and clear reset behavior through dlag-advanced-core:svelte-foundation. Keep authenticated responses private and no-store. Authorize downloads/details separately even when reached from search.
6. Exercise exact text, Unicode, empty/no-result, oversized/malformed input, tied ordering and a forbidden actor. Relevance/latency claims require measured corpus evidence. A mock search or lexical result is not semantic/vector or live Neon proof.

Read the [recipe](../examples/search-input.mjs) and fill the [record](../templates/search-contract.md) for the requested scope.

## Worked guidance

- [Owner-scoped search integration](../examples/owned-search.md)
