// src/lib/server/transactional-email.ts. SDK recipe, not an automatically running sender.
import { Resend } from 'resend';
type ClaimedIntent = Readonly<{
  idempotencyKey: string; approvedSender: string; verifiedRecipient: string;
  subject: string; escapedHtml: string;
}>;
export async function sendClaimedIntent(resend: Resend, intent: ClaimedIntent) {
  // Caller must verify immutable persisted intent, atomic claim and retry-age policy.
  const result = await resend.emails.send({
    from: intent.approvedSender, to: intent.verifiedRecipient,
    subject: intent.subject, html: intent.escapedHtml
  }, { idempotencyKey: intent.idempotencyKey });
  if (result.error) throw new Error('Transactional provider rejected the message');
  if (!result.data?.id) throw new Error('Transactional outcome is unknown');
  return { state: 'accepted' as const, providerId: result.data.id };
}
// Catch network errors at the durable dispatcher boundary and record unknown safely.
// Do not log SDK request bodies, recipient PII or raw error payloads.
