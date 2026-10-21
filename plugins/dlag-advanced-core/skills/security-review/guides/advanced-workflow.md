# Review Advanced trust boundaries

Trace a concrete request through identity, authorization, data access and output. Review actual supplied code, not framework reputation. The following paths select relevant questions; they do not require every project to add every feature.

| Path | Required boundary | Evidence to inspect |
| --- | --- | --- |
| WorkOS session to app action | Verified session plus current organization/membership permission | Server request hook, guard and denied path; no browser-trusted organization |
| App action to Neon | Object and tenant scope on every read/write/export/search | Parameterized query, selected fields, mutation predicate and affected-row handling |
| Payload editor to content | Payload editor auth and collection/field access | Public published query, draft access, Local API access behavior |
| App/CMS to R2 | Owning record checked before issuing access | Opaque key, size/type limits, public/private separation, upload completion |
| Transactional message | Server-controlled recipient/template and durable intent | Claim, deduplication, bounded send, accepted/failed/unknown outcome |
| Stripe/provider webhook | Verified raw body plus durable event processing | Signature, endpoint secret, event/account association, transaction and replay |

## SvelteKit and browser output

Inspect server-only modules and serialized loader/action fields. Secrets, access tokens and provider error bodies must not reach browser data or logs. Check unsafe HTML, redirect destinations, user-controlled fetch URLs, forwarded headers and request-body limits. Private routes and previews must not enter shared public caches. A layout redirect does not replace authorization in endpoints/actions that can be called directly.

## Two authentication systems

WorkOS customer membership and Payload editor access are independent. A Payload Local API call can bypass access by default depending on its options: require an explicit access decision, real principal and scoped operation. Server-to-server credentials do not automatically make an arbitrary caller an editor. Never expose drafts or private fields through a public website content endpoint.

## Durable side effects

A webhook retry can arrive concurrently or out of order. Inspect the unique event/semantic key and transaction that gates state changes. Check that timeouts preserve uncertainty and that retries cannot double-grant an entitlement, double-send mail or duplicate a business mutation. Payment success URLs do not grant access; the server records verified state associated with its own order/customer.

For every finding cite the input, missing control, reachable actor and practical effect with exact source locations. Record unknown runtime/provider behavior as unknown. A clean static review is scoped evidence, not a live security certification. Return fixes to the implementation owner, then assess changed relevant paths before Quality.
