# Build one owned data feature

Use this recipe for a per-user notes feature, then substitute the accepted domain names. It targets SvelteKit 2, Drizzle's existing stable Node PostgreSQL integration and Neon. Keep the installed versions; the latest documentation may show release-candidate APIs. The existing HTTP recipe is still appropriate for single statements. Use a transaction-capable driver when the feature needs several dependent statements.

## Server connection and schema

Place the connection in `src/lib/server/db.ts`. This example requires the project's approved `pg` and `drizzle-orm` packages. Do not add a second driver if the project already has a transaction-capable Neon adapter.

```ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
if (!env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});
export const db = drizzle(pool, { schema });
```

Use Neon's configured TLS connection string and pooler endpoint for concurrent runtime work. Do not disable certificate verification. The small pool is a project starting bound, not a universal Vercel setting: account for concurrent function instances and the database connection budget. Reuse a module pool and release acquired clients in `finally`; do not end a shared pool after each request. In ephemeral runtimes that cannot reuse connections, use the documented request-scoped Neon path instead. Keep migrations on the separately approved migration connection.

```ts
// src/lib/server/schema.ts
import { pgTable, uuid, text, integer, timestamp, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  index('notes_owner_created_id_idx').on(t.ownerId, t.createdAt, t.id),
  check('notes_title_length', sql`char_length(${t.title}) between 1 and 160`),
  check('notes_version_positive', sql`${t.version} > 0`)
]);
```

A WorkOS ID is text, not a UUID. An index beginning with owner supports the authorization filter. For organizations replace the owner model with verified membership and organization scoping throughout; do not silently broaden this per-user recipe.

## Read, change and delete with the same boundary

```ts
// src/lib/server/note-store.ts
import { and, eq, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { notes } from './schema';
type Actor = Readonly<{ userId: string }>;
export async function listNotes(actor: Actor) {
  return db.select({ id: notes.id, title: notes.title, version: notes.version })
    .from(notes).where(eq(notes.ownerId, actor.userId))
    .orderBy(desc(notes.createdAt), desc(notes.id)).limit(50);
}
export async function renameNote(actor: Actor, id: string, version: number, title: string) {
  const [row] = await db.update(notes)
    .set({ title, version: sql`${notes.version} + 1` })
    .where(and(eq(notes.id, id), eq(notes.ownerId, actor.userId), eq(notes.version, version)))
    .returning({ id: notes.id, title: notes.title, version: notes.version });
  return row ?? null;
}
export async function deleteNote(actor: Actor, id: string, version: number) {
  const [row] = await db.delete(notes)
    .where(and(eq(notes.id, id), eq(notes.ownerId, actor.userId), eq(notes.version, version)))
    .returning({ id: notes.id });
  return row ?? null;
}
```

The version predicate prevents lost updates. A zero-row result can mean missing, other-owner or stale; return a uniform refusal, or perform a second owner-scoped lookup to distinguish a conflict without revealing another owner's record. Search, counts and exports must carry the same ownership filter. Add keyset pagination if the product needs more than the first 50; never offer unlimited exports through an ordinary page load.

## Form action wiring

```ts
// src/routes/(app)/notes/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listNotes, renameNote } from '$lib/server/note-store';
export const prerender = false;
export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  if (!locals.principal) error(401, 'Sign in required');
  setHeaders({ 'cache-control': 'private, no-store' });
  return { notes: await listNotes(locals.principal) };
};
export const actions = {
  rename: async ({ request, locals }) => {
    if (!locals.principal) error(401, 'Sign in required');
    const form = await request.formData();
    const id = form.get('id');
    const title = form.get('title');
    const rawVersion = form.get('version');
    const version = typeof rawVersion === 'string' ? Number(rawVersion) : NaN;
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      || typeof title !== 'string' || !title.trim() || title.trim().length > 160
      || !Number.isSafeInteger(version) || version < 1) {
      return fail(400, { message: 'Check the note fields.' });
    }
    const row = await renameNote(locals.principal, id, version, title.trim());
    if (!row) return fail(409, { message: 'This note changed or is unavailable. Reload and try again.' });
    return { saved: true, note: row };
  }
} satisfies Actions;
```

Retain SvelteKit's form-origin protection. Set a small request body limit at the deployed request boundary before parsing forms. A hidden owner input is unnecessary. Render `form.message` in an accessible live region; use a normal POST form, adding progressive enhancement only after the non-JavaScript path works.

## Transactions, migrations and proof

Use `db.transaction(async (tx) => { ... })` for a business row plus its notification intent, or lock/read/write fulfillment. Use only `tx` inside the callback and throw on failure so both writes roll back. External APIs run after commit. A unique business-operation key closes concurrent duplicate creation; a prior SELECT does not.

Generate a migration through the existing project script, inspect its SQL and check new required fields against existing rows. For live schemas add nullable/default-compatible fields first, backfill in bounded batches, validate, then enforce constraints in a later change. A rollback that drops newly collected data needs a recovery decision. Never alter an applied migration.

Meaningful project checks: owner A cannot read/change/delete B; unauthenticated action refuses; two writes with one version produce one success; forced second transaction failure leaves no first write; migration applies to the approved disposable schema and existing-data fixture when that operation is authorized. The toolkit includes the method, not a claim that these project checks have run.

Sources checked 2026-10-21: [Drizzle Neon drivers](https://orm.drizzle.team/docs/connect-neon), [transactions](https://orm.drizzle.team/docs/transactions), [Neon connection pooling](https://neon.com/docs/connect/connection-pooling), [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions).
