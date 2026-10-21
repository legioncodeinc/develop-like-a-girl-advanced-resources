# Bounded content and lead recipes

## Public server load

Keep CMS origin in private server configuration. Hard-code the collection (`posts` or `pages`) in each route, validate slug (for example 1 to 100 lowercase letters, digits and hyphens), and construct a URL using URLSearchParams. Force `_status=published`, `draft=false`, `limit=1`, `depth=0`, select public fields only. Do not merge arbitrary browser query/filter/collection/endpoint values. Fetch with an explicit timeout and `redirect: 'error'`, check response status, content type and decoded schema before returning a public DTO. A missing document is a 404, CMS failure is a bounded unavailable state.

```ts
const url = new URL('/api/posts', CMS_ORIGIN);
url.searchParams.set('where[and][0][_status][equals]', 'published');
url.searchParams.set('where[and][1][slug][equals]', slug);
url.searchParams.set('draft', 'false');
url.searchParams.set('limit', '1');
url.searchParams.set('depth', '0');
url.searchParams.set('select[title]', 'true');
url.searchParams.set('select[slug]', 'true');
url.searchParams.set('select[content]', 'true');
const response = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'error' });
// Check status, JSON size/schema, then return only title/slug/safe rendered content.
```

This snippet is a boundary sketch, not a complete validated loader. Collection-level CMS access still filters anonymous documents; a URL filter alone is not security. Page output must omit editor relationship expansions and auth fields.

## Lead action contract

`+page.server.ts` validates FormData through the installed validator; ignore client owner/recipient/status fields. Use a fixed transactional notification recipient from server configuration and a stable receipt keyed to the accepted lead operation. When notification is selected, the transaction inserts lead + notification intent; an authorized bounded post-commit sender claims the intent and uses a stable Resend idempotency key. An unattended runner is a separate explicit choice. Retry delivery without duplicating the lead or claiming an email arrived. No newsletter enrollment, vendor call, webhook URL from a form or automatic production migration.

## Content hooks

Payload afterChange sends a signed publication/invalidation event through a durable retry outbox, containing document ID/version only. SvelteKit verifies raw-body HMAC, expiry and replay key, then refreshes only a fixed cache scope. An arbitrary URL/path from a webhook never becomes a fetch or broad cache purge. Do not cache drafts while testing publish/unpublish. See Core implementation-foundation for shared HTTP boundaries.
