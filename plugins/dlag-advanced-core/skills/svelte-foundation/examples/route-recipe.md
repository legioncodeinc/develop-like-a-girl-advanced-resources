# Protected action recipe

Application integration recipe. Supply requireActor and owner-scoped repository helpers through Identity and Data Foundation before compilation. Do not place this recipe in a global shared-user store.

```ts
// src/routes/records/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireActor } from '$lib/server/identity';
import { listRecords, createRecord } from '$lib/server/records';
export const prerender = false;
export const load: PageServerLoad = async (event) => {
  const actor = await requireActor(event);
  event.setHeaders({ 'cache-control': 'private, no-store' });
  return { records: await listRecords(actor) };
};
export const actions = {
  create: async (event) => {
    const actor = await requireActor(event);
    // Enforce the route's actual-byte request limit before parsing.
    const body = await event.request.formData();
    if ([...body.keys()].some(key => key !== 'title')) return fail(400, { message: 'Unexpected field' });
    const titles = body.getAll('title');
    if (titles.length !== 1 || typeof titles[0] !== 'string')
      return fail(400, { message: 'Submit one title' });
    const title = titles[0].trim();
    if (!title || title.length > 120) return fail(422, { title, message: 'Use 1 to 120 characters' });
    await createRecord(actor, { title });
    return { saved: true };
  }
} satisfies Actions;
```

```svelte
<!-- src/routes/records/+page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
  let count = $derived(data.records.length);
</script>
<h1>Records</h1>
<p>{count} records on this page</p>
<form method="POST" action="?/create">
  <label>Title <input name="title" required maxlength="120" value={form?.title ?? ''} /></label>
  <button>Save record</button>
</form>
{#if form?.message}<p role="alert">{form.message}</p>{/if}
{#if form?.saved}<p role="status">Record saved</p>{/if}
<ul>{#each data.records as record (record.id)}<li>{record.title}</li>{/each}</ul>
```

The actor comes from a verified WorkOS session, not submitted ownership fields. Every helper constrains actor ownership before reads/counts or writes. SQL credentials stay server-only. Duplicate-submit handling must be added at the mutation contract when the operation can repeat consequential effects.
