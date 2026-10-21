# Code contracts for secure defaults

These are reviewed design examples, not a complete installed application, SDK integration, migration or executed test. Security Review remains Read/Grep/Glob/Skill only. An implementation caller must adapt them to the actual installed APIs, schema, role, Vercel server environment and accepted policy, then obtain independent review and target evidence. Declared interfaces below are explicit unimplemented boundaries: a type name does not supply identity verification, database policy, durable work or entitlement logic.

## 1. Same-origin browser mutation and a local redirect

A configured canonical origin is supplied by the server's accepted environment, not blindly taken from an attacker-controlled forwarding header. This example deliberately denies missing Origin; necessary cross-origin/nonbrowser exceptions require their own authenticated policy. A webhook uses provider signature verification instead.

```ts
export function requireSameOriginMutation(request: Request, canonicalOrigin: string) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    throw new Response('Method not allowed', { status: 405 });
  }
  const expected = new URL(canonicalOrigin).origin;
  const received = request.headers.get('Origin');
  if (received !== expected) throw new Response('Forbidden', { status: 403 });
}

export function localReturnPath(value: unknown, canonicalOrigin: string): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  const origin = new URL(canonicalOrigin).origin;
  const target = new URL(value, origin);
  return target.origin === origin ? target.pathname + target.search + target.hash : '/';
}
```

The origin check is one anti-CSRF policy for browser cookie mutations; it is not identity or object authorization. The redirect helper is not a callback/SSRF allowlist. Test actual proxy/adapter canonicalization, production requests, encoded/backslash inputs, allowed paths and the required rejection paths. A failed check must occur before database or external effects.

## 2. Verified actor, owner-scoped read and explicit DTO

The adapter `verifyActor` must implement the selected WorkOS session/token verification, project/environment checks and current permission policy. Never implement it as trusting a request body user ID or the unverified decoded token. The owner-scoped query must use an explicit verified tenant scope with reviewed database permissions and must not return the entire provider/session record.

```ts
type Actor = { id: string };
type OwnedNote = { id: string; title: string };
type NoteServices = {
  verifyActor(request: Request): Promise<Actor | null>;
  readOwnedNote(actorId: string, noteId: string): Promise<OwnedNote | null>;
};

export async function noteResponse(
  request: Request, noteId: string, services: NoteServices
): Promise<Response> {
  const actor = await services.verifyActor(request);
  if (!actor) return new Response('Authentication required', { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(noteId)) {
    return new Response('Invalid request', { status: 400 });
  }
  const row = await services.readOwnedNote(actor.id, noteId);
  if (!row) return new Response('Not found', { status: 404 });
  return Response.json({ id: row.id, title: row.title }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
```

The small ID shape check is illustrative input filtering, not a complete UUID parser or authorization rule. Use the project's actual validated schema and test malformed IDs. The missing adapters, actual route mounting, membership revocation and allowed/denied behavior require target proof. Positive own-note controls are essential; blanket null results are not evidence of working permission.

### Concrete tenant-scoped Drizzle predicate

The actual project must supply `db`, the existing `notes` schema and a verified `scope` established by the current WorkOS membership policy. These are design excerpts, not executable fixtures or a new schema to install.

```ts
import { and, eq } from 'drizzle-orm';
// scope is created server-side after session AND current membership permission.
const rows = await db.select({ id: notes.id, title: notes.title })
  .from(notes)
  .where(and(eq(notes.id, noteId), eq(notes.organizationId, scope.organizationId)))
  .limit(1);
// An update also constrains the tenant in the same statement.
const changed = await db.update(notes).set({ title: validatedTitle })
  .where(and(eq(notes.id, noteId), eq(notes.organizationId, scope.organizationId)))
  .returning({ id: notes.id });
// Treat zero affected rows as unavailable; do not disclose a foreign record.
```

Membership verification, validation, permission to edit rather than read, transaction consistency and safe error handling remain required. The tenant comes from the authorized server scope, not a URL/body field. Do not pass an arbitrary scope object from the browser or export a raw client that routes can use to bypass these predicates. Review insert, delete, joins, counts, exports, pagination and search with the same rule. Positive own-tenant results and denied foreign/removed-member paths must both be demonstrated.

## 3. Neon database policy and tenancy contract

The baseline is explicit application query scope with current WorkOS membership. Neon does not automatically convert a WorkOS token into a PostgreSQL role or `auth.uid()`. Drizzle parameterization prevents value interpolation errors; it does not establish authorization. Inspect schema constraints and foreign keys that can connect objects across tenants.

If the project separately selected PostgreSQL RLS, use ordinary request roles and reviewed SELECT/DELETE USING plus INSERT/UPDATE WITH CHECK predicates. A migration role/table owner, superuser or BYPASSRLS role can invalidate an assumed policy boundary. Transaction-local verified tenant context must be set inside the same transaction as every protected query, with actual driver/pool support. Session-level state can leak between pooled requests. Deny missing, empty, malformed and stale context safely; invalid UUID casts may error rather than return zero rows. Test rollback and pooled reuse and prohibit unscoped raw-client bypasses. This is a review contract, not a migration or claim that optional RLS is installed.

## 4. Parameterized values and fixed identifier choices

Advanced selects Neon and Drizzle; this generic adapter example explains the same bound-value rule for reviewed raw SQL escape hatches. The actual `query` adapter must bind values using its installed API, not perform text substitution. The table/column expressions are controlled by code, and the user cannot select a tenant ID as authority.

```ts
type Query = (sqlText: string, values: readonly unknown[]) => Promise<unknown>;
const sortExpressions = {
  recent: 'created_at DESC, id DESC',
  title: 'title ASC, id ASC',
} as const;

export async function readNoteList(
  query: Query, verifiedActorId: string, requestedSort: unknown
) {
  if (typeof requestedSort !== 'string' ||
      !Object.prototype.hasOwnProperty.call(sortExpressions, requestedSort)) {
    throw new Response('Unsupported sort', { status: 400 });
  }
  const sort = sortExpressions[requestedSort as keyof typeof sortExpressions];
  return query(
    `SELECT id, title FROM public.private_notes WHERE owner_id = $1 ORDER BY ${sort} LIMIT 50`,
    [verifiedActorId],
  );
}
```

The fixed identifier map supplies both syntax and intended selection, while bound actor ID is a value. It does not replace RLS, column permission or the actor verifier. Review equivalent raw SQL/RPC/filter-string paths in the actual application. Add pagination stable under permission changes before treating this as a complete list feature.

## 5. Bounded original body and durable verified acceptance

The route sketch accepts injected interfaces to make omissions explicit. `verifyAndValidate` must call the supported installed Stripe SDK on the exact bytes with the correct endpoint secret and configured nonzero recency policy, then validate supported schema/event/environment/object mapping. It must not parse and reserialize before signature checking. `acceptDurably` must commit recoverable verified work, with appropriate event uniqueness and pending/failed/completed state; a duplicate must remain recoverable if not completed.

```ts
export async function boundedBytes(request: Request, maximum: number): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maximum) || maximum < 1) throw new Error('Invalid bound');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        await reader.cancel();
        throw new Response('Payload too large', { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) { body.set(chunk, at); at += chunk.byteLength; }
  return body;
}

type VerifiedWork = { providerEventId: string; eventType: string; accountId: string };
type IntakeServices = {
  verifyAndValidate(bytes: Uint8Array, signature: string): Promise<VerifiedWork>;
  acceptDurably(work: VerifiedWork): Promise<void>;
};

export async function stripeIntake(request: Request, services: IntakeServices): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const signature = request.headers.get('Stripe-Signature');
  if (!signature) return new Response('Invalid signature', { status: 400 });
  let bytes: Uint8Array;
  try { bytes = await boundedBytes(request, 256 * 1024); } // illustrative endpoint bound
  catch (error) {
    return error instanceof Response ? error : new Response('Invalid body', { status: 400 });
  }
  let work: VerifiedWork;
  try { work = await services.verifyAndValidate(bytes, signature); }
  catch { return new Response('Invalid event', { status: 400 }); }
  try { await services.acceptDurably(work); }
  catch { return new Response('Acceptance unavailable', { status: 503 }); }
  return new Response(null, { status: 200 });
}
```

The 256 KiB limit is an example endpoint policy, not a vendor maximum; select it against actual accepted events and runtime bounds. The sketch has no SDK adapter, durable table/transaction, background executor, entitlement writer, provider key access, reconciliation or runtime proof. A catch returning 503 does not undo an incorrectly implemented partial acceptance, so those adapters need failure-state tests. Do not swallow an invalid event into a completed state.

Use [guide 13](../guides/13-webhook-forgery-replay-and-recovery.md) for concurrency, duplicate IDs, distinct events for one effect, out-of-order state, crash recovery and key retirement. A queueMicrotask or waitUntil after a 200 is not a replacement for durable acceptance. No queue provider is selected. A custom checkout success return never grants entitlement; only the verified server business state may do so.

### Concrete server Stripe verifier variant

Preconditions: the project has explicitly selected optional custom Stripe and already installed a compatible `stripe` SDK supporting the documented asynchronous Web Crypto verifier. The correct per-endpoint secret and SDK credential are supplied as server-only Doppler-provided environment by the authorized environment owner. `acceptVerified` below is intentionally a typed, required implementation boundary for the real durable inbox/transaction; it must validate supported event/account mapping and commit recoverable work. The example implements actual byte reading/signature verification, not the missing persistence, business entitlement or background execution engine.

```ts
import Stripe from 'stripe';
type StripeEnv = { STRIPE_SECRET_KEY: string; STRIPE_WEBHOOK_SECRET: string };
type AcceptVerified = (event: Stripe.Event) => Promise<void>;
export async function verifiedStripeRequest(
  request: Request, env: StripeEnv, expectedLiveMode: boolean, acceptVerified: AcceptVerified
): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Service unavailable', { status: 503 });
  }
  const signature = request.headers.get('Stripe-Signature');
  if (!signature) return new Response('Invalid signature', { status: 400 });
  let raw: string;
  try {
    const bytes = await boundedBytes(request, 256 * 1024);
    raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    return error instanceof Response ? error : new Response('Invalid body', { status: 400 });
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw, signature, env.STRIPE_WEBHOOK_SECRET,
      undefined, Stripe.createSubtleCryptoProvider(),
    );
  } catch { return new Response('Invalid signature', { status: 400 }); }
  if (event.livemode !== expectedLiveMode) {
    return new Response('Wrong environment', { status: 400 });
  }
  try { await acceptVerified(event); }
  catch { return new Response('Acceptance unavailable', { status: 503 }); }
  return new Response(null, { status: 200 });
}
```

The UTF-8 decoder preserves the actual accepted text bytes without parsing/reserializing JSON; malformed encoding rejects. The SDK performs signature verification before event construction. `undefined` deliberately retains its supported default recency check instead of zero; pin and verify actual installed behavior. An environment mismatch denies before persistence. No secret value appears in the output. The declared acceptance function must handle duplicate/pending/failed/completed status, actual schema/event/account mapping and concurrent recovery. Do not call it a no-op and claim this route grants safe entitlement. A success return means durable accepted work under that implementation contract, not completion. Actual SDK compilation, signed-fixture, persistence/crash/duplicate tests and live endpoint evidence remain unrun. See the [official Stripe source](https://github.com/stripe/stripe-node/blob/master/src/Webhooks.ts) and [current webhook contract](https://docs.stripe.com/webhooks).

## 6. R2 byte permission after metadata permission

This shape deliberately reads metadata through the verified actor's permission before using its server-owned object key. It does not take a bucket/key from the browser. The adapters and S3 client implementation are unprovided and require actual ownership/role/effect tests.

```ts
type FileServices = {
  verifyActor(request: Request): Promise<{ id: string } | null>;
  authorizedFile(actorId: string, fileId: string): Promise<{ storageKey: string } | null>;
  readPrivateBytes(key: string): Promise<ReadableStream<Uint8Array> | null>;
};
export async function privateFile(request: Request, fileId: string, s: FileServices) {
  const actor = await s.verifyActor(request);
  if (!actor) return new Response('Authentication required', { status: 401 });
  const metadata = await s.authorizedFile(actor.id, fileId);
  if (!metadata) return new Response('Not found', { status: 404 });
  const body = await s.readPrivateBytes(metadata.storageKey);
  if (!body) return new Response('Not found', { status: 404 });
  return new Response(body, { headers: {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }});
}
```

A database scope or RLS policy on metadata does not authorize an R2 URL. A presigned URL instead grants a temporary capability for its exact operation/key; anyone holding it may use it within its contract. Decide expiry and revocation limitations, public-bucket access, CORS, log/referrer exposure and concurrent permission change separately. A sensitive file requiring immediate revocation may need server-mediated access; do not claim URL expiry is immediate revocation.

## 7. Session cookie contract

Use the installed WorkOS session adapter for the customer app and Payload built-in editor authentication for the separate CMS. Inspect each actual cookie's Secure, HttpOnly, SameSite, Path/Domain, expiry, refresh and logout/revocation behavior. Do not replace provider-managed session cookies with an invented signed cookie.

For any separately selected custom opaque session, inspect server store, cryptographic token generation, expiry, fixation resistance, rotation and invalidation. A signed cookie is not automatically encrypted. A `__Host-` cookie requires Secure, Path=/ and no Domain. Neither cookie flags nor valid token claims establish current organization membership. The review supplies no session implementation or live authentication proof.

## 8. Registry origin parser, not a substring check

This optional Node example reads a standard lockfile supplied by the caller. It neither installs nor contacts a registry. It deliberately allows only public npm HTTPS origins; an actual project needs explicit reviewed rules for private registries, workspace/local/Git dependencies and their immutable identities.

```js
const fs = require('node:fs');
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const allowed = new Set(['registry.npmjs.org']);
const unexpected = [];
for (const [name, entry] of Object.entries(lock.packages || {})) {
  if (!entry.resolved) continue;
  try {
    const u = new URL(entry.resolved);
    if (u.protocol !== 'https:' || u.username || u.password ||
        (u.port && u.port !== '443') || !allowed.has(u.hostname)) unexpected.push(name);
  } catch { unexpected.push(name); }
}
if (unexpected.length) {
  console.error('Unapproved resolution entries:', unexpected); // names, not credential-bearing URLs
  process.exitCode = 1;
}
```

A valid hostname/integrity/registry signature is not proof a package is benign. Review lifecycle scripts, provenance source, current advisories and CI trust boundaries. Missing `resolved` fields need their actual workspace/lockfile semantics reviewed; this simple parser does not certify them.

## 9. Minimize telemetry before transmission

No telemetry provider is selected here. For any SDK actually present, implement its documented pre-send/replay/network masking hooks and inspect the real payload. An allowlist of fields is safer to review than deleting one email property while forwarding an arbitrary event object:

```ts
type Diagnostic = { operation: 'read-note' | 'accept-webhook'; status: 'ok' | 'denied' | 'failed' };
export function safeDiagnostic(operation: Diagnostic['operation'], status: Diagnostic['status']): Diagnostic {
  return { operation, status };
}
```

This is only a field-minimization example. It has no exporter or runtime proof. Inspect URLs, cookies, request bodies, exception arguments, breadcrumbs, transaction/span names, query values, static personal text, custom inputs and replay network captures. A server-side scrubber is a backstop after transmission; access/retention and agent-context exposure remain separate. Never pass credential matches into the report or chat.
