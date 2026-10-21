import type { Resend } from 'resend';
// Apply a bounded body reader at the route before calling this helper.
export function verifyDelivery(resend: Resend, rawBody: string, headers: Headers, webhookSecret: string) {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signature = headers.get('svix-signature');
  if (!id || !timestamp || !signature) throw new Error('Missing webhook signature');
  return resend.webhooks.verify({
    payload: rawBody, headers: { id, timestamp, signature }, webhookSecret
  });
}
// Catch only verifier failures as a refusal. A later database failure must remain retryable.
// After verification: validate event type -> correlate email_id to persisted intent ->
// atomically deduplicate event/hash and apply a valid status transition -> acknowledge.
