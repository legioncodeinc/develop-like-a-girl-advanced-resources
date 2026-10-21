// SvelteKit 2 contract illustration for the existing notes route.
// PageData is generated from that route's server load, which returns { notes }.
import type { PageData } from './$types';
export type NotesView = Readonly<{ notes: ReadonlyArray<{ id: string; title: string }> }>;
export function notesCount(data: PageData): number {
  return data.notes.length;
}
// Types do not authenticate the request or remove private runtime fields.
// The actual server load must authorize and project id/title before returning.
