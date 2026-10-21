# SvelteKit payment implementation boundaries

## Server session sketch

```ts
// Server-only, after verified WorkOS identity, membership and fixed-price lookup.
const session = await stripe.checkout.sessions.create({
  ui_mode: 'elements', mode: 'payment', customer: order.stripeCustomerId,
  line_items: [{ price: order.allowedPriceId, quantity: 1 }],
  return_url: `${APP_ORIGIN}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  metadata: { orderId: order.id },
}, { idempotencyKey: `checkout:${order.operationId}` });
// Bind session.id to durable owned order before returning session.client_secret.
```

No client body spreads or arbitrary customer/session lookups. Validate installed SDK types for `ui_mode: elements` and API version. Never silently switch to raw PaymentIntents or a different checkout shape because old types fail.

## Svelte client lifecycle

Within `onMount`, call `loadStripe(publicKey)`, then `stripe.initCheckoutElementsSdk({ clientSecret })`, createPaymentElement, and mount a bound DOM element. Retrieve actions through `checkout.loadActions()` and check its success discriminator before `actions.confirm()`. Do not call `stripe.confirmPayment()` on the Checkout Session instance. Read and display `actions.getSession().total.total.amount` before confirming, and refresh that total from Checkout change events. Use synchronous onMount cleanup that marks initialization disposed, destroys any mounted Element and avoids mounting after unmount while async work finishes. Show initialization/confirmation failures and restore submit state; never display raw provider payloads or claim paid access. Inspect installed SDK typings rather than adding `any` or guessed method calls.

## Webhook route sketch

```ts
// src/routes/api/stripe/webhook/+server.ts, Node function runtime.
export const POST = async ({ request }) => {
  // Enforce stream byte cap before SDK verification; do not trust Content-Length alone.
  const raw = await readBoundedRawBody(request, MAX_WEBHOOK_BYTES);
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });
  let event;
  try { event = stripe.webhooks.constructEvent(raw, signature, WEBHOOK_SECRET); }
  catch { return new Response('Invalid signature', { status: 400 }); }
  // Validate event environment/account/type, then paid Session + durable order mapping.
  // applyVerifiedEvent atomically records event hash, locks order and grants once.
  await applyVerifiedEvent(event, sha256(raw));
  return new Response(null, { status: 200 });
};
```

These are contract sketches; `readBoundedRawBody`, `applyVerifiedEvent` and database schema must be implemented and checked. Use retryable 5xx for transient durable write failures, permanent 4xx for malformed/unauthorized requests, and 2xx for a safely recorded duplicate/unsupported event according to the declared event contract. Never catch all errors into a false success. Add a unique order entitlement and provider event constraint; provision transaction rollback and replay cases before any live billing claim.
