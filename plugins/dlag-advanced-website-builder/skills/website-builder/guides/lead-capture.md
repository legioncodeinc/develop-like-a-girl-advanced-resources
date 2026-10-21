# Lead capture with a durable receipt

Use a SvelteKit named action for the website form and Neon/Drizzle for the accepted lead. Payload stores page copy and editor-managed form labels; it does not expose a public lead collection or determine the notification recipient.

1. Define the accepted fields and consent purpose. Render visible labels, a server-returned field error and receipt state. Use a standard POST form; enhancement is optional. Avoid requiring an account for a public contact form.
2. Enforce body-size and rate limits before parsing. Validate strings, maximum lengths and the consent value server-side. Treat recipient, owner, notification state, redirect and provider identifiers supplied by the browser as untrusted and do not copy them into the record.
3. Create an opaque submission token at form rendering, bind it to the form/session with an expiry, and store a unique accepted-operation key with an input digest. On the same token with a different normalized input, return a conflict. A hidden UUID alone is neither CSRF nor bot protection. Keep SvelteKit's origin checks enabled.
4. Persist the lead and receipt in a transaction. If notification is requested, save a notification intent in that transaction with the fixed server recipient and an identifier derived from the receipt. Return only the opaque receipt, never the complete lead or secret provider result.
5. For a low-volume form, the request can claim that intent and attempt a bounded transactional Resend send after the commit, saving accepted/failed/uncertain outcome before returning. Leave enough execution time to persist the outcome. Do not claim delivery from an accepted API response. A lost response or interrupted attempt remains uncertain; reconcile with the provider or retry within its documented idempotency contract.
6. Implement an authorized retry path for failed/uncertain intent without recreating the lead. If the project needs unattended retries, choose and authorize a durable runner explicitly; this kit does not imply one is installed. Do not start a detached promise after the HTTP response.
7. Show “Request received” when persistence succeeded. A notification failure does not tell the visitor to submit the same lead again. Scope receipt lookup so one visitor cannot enumerate another's submission.

`dlag-advanced-core:data-foundation` owns the application schema/transaction and replay constraint. `dlag-advanced-core:resend-transactional` owns the bounded send, idempotency and outcome adapter. `dlag-advanced-core:implementation-foundation` owns ingress limits. Start with a fake adapter when provider operations are not authorized; label the observed result honestly.

Check valid acceptance, invalid input, missing consent, duplicate same input, duplicate changed input, injected recipient, provider rejection and uncertain delivery. An ordinary marketing page needs none of this when lead capture is not requested.
