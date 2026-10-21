# Official sources

Checked 2026-10-21 for the updated recipes. Inspect installed compatible versions before coding.

- [payloadcms.com overview](https://payloadcms.com/docs/access-control/overview)
- [payloadcms.com drafts](https://payloadcms.com/docs/versions/drafts)
- [payloadcms.com storage-adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [payloadcms.com overview](https://payloadcms.com/docs/local-api/overview)

Payload uses native `_status` and operation-level access. Local API can bypass access unless overrideAccess is false. R2 on a Node/Vercel host uses the S3 adapter; public direct URLs bypass file access and are unsuitable for private media. Apply only the sources relevant to this capability. These sources document APIs, not successful execution in this kit.

- [Payload collection access, including version history](https://payloadcms.com/docs/access-control/collections)
- [Payload field access](https://payloadcms.com/docs/access-control/fields)
- [Payload Postgres adapter](https://payloadcms.com/docs/database/postgres)
- [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions)
- [Svelte head metadata](https://svelte.dev/docs/svelte/svelte-head)

The Postgres adapter documents schemaName as experimental and development push as enabled by default. The kit disables push and requires installed-version confirmation for schema isolation.
