# Build the first record journey

Use this recipe for a personal notes or projects application, adapting names to the accepted brief. Organization sharing is a different authorization policy: obtain verified membership and permissions through `dlag-advanced-core:identity` before changing the owner predicate. Do not assume that a WorkOS organization ID means every member may edit every record.

## Files and boundary contracts

| File | Responsibility |
| --- | --- |
| `src/hooks.server.ts` | Identity Playbook verifies the WorkOS session on every request, refreshes when appropriate and assigns `locals.principal`. |
| `src/app.d.ts` | Reuse Identity's App.Locals declaration and its Principal type imported from `$lib/server/workos`; do not redeclare a competing interface. The query layer consumes only userId. |
| `src/lib/server/db.ts` | Data Foundation supplies the selected Neon/Drizzle client. Secrets never leave server modules. |
| `src/lib/server/schema.ts` | Application-owned table below; keep it outside Payload's schema/migration ownership. |
| `src/lib/server/notes.ts` | Scoped queries below; callers cannot substitute owner IDs. |
| `src/routes/(app)/notes/+page.server.ts` | Authenticated list and create/rename actions. |
| `src/routes/(app)/notes/+page.svelte` | Accessible ordinary forms with optional progressive enhancement. |

The example assumes the repository already has the approved dependencies. It supplies source recipes, not permission to install, migrate, create provider accounts or deploy. Ask Data Foundation to integrate the schema into the existing migration stream; ask Identity to implement its session contract first. Do not fabricate a principal to make the routes run.

## Table and scoped queries

`src/lib/server/schema.ts`:

```ts
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

`src/lib/server/notes.ts`:

```ts
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/schema';
import type { Principal } from '$lib/server/workos';
type Actor = Pick<Principal, 'userId'>;
const publicFields = { id: notes.id, title: notes.title };
export function listNotes(actor: Actor) {
  return db.select(publicFields).from(notes)
    .where(eq(notes.ownerId, actor.userId))
    .orderBy(desc(notes.createdAt), desc(notes.id)).limit(50);
}
export async function createNote(actor: Actor, title: string) {
  const [created] = await db.insert(notes).values({ ownerId: actor.userId, title })
    .returning(publicFields);
  if (!created) throw new Error('Create did not return a record');
  return created;
}
export async function renameNote(actor: Actor, id: string, title: string) {
  const [updated] = await db.update(notes).set({ title })
    .where(and(eq(notes.id, id), eq(notes.ownerId, actor.userId)))
    .returning(publicFields);
  return updated ?? null;
}
```

The first page deliberately caps at 50 rows and says so. Add an owner-scoped cursor through `dlag-advanced-app-builder:app-data-ui` when required; do not claim the cap is full pagination. Data Foundation adds an owner/order index once the actual list query is agreed. Create is not automatically idempotent: use a unique actor/operation key and stored input digest if the product requires replay-safe creation. Never deduplicate unrelated notes solely because their titles match.

## Bounded form reader

`src/lib/server/note-form.ts` handles the normal URL-encoded form and the multipart form used by enhancement. It is a form-specific implementation of Core Implementation Foundation's `guides/request-and-response.md` streamed-byte method. Read that resource through `dlag-advanced-core:implementation-foundation`; do not import files from another plugin cache at application runtime.

```ts
import { error } from '@sveltejs/kit';
export async function readNoteFields(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^(application\/x-www-form-urlencoded|multipart\/form-data)(?:;|$)/i.test(contentType))
    error(415, 'Unsupported form format');
  const reader = request.body?.getReader();
  if (!reader) error(400, 'Missing form');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) {
        await reader.cancel().catch(() => {});
        error(413, 'Form is too large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let data: FormData;
  try { data = await new Response(bytes, { headers: { 'content-type': contentType } }).formData(); }
  catch { error(400, 'Invalid form'); }
  for (const key of data.keys()) if (key !== 'title' && key !== 'id') error(400, 'Unexpected field');
  if (data.getAll('title').length !== 1 || data.getAll('id').length > 1) error(400, 'Invalid fields');
  const title = data.get('title');
  const id = data.get('id');
  if (typeof title !== 'string' || (id !== null && typeof id !== 'string')) error(400, 'Invalid field type');
  return { title: title.trim(), id: id ?? '' };
}
```

Keep the Vercel/request timeout bounded as well; a byte limit does not stop a stalled connection. The helper rejects files and repeated scalar fields. Do not install a multipart library for this small no-upload form. File uploads use the separate R2 flow.

## Server route

`src/routes/(app)/notes/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createNote, listNotes, renameNote } from '$lib/server/notes';
import { readNoteFields } from '$lib/server/note-form';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function actor(locals: App.Locals) {
  if (!locals.principal) redirect(303, '/auth/login');
  return locals.principal;
}
export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  return { notes: await listNotes(actor(locals)) };
};
export const actions = {
  create: async ({ locals, request, setHeaders }) => {
    setHeaders({ 'cache-control': 'private, no-store' });
    const principal = actor(locals);
    const { title } = await readNoteFields(request);
    if (!title || title.length > 160) return fail(400, { message: 'Enter a title of 1 to 160 characters.' });
    await createNote(principal, title);
    redirect(303, '/notes');
  },
  rename: async ({ locals, request, setHeaders }) => {
    setHeaders({ 'cache-control': 'private, no-store' });
    const principal = actor(locals);
    const { id, title } = await readNoteFields(request);
    if (!uuid.test(id) || !title || title.length > 160)
      return fail(400, { message: 'Check the record and title.' });
    if (!await renameNote(principal, id, title)) error(404, 'Record not found');
    redirect(303, '/notes');
  },
} satisfies Actions;
```

Leave SvelteKit's origin checks enabled and add the product's abuse limits using `dlag-advanced-core:implementation-foundation`. The route validates independently of the browser. Never wrap redirects in a broad catch that converts them into failures. Use a safe `+error.svelte` for unexpected database/authentication outages. Do not return SDK exceptions or database errors to users.

## Post-login landing route

Identity returns successful login to `/app`. Connect that fixed route to this record journey with `src/routes/app/+page.server.ts` (or the equivalent `/app` path under the existing route group):

```ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  if (!locals.principal) redirect(303, '/auth/login');
  redirect(303, '/notes');
};
```

Retain the existing `/app` dashboard if one already serves the accepted product; add its link to `/notes` instead of overwriting it. The redirect is the complete landing implementation for a new first-record journey. `/notes` still checks its own actor on each load and action.

## Svelte 5 form surface

`src/routes/(app)/notes/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>
<svelte:head><title>Your notes</title><meta name="robots" content="noindex" /></svelte:head>
<h1>Your notes</h1>
{#if form?.message}<p role="alert">{form.message}</p>{/if}
<form method="POST" action="?/create" use:enhance>
  <label for="new-title">New note title</label>
  <input id="new-title" name="title" required maxlength="160" />
  <button type="submit">Create note</button>
</form>
{#if data.notes.length === 0}<p>You have no notes yet. Create your first note above.</p>{/if}
<ul>
  {#each data.notes as note (note.id)}
    <li>
      <form method="POST" action="?/rename" use:enhance>
        <input type="hidden" name="id" value={note.id} />
        <label for={`title-${note.id}`}>Note title</label>
        <input id={`title-${note.id}`} name="title" value={note.title} required maxlength="160" />
        <button type="submit">Save title</button>
      </form>
    </li>
  {/each}
</ul>
{#if data.notes.length === 50}<p>Showing your 50 newest notes.</p>{/if}
```

Apply the repository's Tailwind/shadcn-svelte wrappers without weakening label, form or focus behavior. Test ordinary form submission with JavaScript disabled, then enhancement, signed-out access, another actor's guessed ID and database failure. Use Identity's `/auth/login`, `/auth/callback` and POST `/auth/logout` flow. The landing route above connects its fixed post-login `/app` destination to `/notes`. Add sign-in/logout through Identity; upload/download through R2 Storage; payments through `dlag-advanced-app-builder:stripe-payments` only when selected. The logout action revokes/clears the session according to Identity's contract and redirects to a public route.

Source API checks: [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions), [Drizzle inserts](https://orm.drizzle.team/docs/insert). Recipes target the edition's SvelteKit 2 and Svelte 5. Newer documentation does not silently authorize a framework-major upgrade.
