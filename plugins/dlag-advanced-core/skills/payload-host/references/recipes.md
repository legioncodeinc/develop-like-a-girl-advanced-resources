# Payload implementation recipes

## Config and collection skeleton

```ts
import { buildConfig, type Access, type CollectionConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};
const editor: Access = ({ req }) => Boolean(req.user && ['admin', 'editor'].includes(req.user.role));
const admin: Access = ({ req }) => req.user?.role === 'admin';
const publishedOrEditor: Access = ({ req }) =>
  req.user && ['admin', 'editor'].includes(req.user.role)
    ? true : { _status: { equals: 'published' } };
const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: publishedOrEditor, readVersions: editor, create: editor, update: editor, delete: admin },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText' },
  ],
};
// Users, Pages, Media, SiteSettings must be defined with the rules below.
export default buildConfig({
  secret: required('PAYLOAD_SECRET'),
  admin: { user: 'users' },
  editor: lexicalEditor(),
  collections: [Users, Posts, Pages, Media],
  globals: [SiteSettings],
  db: postgresAdapter({ pool: { connectionString: required('PAYLOAD_DATABASE_URI') }, schemaName: 'payload', push: false }),
  cors: [required('PUBLIC_SITE_ORIGIN')],
  csrf: [required('PAYLOAD_ADMIN_ORIGIN')],
  plugins: [s3Storage({
    collections: { media: { disablePayloadAccessControl: false } },
    bucket: required('R2_BUCKET'),
    config: {
      region: 'auto', forcePathStyle: true, endpoint: required('R2_ENDPOINT'),
      credentials: { accessKeyId: required('R2_ACCESS_KEY_ID'), secretAccessKey: required('R2_SECRET_ACCESS_KEY') },
    },
  })],
});
```

This is a configuration sketch. Use the complete [collection module](collections.md) to supply its named collections and global, replacing the inline Posts example. Confirm the installed Postgres adapter supports experimental schemaName; push:false prevents automatic development schema pushes. Confirm generated user types and installed adapter types. `Users` uses `auth: true`; create/delete admin only, read/update self or admin, `role` defaults editor and has admin-only field create/update. Restrict admin-panel admission to editor/admin. `Pages` repeats Posts access and versions with an allowlist of blocks. `SiteSettings` publishes only public brand fields and has admin-only update; never store provider secrets in a public global. `Media` requires editor upload/update, admin delete, quarantine by default, editor-only private read until approved. Public read permits only released assets referenced by published content, checked server-side. Anonymous media IDs or guessed filename paths must not expose draft files or editor attachments.

Do not serve private R2 bytes directly on a public custom domain. The CMS access-checked file proxy must inspect the stored media record and its publication/release relation; return short-lived signed download only after the same check if needed. Configure safe response MIME/disposition and no-store for private files. Keep files outside Vercel ephemeral local storage.

## Preview without URL secrets

The editor starts preview through an authenticated CMS POST with normal Payload CSRF/session checks. Server validates editor role, fixed collection in `posts|pages`, document ID and read access, then stores a cryptographically random one-use nonce hash in Neon with editor ID, document ID, collection, allowed web origin and short expiry. Return an auto-submitting POST form to a fixed SvelteKit preview entry; never put JWT, shared secret or privileged token in a query string, log or returned content JSON.

The SvelteKit entry verifies exact CMS Origin, consumes the nonce atomically through a fixed CMS server endpoint authenticated with a server-only secret header, and creates an opaque HttpOnly Secure SameSite=Lax preview cookie with bounded expiry/scope. The server endpoint verifies one-use/expiry/editor/document, rechecks current editor permission and uses `payload.findByID({ collection, id, draft: true, overrideAccess: false, user: validatedEditor })`. The nonce does not become a general CMS credential. The shared header secret alone never grants draft access. No client collection override, redirect target or remote URL is accepted. Validate the return path against the stored scope; error closed on mismatch.

Preview loader uses that scoped server session, returns only the public-content DTO for this document and sets `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, and noindex. Fetch fixed CMS routes with timeout, redirect error and size/schema limits. Expired/replayed/unknown nonce, missing session, unrelated document and alternate collection fail. Never pass preview cookies to public content/cache fetches. Authorize exit-preview POST, revoke server session and clear cookie. Report preview as NOT_RUN until this complete two-host handshake is exercised.
