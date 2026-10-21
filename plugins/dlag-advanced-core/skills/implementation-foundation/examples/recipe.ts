// Adapt in src/routes/notes/+page.server.ts after identity/data wiring.
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createOwnedNote } from '$lib/server/notes';
export const actions = {
  default: async ({ request, locals }) => {
    const actor = locals.principal;
    if (!actor) return fail(401, { message: 'Sign in first.' });
    const form = await request.formData(); // Route must bound request bytes first.
    const title = form.get('title');
    if (typeof title !== 'string' || !title.trim() || title.length > 120)
      return fail(422, { message: 'Use a title of 1 to 120 characters.' });
    // createOwnedNote derives owner from this verified principal, never the form.
    const note = await createOwnedNote(actor, { title: title.trim() });
    return { saved: true, id: note.id };
  }
} satisfies Actions;
