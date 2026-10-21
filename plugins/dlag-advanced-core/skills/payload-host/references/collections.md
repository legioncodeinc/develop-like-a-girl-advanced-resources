# Payload collections for the separate CMS host

Use these definitions inside the existing version-compatible Payload 3 Next.js host. They form a coherent baseline for the website's text-block page recipe and a Lexical blog. They do not create the host's generated routes, import map, database or first administrator.

## Collection module

`apps/cms/src/collections.ts`:

```ts
import type { Access, CollectionConfig, GlobalConfig } from 'payload';
const isEditor = (user: unknown): boolean => {
  if (!user || typeof user !== 'object' || !('role' in user)) return false;
  return user.role === 'admin' || user.role === 'editor';
};
const isAdmin = (user: unknown): boolean =>
  Boolean(user && typeof user === 'object' && 'role' in user && user.role === 'admin');
const editor: Access = ({ req }) => isEditor(req.user);
const admin: Access = ({ req }) => isAdmin(req.user);
const selfOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true;
  return req.user ? { id: { equals: req.user.id } } : false;
};
const publishedOrEditor: Access = ({ req }) => isEditor(req.user)
  ? true : { _status: { equals: 'published' } };
const validSlug = (value: unknown) => typeof value === 'string' &&
  value.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  ? true : 'Use a lowercase slug with single hyphens, up to 100 characters.';

export const Users: CollectionConfig = {
  slug: 'users', auth: true,
  admin: { useAsTitle: 'email' },
  access: { admin: editor, create: admin, read: selfOrAdmin,
    update: selfOrAdmin, delete: admin, unlock: admin },
  fields: [{ name: 'role', type: 'select', required: true, defaultValue: 'editor',
    options: ['editor', 'admin'],
    access: { create: ({ req }) => isAdmin(req.user), update: ({ req }) => isAdmin(req.user) },
  }],
};
export const Pages: CollectionConfig = {
  slug: 'pages', admin: { useAsTitle: 'title' },
  access: { read: publishedOrEditor, readVersions: editor,
    create: editor, update: editor, delete: admin },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 160 },
    { name: 'slug', type: 'text', required: true, unique: true, validate: validSlug },
    { name: 'description', type: 'textarea', required: true, maxLength: 320 },
    { name: 'sections', type: 'blocks', required: true, minRows: 1, maxRows: 40, blocks: [{
      slug: 'text', fields: [
        { name: 'heading', type: 'text', maxLength: 160 },
        { name: 'body', type: 'textarea', required: true, maxLength: 12000 },
      ],
    }] },
  ],
};
export const Posts: CollectionConfig = {
  slug: 'posts', admin: { useAsTitle: 'title' },
  access: { read: publishedOrEditor, readVersions: editor,
    create: editor, update: editor, delete: admin },
  versions: { drafts: { autosave: true } },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 160 },
    { name: 'slug', type: 'text', required: true, unique: true, validate: validSlug },
    { name: 'description', type: 'textarea', required: true, maxLength: 320 },
    { name: 'content', type: 'richText', required: true },
  ],
};
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: editor, create: editor, update: editor, delete: admin },
  upload: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], disableLocalStorage: true },
  fields: [{ name: 'alt', type: 'text', required: true, maxLength: 300 }],
};
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings', access: { read: () => true, update: admin },
  fields: [
    { name: 'siteName', type: 'text', required: true, maxLength: 120 },
    { name: 'description', type: 'textarea', required: true, maxLength: 320 },
  ],
};
```

Import the five named exports into the [configuration recipe](recipes.md). Remove that recipe's inline Posts definition when integrating this module, so only one collection has each slug. Regenerate Payload types through the project's existing script after authorized schema edits. No editor can grant themselves admin through the role field. The initial administrator is an explicitly authorized bootstrap operation, not an anonymous signup. Check the installed host's first-user behavior and close bootstrap access after provisioning.

The Media baseline is private and intentionally has no public release flag. Public page images require the separate approved-release relation/access rule in the configuration recipe, or a distinct deliberately public media collection; do not change all media to anonymous read for convenience. File byte/dimension limits and scan/release processing are application integration steps, not supplied by MIME allowlisting. Keep private storage and Payload file proxy checks enabled. Drafts can temporarily be incomplete; public DTO validation refuses incomplete published content.

## Host integration

1. Keep the generated Payload Next.js host route group, REST route, admin catch-all, layout and import map from the installed supported Payload template. Do not hand-copy version-specific generated files from an unrelated project.
2. Merge these collections and globals into the existing `buildConfig`, Lexical editor, Postgres adapter and S3 storage adapter. Use `push: false` so opening a development server does not silently push schema changes. `schemaName` is marked experimental by Payload: confirm support in the installed adapter and pin the working version before relying on a dedicated schema. A separate Payload database is an alternative only after an explicit architecture decision.
3. Configure separate Vercel project roots for `apps/web` and `apps/cms`. WorkOS app cookies are never accepted as Payload editor credentials. Restrict CMS CORS to actual consumers; a SvelteKit server-to-server fetch does not need browser CORS permission. CSRF origin trust remains separate from CORS.
4. Keep Payload-generated migration files separate from Drizzle app migrations. Review generated SQL before an authorized migration; deployment does not grant migration permission. Never use a development push against production.
5. Make the public page reader send no authentication. Verify anonymous document reads, version history, generated API access and file bytes separately, including direct `/api/...` access rather than only the dashboard.

Primary reference checks: [collection operations and versions](https://payloadcms.com/docs/access-control/collections), [field access](https://payloadcms.com/docs/access-control/fields), [Postgres adapter options](https://payloadcms.com/docs/database/postgres). These references were read on 2026-10-21; the installed package types determine the supported syntax.
