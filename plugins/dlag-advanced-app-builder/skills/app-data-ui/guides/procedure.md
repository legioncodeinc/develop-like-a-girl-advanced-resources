# Application Data UI procedure

1. Save the linked data-screen contract. Use dlag-advanced-core:data-foundation for row permissions and dlag-advanced-core:identity for actor verification. Apply the same owner/organization constraint before list, count, aggregate and export operations.
2. Use native semantic tables/forms with SvelteKit loads and actions first. dlag-advanced-core:svelte-foundation owns runes and server/client boundaries; dlag-advanced-core:ui-primitives owns copied controls. Add TanStack's actual Svelte adapter only if installed, compatible and justified by requested complexity. Never copy React useReactTable/useQuery hooks.
3. Encode bounded query/filter/sort/page state in URLs for reload/share/back behavior. Allowlist structural SQL ordering and parameterize data values. Sort by a unique deterministic tie-breaker. Keep page size capped, reset page when filters change and disclose offset/concurrent-write limits rather than promising a snapshot.
4. Keep selection scoped to currently authorized IDs. Server validation controls mutations/imports; hidden columns, disabled controls and client filtering cannot enforce access. Provide labels, keyboard access, row errors, pending/empty/error/success UI.
5. For CSV, bound total bytes, rows, columns and each cell before parsing. Preview mappings and validate each row on the server. Disallow submitted owner fields and unexpected keys. Ownership is bound by the verified actor; imported records cannot overwrite another actor's data. For XLSX, also bound decompressed content, sheets and formulas; use only an existing reviewed parser when needed.
6. Export only allowed columns/rows with a documented cap. Quote/escape CSV and mitigate formula-leading characters including whitespace and control prefixes. Record spreadsheet-consumer limitations; a sanitizer alone cannot guarantee every spreadsheet save/reopen flow. Private downloads use private no-store headers.
7. Exercise authorized/forbidden rows, tied sort, empty list, invalid page, formula-like cells and import failures once per changed boundary. Keep database/browser/provider proof separate.

Read the [recipe](../examples/csv.mjs) and fill the [record](../templates/data-screen.md) for the requested scope.

## Worked guidance

- [Complete URL-driven table](../examples/data-screen.md)
- [Import and export workflow](../guides/import-export.md)
