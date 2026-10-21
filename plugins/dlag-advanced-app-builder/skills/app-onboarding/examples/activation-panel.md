# A small activation checklist

Derive progress from persisted, owner-scoped business facts in the server load, using the packaged `activationProgress` helper. Map step IDs to fixed application routes. Never accept a submitted destination or `complete=true` as proof of activation. This component uses local approved routes and normal links, so it works without JavaScript.

```svelte
<script lang="ts">
  let { data }: { data: {
    onboardingDismissed: boolean;
    progress: { completed: number; total: number;
      steps: { id: string; label: string; complete: boolean }[] };
  } } = $props();
  const destinations: Record<string, string> = {
    profile: '/settings/profile', record: '/records/new'
  };
  let remaining = $derived(data.progress.total - data.progress.completed);
</script>
{#if !data.onboardingDismissed && remaining > 0}
  <section aria-labelledby="activation-heading">
    <h2 id="activation-heading">Get started</h2>
    <p>{data.progress.completed} of {data.progress.total} steps complete</p>
    <ol>{#each data.progress.steps as step (step.id)}
      <li>
        {#if step.complete}<span>{step.label}: complete</span>
        {:else if destinations[step.id]}<a href={destinations[step.id]}>{step.label}</a>
        {:else}<span>{step.label}</span>{/if}
      </li>
    {/each}</ol>
    <form method="POST" action="?/dismissOnboarding">
      <button type="submit">Hide this checklist</button>
    </form>
  </section>
{/if}
```

The named dismissal action verifies the actor and records a dismissal for that actor and workspace only. It does not mark the steps complete. Add a “Show getting-started checklist” preference if guidance can be hidden. Use an explicit onboarding version if a later product change needs new guidance; do not repeatedly reset dismissal on every visit.

On a successful profile save or record create, normal SvelteKit action invalidation/redirect refreshes persisted facts. Derive completion from a bounded existence/count query, not loading all records into memory. If the first record is later deleted, decide whether activation means “ever created” or “currently has a record” and implement that business rule consistently. The helper's current count-based meaning is the latter.

## When a tour is justified

Prefer the checklist and real route when the task is obvious. Add a short tour only when the user must locate an unfamiliar control. Anchor to a stable `data-tour` attribute, skip absent or forbidden steps, let the user dismiss it, restore focus and avoid announcing on every navigation. Recheck anchors when the affected surface changes. A tour cannot replace labels, help text or access control.

Validate new user, returning user, complete user, dismissed user and organization switch. The completion view must not show another actor's facts during SSR or client navigation. Optional analytics require the selected analytics contract; onboarding itself should not send email or start a paid service.

Sources: [Svelte derived state](https://svelte.dev/docs/svelte/$derived), [SvelteKit state management](https://svelte.dev/docs/kit/state-management), [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions).
