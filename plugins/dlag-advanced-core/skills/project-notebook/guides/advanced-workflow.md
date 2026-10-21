# Keep Advanced architecture decisions usable

Use the project's existing documentation location. One short product brief, an architecture note and the current task are usually enough. Add documents only when a real decision or boundary needs them.

## Record the boundaries that affect implementation

Describe the SvelteKit application and separate Payload host with their public URLs as owner-supplied values. WorkOS identifies application customers; Payload's built-in auth identifies editors. A CMS editor is not automatically an application administrator. Business records live in Neon/Drizzle; Payload owns its own schema and migration lifecycle. Document separate database/schema ownership rather than giving two migration tools authority over the same tables.

For each cross-service operation record:

- Caller, recipient, authenticated principal and permission checked.
- Input shape, allowed fields, success result and failure result.
- Where durable state is saved, duplicate key and retry/recovery owner.
- Which values can reach a browser, public cache, log or exported file.
- The local code/config reference and any provider behavior still unobserved.

Example: “Member downloads invoice attachment” points to a protected SvelteKit endpoint, verified WorkOS organization membership, a Neon query constrained by that organization and an opaque R2 key. A presigned URL alone is not proof the first three steps happened.

## Keep changes small

When a decision changes, update its current statement and the affected task, then retain the prior decision as superseded with its reason. Do not mark a proposal accepted because code resembles it. If the implementation and brief disagree, report the concrete contradiction and the decision needed; avoid rewriting the brief to excuse the implementation.

Close a task with changed paths and actual check results. Source, compiled behavior, browser observations and provider results remain distinct. A local mock helps explain the boundary but cannot establish live delivery, isolation or payment state. Do not maintain an additional provenance ledger for ordinary product work.
