# Import and export without losing row context

Use import only for a requested data-entry need. Decide accepted columns, row identity, duplicate behavior and all-or-nothing versus partial acceptance before adding UI. The existing CSV helper formats an export; it is not a CSV parser or an import authorization layer.

## Import workflow

1. Accept a bounded file with clear allowed types and size. Bound bytes while reading, then rows, columns and cell lengths. A file extension alone does not establish format.
2. Parse with an installed reviewed parser, retaining source row numbers. Handle BOM, delimiter and encoding deliberately. Do not split quoted CSV with `line.split(',')`.
3. Show a preview and explicit column mapping. Allowlist destination fields; exclude owner, role, organization and billing entitlement fields.
4. Validate again on the server. Return `{ row, field, code, message }` errors without raw internals. Keep invalid rows editable or downloadable as an error report with the same formula protections as exports.
5. Resolve duplicate keys under the current authorized scope. An ID belonging to another owner is denied, not reassigned. Apply a bounded transaction or recorded import job according to the chosen atomicity contract.
6. Show accepted/rejected counts, whether any rows were committed, and the retry behavior. A retry must not silently duplicate accepted rows.

For XLSX, a ZIP container can expand dramatically. Bound compressed and decompressed sizes, sheet count and dimensions. Import values only unless formulas are explicitly required and handled safely; never execute macros or formula code. Use CSV when it meets the requirement and avoids unnecessary parser complexity.

## Export workflow

Use a server endpoint that rechecks actor scope, restricts columns, caps rows and output bytes, and sends a private, no-store download. Use a fixed safe filename; never interpolate raw submitted filenames into response headers. For a small bounded result, the packaged `csvRows` helper handles quoting and mitigation of formula-leading cells. For larger approved exports, stream or batch with backpressure and clear truncation semantics.

Never export passwords, tokens, sealed sessions or hidden operational columns simply because the table object contains them. Formula mitigation can be changed by spreadsheet save/reopen behavior; a CSV is data for a user-controlled spreadsheet, not a universal formula execution sandbox.

Check embedded quotes, commas, newlines, empty cells, Unicode, formula prefixes with leading whitespace, oversize files, duplicate rows and a foreign record ID. Test the real target spreadsheet only when that compatibility is required.

Sources: [OWASP CSV injection](https://owasp.org/www-community/attacks/CSV_Injection), [Drizzle transactions](https://orm.drizzle.team/docs/transactions).
