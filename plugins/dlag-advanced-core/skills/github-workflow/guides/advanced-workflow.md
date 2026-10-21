# Review an Advanced change for delivery

Review the supplied diff and repository evidence for the requested change. The Specialist is read-only; a suitably authorized caller performs commands or GitHub actions. Reuse the project's existing workflow and test tools.

## Inspect the change

Start with the user-visible problem and final behavior. Confirm the named base branch, modified paths, generated files, lockfile and migration changes from actual evidence. Missing Git evidence is unknown, not a clean branch. Separate SvelteKit app changes from the Payload host and from shared schema/contracts.

For a SvelteKit change, look for the declared type/check, unit and build commands and the affected route checks. For a CMS change, include its type generation, collection access and migration checks. Do not demand both applications rebuild when only unrelated prose changed. A dependency change should explain why the package is needed and keep the existing lockfile authoritative.

## Migration and release order

Describe expand, deployment and later cleanup as separate actions when data compatibility requires them. A Vercel rollback does not roll back a database migration or provider side effect. Require the migration owner, compatibility window and recovery procedure for data changes. Payload and Drizzle migration paths remain independent.

PR text should give the concrete trigger and before/after behavior, important boundaries, checks actually run and remaining limitations. Include screenshots only when a visible change needs them. Do not invent branch protection or CI results from configuration files; distinguish declared checks from observed remote enforcement.

After Security and Quality, the coordinator reviews the exact candidate directly. Existing review results may be reused only while their relevant inputs are unchanged. Commit, push, merge and deploy require the owner's applicable authorization, even when the technical review is clean. Return one actionable finding per actual defect, not a generic checklist of every possible GitHub setting.
