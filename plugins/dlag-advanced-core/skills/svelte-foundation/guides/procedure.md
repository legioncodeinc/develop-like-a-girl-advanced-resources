# SvelteKit Foundation procedure

1. Inspect package.json, lockfile, adapter and each affected component. Record actual versions and whether the file uses runes or legacy syntax. New components use Svelte 5 runes; migration of unrelated legacy files is a separate task.
2. Keep trusted database, auth and provider code in src/lib/server or .server.ts modules. A +page.server.ts load returns the smallest serializable view model. Never return tokens, connections, sealed sessions or complete provider objects. Authenticated data uses private, no-store responses and no prerendering.
3. Identity is verified in hooks/server helpers and rechecked in every protected load/action/+server handler. A protected parent layout alone is insufficient for mutations or resource requests. Store actor facts in request locals, never module-level mutable user state. Share reactive UI state through component/context instances, with no singleton containing user data during SSR.
4. Use $props for inputs, $state for local editable state, $derived for computed values and onclick-style event attributes. Render children through snippets. Use stable record IDs in keyed each blocks. Do not introduce export let, on: handlers or $: into new runes components. An effect synchronizes an external system and returns cleanup; it does not copy props into derived state.
5. Start forms with native method=POST and named SvelteKit actions. Validate on the server, return fail(400/422, safeData) for field errors and preserve safe input. Never mix default and named actions on one page. Keep the framework origin checks enabled. Optional use:enhance must preserve the no-JavaScript path and standard action result handling.
6. Read the linked route recipe. Its server helpers are application contracts to implement with Identity/Data Foundation, not supplied SDK integrations. Keep browser globals behind browser-only lifecycle code and cancel listeners/timers on teardown.
7. Run only affected compilation and route cases when authorized tools exist. Record actual installed-version results; missing compiler/browser tools remain unproven. Conventional load/actions are the baseline. Remote functions and async/boundary integration need a fresh installed-version docs check and explicit decision; do not silently enable experimental flags.

Read the [recipe](../examples/route-recipe.md) and fill the [record](../templates/route-boundary.md) for the requested scope.

## Worked guidance

- [Component and route patterns](../guides/component-patterns.md)
- [Progressive form with field errors](../examples/enhanced-form.md)
