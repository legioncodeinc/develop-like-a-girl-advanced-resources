# Integration failure matrix

| Condition | Required behavior |
| --- | --- |
| Invalid or stale signature | Reject before schema/state change |
| Unknown external account | Reject or quarantine without guessing owner |
| Duplicate ID, same body | Return recorded durable outcome |
| Duplicate ID, changed body | Reject conflict, preserve original |
| Provider rate limit | Bounded Retry-After handling |
| Timeout after write | Reconcile or replay same supported idempotency key |
| Revoked token/disconnected account | Stop delivery and retries; preserve revocation |
| Vercel timeout | Durable status remains retryable; no detached promise claim |

Record contract revision, synthetic input, actual outcome and evidence path. Pending live cases stay unproven.
