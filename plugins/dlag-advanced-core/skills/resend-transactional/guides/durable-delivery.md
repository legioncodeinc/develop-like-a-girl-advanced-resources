# Send a transactional notification without adding a job service

The smallest useful implementation writes the business change and one delivery intent together, commits, then attempts delivery within the authorized request. A failed email must not undo a saved lead or completed business action. Return a truthful saved/pending state and expose an authorized retry operation. This is sufficient without inventing a queue, scheduler or newsletter platform.

## Durable intent

Adapt this schema to the application's owner model and retention policy. Store recipient/template inputs as protected data, not public logs. The accepted payload is immutable across retries.

```sql
CREATE TABLE delivery_intents (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  business_event_id uuid NOT NULL,
  purpose text NOT NULL,
  payload jsonb NOT NULL,
  payload_sha256 text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  state text NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'sending', 'accepted', 'delivered', 'failed', 'unknown')),
  claim_id uuid,
  lease_until timestamptz,
  first_attempt_at timestamptz,
  provider_id text UNIQUE,
  attempt_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_event_id, purpose)
);
```

Construct an explicit canonical payload with fixed field order before hashing; arbitrary object serialization is not a general canonicalization algorithm. For example encode `[sender, recipient, templateVersion, subject, escapedHtml]` consistently. Resolve each field from verified server data. The key can be `notification/[intent UUID]`; keep it stable and within Resend's documented length.

In one transaction insert the business row and intent. A duplicate business operation returns its existing row/intent, and rejects a changed payload hash. Do not use conflict handling that overwrites the existing payload or resets accepted state to pending.

## Claim and dispatch

The following parameterized statement claims one owner-authorized intent. `$1` is ID, `$2` verified owner, `$3` a new server claim UUID. A 30-second lease is illustrative; choose a lease longer than the actual bounded provider request and database bookkeeping.

```sql
UPDATE delivery_intents
SET state = 'sending', claim_id = $3,
    lease_until = now() + interval '30 seconds',
    first_attempt_at = coalesce(first_attempt_at, now()),
    attempt_count = attempt_count + 1, updated_at = now()
WHERE id = $1 AND owner_id = $2
  AND (
    state IN ('pending', 'unknown')
    OR (state = 'sending' AND lease_until < now())
  )
  AND (first_attempt_at IS NULL OR first_attempt_at > now() - interval '23 hours')
RETURNING id, payload, payload_sha256, idempotency_key, claim_id;
```

The 23-hour retry cutoff leaves margin inside Resend's documented 24-hour key retention. An expired uncertain attempt requires reconciliation, not a new key. `accepted`, `delivered` and permanent `failed` records are not automatically reclaimed. Add bounded retry count/backoff appropriate to the event.

1. Claim in a short database statement and commit it before the external request.
2. Call the existing [send helper](../examples/recipe.ts) with the immutable claimed intent. Configure the installed SDK's supported request timeout/transport to fit the route duration; a `Promise.race` alone does not cancel the send. If the installed SDK cannot provide the required timeout, implement an approved HTTP adapter with AbortController and bounded response reading.
3. On a valid provider acceptance persist `provider_id` and accepted state. The update includes intent ID and claim ID. If it affects no row, inspect the current durable record instead of overwriting newer state.
4. A definitive validation rejection is failed with a sanitized classification. The bundled minimal SDK helper deliberately hides provider error details; treat its generic thrown errors as unknown unless the application supplies a typed, reviewed adapter that can distinguish permanent rejection. Timeout, connection failure or unexpected/missing acceptance is unknown; never report definitely unsent. Store the outcome conditionally against the claim. Unexpected database failure stays a retryable server failure, not success.
5. If a process dies after acceptance but before persistence, replay the same payload/key inside its window. The provider may return the same message ID. The app's unique business intent prevents a separate local send operation.

```sql
-- Acceptance after a send. $1 ID, $2 claim ID, $3 accepted provider message ID.
UPDATE delivery_intents
SET state = 'accepted', provider_id = $3, lease_until = NULL, updated_at = now()
WHERE id = $1 AND claim_id = $2 AND state = 'sending';
```

This pattern serializes normal attempts and bounds recovery. It does not promise exactly-once external delivery. Avoid sending sensitive raw content if a link to an authenticated app page is enough.

## Delivery callback and recovery

Use [the SDK signature verifier](../examples/verify-delivery.server.ts) on the bounded raw request body. Create a unique callback receipt keyed by verified event ID with raw payload hash. In a transaction, lock the matched intent by stored provider ID, insert/check the receipt, and apply the transition. A callback can arrive before the send response was saved: leave it retryable or durably record it as pending correlation, then reconcile after acceptance. Do not acknowledge and discard it.

| Incoming evidence | Allowed result |
|---|---|
| Provider accepted request | accepted; not delivered |
| Verified `email.delivered` | delivered for the correlated intent |
| Verified bounce/failure | failed with delivery reason; no blind resend to bounced address |
| Older acceptance after delivery | preserve delivered |
| Duplicate event/hash | return recorded outcome |
| Same event ID, different hash | refuse and retain conflict evidence without message PII |
| Database transaction failure | retryable non-2xx; no processed receipt committed alone |

Use event timestamps and the provider's event meanings for ordering. Do not let arrival order arbitrarily overwrite terminal outcomes. An operator recovery view needs intent ID, purpose, state, attempt count, age and safe reason, not raw payload or recipient dumps. Retain event receipts and personal message data only as long as the product requires.

Project checks: duplicate form operation creates one intent; concurrent claims have one winner; crash after acceptance recovers within retention; expired unknown cannot auto-resend; callback-before-acceptance survives; late accepted cannot downgrade delivered; another owner cannot retry an intent. Live sender DNS, delivery and webhook registration remain separately authorized provider work.

Sources checked 2026-10-21: [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [send API](https://resend.com/docs/api-reference/emails/send-email), [webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests).
