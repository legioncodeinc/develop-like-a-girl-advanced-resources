// src/lib/server/notes.ts. Illustrative module; wire db to the selected installed driver.
import { and, eq } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { db } from '$lib/server/db';
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull()
});
type Principal = Readonly<{ userId: string }>;
export type Note = typeof notes.$inferSelect;
export async function createOwnedNote(actor: Principal, input: { title: string }) {
  const [row] = await db.insert(notes).values({ ownerId: actor.userId, title: input.title })
    .returning({ id: notes.id });
  if (!row) throw new Error('Note creation failed');
  return row;
}
export async function renameOwnedNote(actor: Principal, id: string, title: string) {
  // Validate UUID/title at the route. Both predicates belong in the UPDATE itself.
  const [row] = await db.update(notes).set({ title })
    .where(and(eq(notes.id, id), eq(notes.ownerId, actor.userId)))
    .returning({ id: notes.id, title: notes.title });
  return row ?? null; // Caller maps absent/other-owner uniformly to 404.
}
