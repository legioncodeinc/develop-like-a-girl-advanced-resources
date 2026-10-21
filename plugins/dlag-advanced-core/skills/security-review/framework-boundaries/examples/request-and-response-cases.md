# Request and response cases

These are review examples, not executed applications or copy-ready full integrations. The snippets demonstrate specific boundaries. Missing imports, app schema/roles, verified session adapters and server environment wiring must be supplied by the reviewed project. The existing [concrete security snippets](../../references/secure-by-default-snippets.md) include explicit verifier contracts, Drizzle predicates and boundary helpers. No fixture app, SDK, database, browser or provider was run for these examples.

## 1. UI guard versus action authority

Vulnerable:

```ts
if (!user?.isAdmin) hideAdminButtons(); // UI behavior only
// Independent server handler:
await db.delete(projects).where(eq(projects.id, submittedId)); // missing tenant predicate
```

Fixed operation shape:

```ts
const scope = await requireCurrentMembership(event, 'project:delete');
const changed = await db.delete(projects)
  .where(and(eq(projects.id, submittedId), eq(projects.organizationId, scope.organizationId)))
  .returning({ id: projects.id });
if (!changed.length) throw new Response('Not found', { status: 404 });
```

Review the real WorkOS verifier/current-membership guard and Drizzle query; optional RLS needs actual role/context evidence. An opaque actor type is not a verification implementation. The row predicate is part of the mutation; a previous lookup alone can race.

## 2. Narrow editable fields and server authority

Vulnerable:

```ts
await db.update(profiles).set(await request.json()).where(eq(profiles.id, user.id));
```

Fixed value-selection function, independent from the body-byte/auth wrappers:

```ts
function profilePatch(input: unknown): { display_name: string } {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Response("Invalid body", { status: 400 });
  }
  const fields = Object.keys(input);
  if (fields.length !== 1 || fields[0] !== "display_name") {
    throw new Response("Unexpected field", { status: 400 });
  }
  const value = (input as { display_name?: unknown }).display_name;
  if (typeof value !== "string" || value.trim().length < 1 || value.length > 80) {
    throw new Response("Invalid name", { status: 400 });
  }
  return { display_name: value.trim() };
}
```

This validator deliberately excludes role, owner, tenant, plan, price and credits. It does not authenticate, cap request bytes or prove database access. Use it only after bounded input reading and before an owner-scoped write.

## 3. Query scope plus response shape

Vulnerable:

```ts
const rows = await db.select().from(profiles).where(eq(profiles.id, actor.userId));
return Response.json(rows); // ownership alone does not remove private columns
```

Fixed:

```ts
const scope = await requireCurrentMembership(event, 'profile:read');
const [data] = await db.select({ id: profiles.id, displayName: profiles.displayName })
  .from(profiles)
  .where(and(eq(profiles.id, scope.userId), eq(profiles.organizationId, scope.organizationId)))
  .limit(1);
if (!data) throw new Response('Not found', { status: 404 });
return Response.json({ id: data.id, displayName: data.displayName }, {
  headers: { 'Cache-Control': 'private, no-store' }
});
```

An R2 key itself is not an access grant or public URL. Resolve file access separately through verified ownership and intended public/private policy. Do not return a signed URL or credential as incidental profile data.

## 4. Cross-request state

Vulnerable:

```ts
let currentUserId: string | undefined;
async function loader(request: Request) {
  currentUserId = (await requireVerifiedActor(request)).userId;
  await someOtherWork();
  return listFor(currentUserId); // another request can change the global
}
```

Fixed:

```ts
async function loader(request: Request) {
  const actor = await requireVerifiedActor(request);
  await someOtherWork();
  return listFor(actor.userId); // identity remains local to this invocation
}
```

A public immutable config object is different. A global mutable Map of private results also needs an explicit isolation/invalidation design; adding a user id to a key alone is not permission revocation.

## 5. Cookie-based mutation and trusted origin

Vulnerable:

```ts
if (request.headers.get("Origin") === request.headers.get("X-Forwarded-Host")) {
  return changeSettings(); // unrelated formats and attacker-controlled trust basis
}
```

Fixed guard for a deliberately same-origin browser mutation:

```ts
function requireBrowserMutation(request: Request, configuredOrigin: string): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    throw new Response("Method not allowed", { status: 405 });
  }
  const expected = new URL(configuredOrigin).origin;
  if (request.headers.get("Origin") !== expected) {
    throw new Response("Forbidden", { status: 403 });
  }
  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin" && site !== "none") {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

This is only an origin/method layer. The configured canonical origin, verified session, authorization, request schema, actual CSRF design and body caps remain required. Bearer APIs, signed webhooks and external callbacks need their own explicit flow instead of widening this allowlist. Hosted Checkout does not require trusting arbitrary browser posts from its origin.

## 6. Guard swallowed by catch

Vulnerable:

```ts
try {
  const actor = await requireVerifiedActor(request);
  return exportAll(actor);
} catch {
  return exportAllAsServiceRole();
}
```

Fixed control flow:

```ts
const actor = await requireVerifiedActor(request); // denial cannot enter fallback
try {
  return await exportOwned(actor);
} catch (error) {
  if (error instanceof Response) throw error;
  throw new Response("Export unavailable", { status: 500 });
}
```

The real project must preserve its intended framework control responses and avoid catching asynchronous rejections incorrectly. Error handling does not authorize a privileged retry.

## 7. SSR headers and errors

Vulnerable:

```ts
return { responseHeaders: Object.fromEntries(upstream.headers), error: error.message };
```

Fixed:

```ts
const count = upstream.headers.get("content-range");
return { range: count, message: "Request unavailable", errorId };
```

Read whether content-range is actually safe/needed and whether errorId refers to real redacted server logging. Never serialize Set-Cookie, Authorization or upstream session/signing headers. A generic message alone is not proof that private details were not logged elsewhere.

## 8. Rich text and attribute trust

Vulnerable:

```tsx
<div dangerouslySetInnerHTML={{ __html: userText }} />
<a {...externalBlock.props}>{externalBlock.label}</a>
```

Fixed when plain text is enough:

```tsx
<div>{userText}</div>
<a href={validatedSameOriginHref} className={externalBlock.variant === "primary" ? "primary" : "plain"}>
  {externalBlock.label}
</a>
```

validatedSameOriginHref must come from a real URL validator, not a cast. If rich HTML is required, a selected runtime-compatible sanitizer must process the exact final value after raw HTML parsing; this example does not implement or install one. Runtime compilation of untrusted component content is a separate code-execution boundary.

## 9. Public static versus private cached output

Vulnerable:

```ts
return Response.json(privateRows, { headers: { "Cache-Control": "public, s-maxage=60" } });
```

Fixed default for a sensitive authorized result:

```ts
return Response.json(safeOwnedRows, { headers: { "Cache-Control": "no-store" } });
```

Inspect explicit application-managed cache and service-worker code too: code can cache even a response marked no-store. Static asset allowlists can cache public files; private loader/resource/account responses must remain excluded. Vary alone does not create an authorization boundary.

## 10. Bounded byte intake

Vulnerable:

```ts
const body = await request.json(); // buffers before an application bound
```

Fixed standalone reader for a JSON-sized body:

```ts
async function boundedBytes(request: Request, maxBytes: number): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error("Invalid body cap");
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      total += item.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Response("Body too large", { status: 413 });
      }
      chunks.push(item.value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
```

This controls bytes consumed into memory, not upload count, decompression expansion, parsed JSON depth, CPU, concurrency or paid work. Choose an application cap and inspect the platform's actual behavior. For Stripe webhook signatures use the exact captured raw bytes and selected SDK/runtime verification before trusting JSON; do not mutate/re-encode them first.

## 11. Relative redirects and outbound fetch

Vulnerable:

```ts
return Response.redirect(new URL(new URL(request.url).searchParams.get("next")!, request.url));
await fetch(submittedUrl, { headers: { Authorization: incomingAuthorization } });
```

The local Security snippets provide a complete same-origin relative redirect helper. For outbound fetch, a selected configured origin plus validated resource identifier is preferable to an arbitrary URL. An allowlist must be applied after URL parsing and every redirect/DNS trust boundary must be considered; do not claim a hostname string comparison alone prevents DNS rebinding. Never forward browser credentials to a user-selected host. No network test was performed here.

## 12. Payment outcome is not entitlement

Vulnerable:

```ts
if (new URL(request.url).searchParams.get("success")) grantAccess();
```

Fixed boundary: the return route can show pending status, while server-side entitlement is derived from a verified, replay-safe Stripe webhook and durable records under the correct customer/user mapping. Use optional custom checkout, validate server-chosen prices and do not create a session, payment or provider call merely to review this example. The full local webhook method carries raw-byte/signature/retry requirements.
