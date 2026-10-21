# Build the optional custom checkout

This recipe completes the UI and durable fulfillment method around the [existing server sketch](../references/recipes.md). Use it only when the product selected payments. It targets Svelte 5, an authenticated SvelteKit route and the installed Stripe.js Checkout Elements SDK. Keep custom checkout; do not replace it with a hosted redirect flow to avoid writing the UI.

## Contract before the component

The owner-authorized `POST /api/checkout` accepts an opaque existing order ID, checks exact origin and current ownership, resolves server-owned price/customer, and creates or recovers one Checkout Session using the persisted operation key. The route returns `{ clientSecret }` with private/no-store only after the Session ID is durably bound to that order. Use bounded request/response sizes. An HTTP retry reuses the same operation and immutable price snapshot.

Set `ui_mode: 'elements'`, `mode: 'payment'`, server-owned customer with validated email, fixed `return_url`, and one-time line items. Configure automatic tax, discounts, adjustable quantities or currency changes only if the durable amount-matching policy supports them. The simple fixed-price recipe leaves them off. Pin the installed compatible SDK/API version; do not force an obsolete type with `any`.

## Svelte payment component

The page loads its own public publishable key and opaque owned order ID. Neither prop grants access. Mount this component keyed by order ID if navigation can switch orders without destroying the route.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadStripe, type StripePaymentElement, type StripeCheckoutElementsSdk } from '@stripe/stripe-js';
  let { publishableKey, orderId }: { publishableKey: string; orderId: string } = $props();
  let mountPoint: HTMLDivElement;
  let ready = $state(false);
  let busy = $state(false);
  let message = $state('Loading secure payment form…');
  let total = $state('');
  let confirm: (() => Promise<void>) | undefined;

  onMount(() => {
    let disposed = false;
    let payment: StripePaymentElement | undefined;
    let checkout: StripeCheckoutElementsSdk | undefined;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 10000);
    async function initialize() {
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId }), signal: abort.signal
        });
        if (!response.ok) throw new Error('Checkout could not be prepared');
        // This same-origin endpoint returns a deliberately small, fixed response contract.
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object' || !('clientSecret' in body)
          || typeof body.clientSecret !== 'string' || body.clientSecret.length > 4096) {
          throw new Error('Invalid checkout response');
        }
        const stripe = await loadStripe(publishableKey);
        if (!stripe || disposed) return;
        checkout = stripe.initCheckoutElementsSdk({
          clientSecret: body.clientSecret,
          elementsOptions: { appearance: { theme: 'stripe' } }
        });
        const loaded = await checkout.loadActions();
        if (disposed) return;
        if (loaded.type !== 'success') throw new Error('Checkout could not be loaded');
        const actions = loaded.actions;
        // Reading/displaying the actual Checkout total is required before confirmation.
        total = actions.getSession().total.total.amount;
        checkout.on('change', (session) => {
          if (!disposed) total = session.total.total.amount;
        });
        payment = checkout.createPaymentElement();
        payment.on('ready', () => {
          if (!disposed) { ready = true; message = ''; }
        });
        payment.on('loaderror', () => {
          if (!disposed) { ready = false; message = 'Payment form unavailable. Reload to try again.'; }
        });
        payment.mount(mountPoint);
        confirm = async () => {
          const result = await actions.confirm();
          if (disposed) return;
          message = result.type === 'error'
            ? result.error.message : 'Payment submitted. Waiting for confirmation.';
        };
      } catch {
        if (!disposed) message = 'Checkout is unavailable. Reload to try again.';
      } finally {
        clearTimeout(timeout);
      }
    }
    void initialize();
    return () => {
      disposed = true;
      abort.abort();
      clearTimeout(timeout);
      ready = false;
      confirm = undefined;
      payment?.destroy();
      // Checkout SDK has no documented destroy method; destroy the mounted Element.
      checkout = undefined;
    };
  });
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!ready || busy || !confirm) return;
    busy = true;
    message = '';
    try { await confirm(); }
    catch { message = 'Payment could not be confirmed. Check the order before trying again.'; }
    finally { busy = false; }
  }
</script>

<form onsubmit={submit} aria-busy={busy}>
  <div bind:this={mountPoint}></div>
  <p aria-live="polite">{message}</p>
  {#if total}<p>Total: {total}</p>{/if}
  <button type="submit" disabled={!ready || busy}>{busy ? 'Confirming…' : 'Pay securely'}</button>
</form>
```

Apply the product's design tokens through Appearance API options; leave card fields inside Stripe's iframe. Do not collect or log card details in application inputs. Payment completion in the browser is display state only. A no-JavaScript page should explain that secure checkout requires JavaScript and offer the product's support route, without attempting a server-side card form.

The initial request timeout bounds checkout creation in this example; SDK initialization and provider confirmation have their own lifecycle. Do not abandon a paid order and create a new one because the UI timed out. The user can recover its existing status safely. Always escape error strings through ordinary Svelte text interpolation, never raw HTML.

## Webhook bytes and durable order model

Use this bounded raw-body reader in the Node webhook route. The cap is an application policy to verify against enabled events. It enforces actual bytes even without Content-Length.

```ts
import { error } from '@sveltejs/kit';
export async function readBoundedRawBody(request: Request, limit = 256 * 1024): Promise<Buffer> {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Invalid body limit');
  const reader = request.body?.getReader();
  if (!reader) error(400, 'Missing body');
  const parts: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        error(413, 'Body too large');
      }
      parts.push(value);
    }
    return Buffer.concat(parts, length);
  } finally {
    reader.releaseLock();
  }
}
```

Set a route/request deadline as well so an indefinitely slow body cannot occupy the function. Pass the exact Buffer to `stripe.webhooks.constructEvent`; never parse and reserialize first. The webhook endpoint uses Stripe signature authentication rather than app-session CSRF checks.

```sql
-- Adapt table names/foreign keys to the app's accepted schema.
CREATE TABLE payment_orders (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  operation_id uuid NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  stripe_session_id text UNIQUE,
  expected_amount bigint NOT NULL CHECK (expected_amount >= 0),
  expected_currency text NOT NULL,
  expected_price_id text NOT NULL,
  livemode boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'paid', 'expired'))
);
CREATE TABLE payment_events (
  event_id text PRIMARY KEY,
  payload_sha256 text NOT NULL,
  outcome text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payment_entitlements (
  order_id uuid PRIMARY KEY REFERENCES payment_orders(id),
  owner_id text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now()
);
```

Within a transaction-capable Neon/Drizzle transaction:

1. Insert the event receipt with `ON CONFLICT DO NOTHING RETURNING event_id`. On conflict read the committed receipt, compare its hash, and return its outcome only for an exact replay. A database failure is retryable.
2. Lock the local order selected by stored `stripe_session_id`. Check metadata order ID, Stripe customer, mode, live/test environment, expected currency and total. For the fixed-price scope match the server-created snapshot; if the product enables discounts/tax, persist the authoritative accepted calculation before fulfillment. Never trust metadata owner alone.
3. Accept `checkout.session.completed` only when paid; also handle matching `checkout.session.async_payment_succeeded`. Record unpaid completion without granting. A later paid event can still grant. Expired/failure events must not overwrite an already paid order.
4. Insert the unique entitlement for that order, change order to paid, and record event outcome in the same transaction. Throw on mismatch or write failure so no half-processed event survives.
5. Acknowledge only after commit. If a legitimate event arrives before Session binding commits, return a retryable failure or persist a recoverable unbound event, never discard it as processed success.

Do not grant from a checkout return URL. Its owner-authorized status endpoint reads the local order/entitlement; pending means payment evidence has not committed yet. Session IDs are identifiers, not permissions.

## Optional recurring scope

If subscriptions are selected, preserve the custom UI but implement a subscription state model before enabling it: bind customer/subscription/price to owner, process invoice payment and subscription change/deletion events, define trial/grace/past-due/cancel-at-period-end access, and reconcile out-of-order events against current provider state. A single checkout paid event is not lifetime subscription access. Refund, cancellation and saved-card/off-session operations remain separately scoped.

Sources checked 2026-10-21: [custom Checkout quickstart](https://docs.stripe.com/payments/quickstart), [confirmation and required total display](https://docs.stripe.com/js/custom_checkout/confirm), [official Stripe.js types](https://github.com/stripe/stripe-js/blob/master/types/stripe-js/checkout.d.ts), [fulfillment](https://docs.stripe.com/checkout/fulfillment), [webhook signatures](https://docs.stripe.com/webhooks/signature).
