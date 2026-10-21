# Progressive form with field errors

Integrate this page with a named `save` action. The action returns safe values and an `errors.title` string on validation failure, or `{ saved: true }` after the authorized write. It must bound request bytes, require exactly one string `title`, and bind ownership to the verified session. This view adds pending feedback while retaining native POST.

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  let { form }: { form?: {
    values?: { title: string };
    errors?: { title?: string };
    saved?: boolean;
  } | null } = $props();
  let pending = $state(false);
</script>
<form method="POST" action="?/save" use:enhance={() => {
  pending = true;
  return async ({ update }) => {
    try { await update(); } finally { pending = false; }
  };
}}>
  <label for="record-title">Title</label>
  <input id="record-title" name="title" required maxlength="120"
    value={form?.values?.title ?? ''}
    aria-invalid={form?.errors?.title ? 'true' : undefined}
    aria-describedby={form?.errors?.title ? 'title-error' : 'title-hint'} />
  <p id="title-hint">A short name you will recognize in the record list.</p>
  {#if form?.errors?.title}<p id="title-error">{form.errors.title}</p>{/if}
  <button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
  <p role="status">{pending ? 'Saving your record' : form?.saved ? 'Record saved' : ''}</p>
</form>
```

`update()` keeps the framework's action-result handling, invalidation, reset and redirect behavior. Do not swallow its errors or replace the default behavior with an optimistic success message. The example deliberately uses a same-page action. Cross-page custom submission needs the installed version's `applyAction` contract. A disabled button is a convenience, not durable duplicate-effect prevention. Confirm errors are announced and the next correction target is reachable with a keyboard; add an error-summary focus pattern for long forms.

Source: [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions).
