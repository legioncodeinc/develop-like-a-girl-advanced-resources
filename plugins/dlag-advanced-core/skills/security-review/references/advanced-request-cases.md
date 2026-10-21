# Advanced request review cases

These are synthetic source cases. They are not compiled fixtures, provider calls or proof that an application works. Helpers named below are required receiving-project contracts; reviewers must follow their actual implementations. Source review never executes them.

## Server load returns too much

Vulnerable `+page.server.ts`:

```ts
export async function load({ locals }) {
  return { session: locals.session, account: await readWholeAccount(locals.user.id) };
}
```

Even a genuine verified session does not make its returned fields private. Inspect the schema and serialization for tokens, internal billing state and other users' fields. A correct shape authorizes current membership before the query and returns explicitly allowed UI data:

```ts
export async function load(event) {
  const scope = await requireCurrentMembership(event, 'account:read');
  const account = await readAccountForOrganization(scope.organizationId);
  return { account: { id: account.id, displayName: account.displayName } };
}
```

`requireCurrentMembership` must verify the WorkOS session and current membership; the data helper must constrain the Neon query. A DTO is not authorization and a scoped query is not a DTO. Refusal must happen before query/effects. Repeat review for streamed promises, layout output, action failures and remote queries.

## Layout-only protection misses a mutation

A protected `+layout.server.ts` redirect cannot establish that `+server.ts` DELETE or an action is protected. Vulnerable SQL updates by submitted object ID alone. Correct behavior establishes current permission, validates the ID/body, and includes the verified organization ID inside the mutation predicate using Drizzle's bound expressions. Check affected rows without revealing a foreign object. The [full snippets](secure-by-default-snippets.md) retain concrete predicate examples. Reused cached membership and check-then-unscoped-write paths remain review risks.

## Validation failure exposes credentials

Vulnerable action:

```ts
return fail(400, { errors, values: Object.fromEntries(formData) });
```

If that form contains password/token/private fields, the failure response exposes them. Return only approved non-sensitive display fields and generic errors. Check submitted error strings, nested values and exception logging too. A passing successful-submission test does not cover this refusal path.

## Raw HTML from CMS content

Vulnerable Svelte:

```svelte
<div>{@html data.article.body}</div>
```

A Payload origin does not establish that every editor/imported document can safely author arbitrary HTML. Establish content-writer trust, schema, selected renderer and final sanitizer policy. Prefer ordinary text when formatting is not needed:

```svelte
<p>{data.article.summary}</p>
```

Rich text requires the actual selected, SSR-compatible renderer policy and tests for malicious tags/attributes/URLs. React's `dangerouslySetInnerHTML` checks apply only inside the separate CMS; JSX scans do not inspect this Svelte sink.

## R2 metadata access does not prove byte permission

Resolve current actor, organization and owning file record before using a server-controlled R2 object key via the S3 client or issuing a scoped presigned capability. Browser bucket/key and URL inputs are not authority. Check upload start, completion, abandoned state, download and delete separately. A signed URL remains a bearer capability until expiry under its actual contract; immediate member revocation requires a compatible mediated-access design when needed.

## Payload Local API bypass

A custom CMS endpoint that calls Local API with access overrides can bypass a collection rule. Follow the actual user and `overrideAccess` option for that installed version. Public content reads select published records and approved fields; editor operations need the built-in Payload editor principal. WorkOS membership alone must not become CMS editor authority. Read [CMS boundary procedure](../guides/16-payload-next-boundary.md).

## Verified payment, lost work

A custom checkout browser return never grants entitlement. A signed webhook still needs schema/environment/customer correlation and durable accepted work before success. Crash after 2xx, pending dedupe rows, concurrent deliveries and distinct events for one business effect need independent state/effect evidence. No queue provider is added by this example. Use [the full recovery method](../guides/13-webhook-forgery-replay-and-recovery.md).
