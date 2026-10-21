# 03. WorkOS authorization and Neon, row ownership and tenant isolation

> Role boundary: review supplied local evidence with Read/Grep/Glob/Skill and return findings in chat. Execution, remediation, configuration, external requests and saves require a separate authorized caller. Examples below do not grant those tools or permissions.

## Establish identity before authority

WorkOS verifies the customer identity. Inspect the actual installed SDK/session adapter, trusted environment, issuer/audience where applicable, expiry and refusal path. A decoded token, browser organization selector or stale membership claim never establishes permission over another record. Resolve the current organization membership and permitted operation through the real authoritative membership source or an explicitly bounded synchronization policy. Mark revocation freshness unknown when the source is missing. Payload editor identity is separate and cannot be inferred from a WorkOS customer session.

## Every application query needs explicit tenant scope

Neon is PostgreSQL hosting, not a Supabase Data API that automatically supplies `auth.uid()` or JWT roles. Drizzle parameter binding does not enforce authorization. Every read, mutation, search candidate set, join, count, aggregate, export and file-metadata lookup must constrain the record and verified tenant. Mutation predicates must contain tenant scope atomically and check affected-row outcomes. Derive the insert tenant from verified server context; reject or ignore client authority fields. Never update an object's tenant from a request spread.

Centralize scoped repository functions and prevent route callers from using an unrestricted client. Review actual bypass paths, admin operations and cross-tenant support tooling separately. Check tenant-keyed indexes and schema constraints against the selected relationship model, including composite constraints when foreign keys could otherwise connect records across tenants. A preflight read followed by an unscoped update is still unsafe. Membership revocation races need an explicit accepted consistency policy and appropriate transaction or revalidation evidence.

## Optional database policies are a separate design

Do not prescribe a Supabase RLS migration for Advanced. The baseline review requires explicit tenant predicates plus current WorkOS membership. If this project also selected PostgreSQL RLS, inspect actual role/grants, restrictive SELECT/DELETE USING and INSERT/UPDATE WITH CHECK predicates, permissive-policy composition, views and definer functions. RLS is additional protection only when the real request role and context activate it. An absent optional RLS design is not itself proof of a vulnerability; a reachable unscoped query is.

## Direct PostgreSQL connections and pool reuse

A direct Neon SQL connection does not acquire the WorkOS session or tenant context automatically. Pin the actual connection role. Table owners normally bypass RLS; FORCE ROW LEVEL SECURITY subjects the owner to row policies, while superusers and BYPASSRLS remain exceptions. A privileged application connection can therefore bypass a correctly written policy. The migration role and request role must not be assumed equivalent or safe.

If a reviewed direct-SQL design uses transaction-local tenant context, four pieces travel together: enable the policies; force owner enforcement when appropriate while keeping the app role nonprivileged; set verified tenant context inside the same transaction; write restrictive USING/WITH CHECK predicates and index the scope column. A representative statement is `SELECT set_config('app.tenant_id', $1, true)` using a driver-bound value after actual membership authorization. Plain session-level SET outside that transaction can leak context to the next pooled request. Pool mode, transaction lifetime and error/rollback behavior need actual tests. Do not export a raw unrestricted client that lets routes bypass the scoped wrapper.

`current_setting('app.tenant_id', true)` can return NULL when absent. Empty or malformed UUID context can cause a cast error; an error is not zero rows. Test missing, empty, invalid and stale contexts explicitly and ensure all fail without disclosure or writes. A context-setting helper that trusts a client tenant string merely moves the vulnerability into one function. Inspect its caller and every bypass path.

## Queries, responses and files are different boundaries

Allowlist table/column/sort identifiers, bind values, and review raw SQL/RPC even when ordinary SDK queries are safe. Apply ownership before joins, pagination, counts and exports. Parameterization prevents value injection; it does not decide which table/column/action an actor may use. The chosen query library's escaping behavior and version need supplied documentation; no ORM is selected by this Playbook.

A correctly scoped row query can still leak data through an overbroad serializer, cached response, error, presigned URL or asynchronous export. Return approved fields only and include current actor/permission scope in private cache/search/export decisions. Inspect nested relations, existence signals and revocation behavior with [guide 12](12-response-and-tenant-boundaries.md).

R2 stores bytes separately from Neon. An RLS policy on an object metadata row does not guard an R2 URL or S3 read. The SvelteKit server must authorize actor, record, requested operation and storage key before reading bytes or issuing a short-lived object capability. Never accept arbitrary bucket/key values from the browser. A leaked public bucket URL or still-valid presigned URL can outlive a database permission change. Document its actual lifetime and revocation limitations; immediate revocation may require a server-mediated download design. Keep public site assets separate from private user uploads.

## Denial tests and evidence limits

Prepare synthetic A/B owners, members/admins, anonymous, expired, revoked and privileged-service cases. Include own-record allowed reads/writes so blanket denial is not mistaken for security. Attempt foreign IDs, owner changes, joins/counts, raw RPC, exports, direct data URLs, stale sessions and R2 reads/presigned links. Independently inspect database/file/external effects, not merely the returned status. Exercise the actual roles/policies in an authorized representative environment and test pooled reuse if used. Missing runtime/schema/credentials means SOURCE REVIEW ONLY for that path. The Specialist must not access credentials or execute those tests itself.

Sources: [WorkOS, Neon/Drizzle, PostgreSQL policy/role settings and R2](../references/official-sources.md). No policy example proves a real deployed schema or tenancy model.
