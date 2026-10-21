# Svelte component and route patterns

Choose the smallest owner of each value before writing the component.

| Value | Owner | Update |
| --- | --- | --- |
| Verified actor, permissions, rows | Server request and repository | Authorized load/action |
| Search, filters, page | URL | GET form or navigation |
| Derived total, enabled state | `$derived` | Recompute from inputs |
| Unsaved editor input | Component `$state` | User input |
| Shared UI within one screen | Parent props/snippet or per-tree context | Explicit callbacks |
| Persisted completion | Database | Authorized mutation, then reload |

A module may export an immutable formatter or database client. It must not hold a mutable current user, selected organization, form draft or request result. Server requests share module instances. A store created once in a server-imported module has the same problem.

## Components that survive navigation

SvelteKit may reuse a component when `data` changes. `let draft = $state(data.title)` captures the first title and is not an automatic subscription. For a read-only display, use `data.title` directly or `$derived`. For an editor, decide whether navigation discards a draft; key the editor by record ID to deliberately reset it, or show a dirty-state confirmation before navigation. Do not add an effect that overwrites the user's typing whenever a load refreshes.

Keep a small reusable component's contract explicit:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, description, children, actions }: {
    title: string;
    description?: string;
    children: Snippet;
    actions?: Snippet;
  } = $props();
</script>
<section class="space-y-4">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div><h2>{title}</h2>{#if description}<p>{description}</p>{/if}</div>
    {#if actions}<div>{@render actions()}</div>{/if}
  </header>
  {@render children()}
</section>
```

Use a parent callback for an application command, such as `onArchive(id)`. Use `$bindable` only for a deliberate two-way field primitive. A child silently changing a prop object makes ownership unclear. Keep derived expressions free of writes and network calls.

## Loads and failures

Put protected queries in `+page.server.ts`; return explicit display fields. Start independent authorized reads together when the driver allows it, but await authorization before issuing either. A layout may supply navigation, while each endpoint still enforces its own access.

Return `fail(422, { values, errors })` for expected field errors. Use a safe not-found response for an inaccessible record. Let redirect/error control flow propagate; catch only the provider/repository operation whose failure you intend to translate. An error boundary should offer a useful retry or return link, with no raw SQL, token, internal stack or provider payload.

For POST forms use the [enhanced form](../examples/enhanced-form.md). A GET form is appropriate for search. A derived client count describes loaded rows, not an authoritative total unless the server provided that total.

Sources: [state management](https://svelte.dev/docs/kit/state-management), [derived state](https://svelte.dev/docs/svelte/$derived), [snippets](https://svelte.dev/docs/svelte/snippet). Consult the installed SvelteKit 2 documentation when current online docs describe a newer major version.
