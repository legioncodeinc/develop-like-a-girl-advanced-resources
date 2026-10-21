# UI Components procedure

1. Inspect components.json, copied component source, package versions, aliases and existing tokens. shadcn-svelte copies source into the project; record its upstream version/URL and local customizations. Never overwrite customized source or run a CLI installer without task-specific authorization.
2. Use Svelte 5 components with $props, snippets and event attributes. Preserve the installed Bits UI/shadcn-svelte composition contract rather than guessing from React Radix examples. Check the installed component's docs before supplying bindable props or child snippets.
3. Prefer native buttons, links, inputs and labels. An icon button needs an accessible name and decorative SVGs are hidden from assistive technology. Import only requested installed Svelte icons; avoid dynamic whole-library imports.
4. Choose dialog for a focused task, alert dialog for consequential confirmation and inline feedback for errors requiring action. Maintain accessible title, focus trap, Escape, scroll lock and focus return with the installed primitive. Do not replace it with a visually similar div overlay.
5. Theme through semantic CSS variables via dlag-advanced-core:design-foundation. Preserve hydration-safe initial theme behavior; do not read localStorage/window during SSR. Reuse the installed theme controller instead of adding a parallel preference mechanism.
6. Native SvelteKit form actions are the baseline. Formsnap/Superforms or a table engine is optional only when requested complexity and installed versions warrant it. No React hook, next-themes or React component imports.
7. Inspect keyboard traversal, accessible names, disabled/error/pending states and narrow viewport using dlag-advanced-core:browser-checks. Copied primitives provide behavior foundations, not an accessibility conformance verdict.

Read the [recipe](../examples/control-recipe.md) and fill the [record](../templates/component-record.md) for the requested scope.

## Worked guidance

- [Interaction and dialog recipes](../guides/interaction-recipes.md)
