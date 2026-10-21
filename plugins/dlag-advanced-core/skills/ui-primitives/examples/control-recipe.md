# Source-owned control recipe

Inspect the actual local export before use. This illustrative path assumes the project already contains shadcn-svelte Button source:

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  let saving = $state(false);
  let { onSave }: { onSave: () => Promise<void> } = $props();
  let message = $state('');
  async function save() {
    if (saving) return;
    saving = true;
    try { await onSave(); message = 'Saved'; }
    catch { message = 'Could not save. Try again.'; }
    finally { saving = false; }
  }
</script>
<Button type="button" onclick={save} disabled={saving} aria-busy={saving}>
  {saving ? 'Saving...' : 'Save'}
</Button>
<p role="status">{message}</p>
```

The callback still needs a server-authorized mutation. A disabled control prevents accidental clicks and does not enforce permissions or durable idempotency. For native action forms, preserve POST without JavaScript and return server errors next to the field.
