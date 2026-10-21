# Implement an application integration

Start only for the provider named in the project brief. SvelteKit owns the application endpoints on Vercel. The provider's official SDK owns signature semantics. Neon stores connection scope, receipts and delivery intent; Doppler supplies approved application secrets. A provider adapter does not add a job service by itself.

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/server/integrations/provider.ts` | Fixed origin/routes, current API version, bounded HTTP and provider response projection. |
| `src/lib/server/integrations/events.ts` | Convert verified provider events into an allowlisted internal event union. |
| `src/lib/server/integrations/store.ts` | Transactional receipt and domain mutation under the mapped owner. |
| `src/routes/api/integrations/provider/webhook/+server.ts` | Read bounded raw bytes, verify signature, then apply event. |
| `src/routes/(app)/settings/integrations/+page.server.ts` | Verify actor/permission before connect, disconnect or manual retry. |

Keep the vendor SDK and token access in server-only modules. Do not return provider tokens or full SDK responses from page loads. Record a provider reference, stable operation key, sanitized failure category and timestamps for support; do not log the raw body, authorization header or personal data.

## Internal event contract

```ts
export type VerifiedEvent = Readonly<{
  provider: string;
  eventId: string;
  externalAccountId: string;
  rawDigest: string;
  kind: 'record.updated' | 'connection.revoked';
  objectId: string;
  revision: number;
}>;
export type ApplyResult = 'applied' | 'duplicate' | 'stale' | 'conflict' | 'unknown-account';
```

The adapter creates this event only after verifying the official signature against bounded raw bytes, timestamp/replay requirements and decoded schema. TypeScript types alone do not establish that verification. Reject unrecognized event kinds. Map externalAccountId through a server-maintained connection created by the authenticated connect flow; never accept a tenant ID from the webhook as authority.

## Transactional event handling

The following SQL describes store operations for a single verified event, not a migration to run automatically. Use Data Foundation to implement it with parameterized Drizzle queries and the chosen driver's actual transaction support. `provider`, `event_id`, connection ID and digest are bound parameters. The connection record has a unique `(provider, external_account_id)` key and a server-owned app owner ID.

```sql
BEGIN;
-- The verified external account determines this row, not a client owner field.
SELECT id, owner_id, disconnected_at
FROM integration_connections
WHERE provider = $1 AND external_account_id = $2
FOR UPDATE;
-- No connection: terminate as unknown-account. Revoked connection: no normal writes.
-- Insert a receipt scoped to this connection and provider event identity.
INSERT INTO integration_events (connection_id, event_id, body_digest, state)
VALUES ($3, $4, $5, 'received')
ON CONFLICT (connection_id, event_id) DO NOTHING;
SELECT body_digest, state FROM integration_events
WHERE connection_id = $3 AND event_id = $4 FOR UPDATE;
-- Different digest: rollback and report conflict.
-- Already applied/stale with same digest: commit and report duplicate.
-- Apply an allowlisted mutation using connection.owner_id in its WHERE predicate.
-- Compare the stored provider revision before applying out-of-order updates.
-- Revocation sets disconnected_at and cancels pending intents atomically.
UPDATE integration_events SET state = $6, processed_at = now()
WHERE connection_id = $3 AND event_id = $4;
COMMIT;
```

`$3` is the ID read from the locked connection, `$6` is a server-selected terminal state such as applied or stale. The connection lock serializes events for that connection; partition finer only if demonstrated throughput needs it. Never hold a database transaction open while making a provider HTTP call. If a domain mutation fails, roll back its receipt so a later legitimate delivery can retry. Same-body concurrent deliveries cannot both apply the domain write. A stale revision is recorded without reverting newer local state. If the provider lacks monotonic revisions, use its documented reconciliation mechanism rather than inventing an ordering guarantee.

The example represents one transaction on one database connection. It cannot be implemented as unrelated calls over a driver that does not support this transaction shape. Route that selection through `dlag-advanced-core:data-foundation`.

## Outbound writes and recovery

1. In the local business transaction, save a unique `(owner, operation, key)` intent plus normalized input digest. A repeat key with changed input is a conflict. Save the accepted request once.
2. An authorized server request may claim pending work with an atomic state transition and a bounded lease. Verify the connection is still enabled immediately before sending. Use a deterministic provider idempotency key scoped to the connection and operation.
3. Perform the bounded HTTP call outside the database transaction. Record accepted/rejected/uncertain outcome with a compare-and-set on the claim token so an expired sender cannot overwrite a newer claim. An HTTP timeout after a write is uncertain, not evidence of rejection.
4. Retry only documented transient outcomes, with capped attempts/backoff and a provider-compatible idempotency window. After the provider's deduplication window, reconcile by the stored remote reference before resending.
5. A manual retry action requires the same owner permission as the original operation. If unattended recovery is requested, explicitly select its runner and schedule. Neither a persisted intent nor a promise started after response guarantees that work will run.
6. Disconnect atomically disables new claims and cancels pending retries. Record that an already in-flight remote operation may still complete; revoke provider credentials when authorized and reconcile its result without reconnecting the account.

## Route response behavior

| Outcome | Response policy |
| --- | --- |
| Signature invalid or stale | Provider-appropriate authentication rejection, no database mutation. |
| Unsupported event | Explicitly documented ignore/acknowledgment or rejection; never an accidental mutation. |
| Unknown account | Quarantine or reject under the accepted contract, no guessed owner. |
| Duplicate same payload | Acknowledge the recorded committed result. |
| Same ID changed content | Conflict, preserve the original record and flag investigation. |
| Database unavailable | Retryable response according to the provider delivery contract. |
| Durable accepted event | Acknowledge only after commit. |

Do not claim a universal response code or HMAC format across vendors. The [integration contract](../templates/integration-contract.md) records the actual provider semantics. For a manual sync, show accepted, in progress, failed or uncertain status and offer only permitted recovery actions. See [failure cases](../examples/failure-matrix.md).

Primary references: [SvelteKit server-only modules](https://svelte.dev/docs/kit/server-only-modules), [PostgreSQL row locking](https://www.postgresql.org/docs/current/sql-select.html), [Vercel function limits](https://vercel.com/docs/functions/limitations). Check the project's plan/runtime limits rather than copying a fixed maximum duration into every adapter.
