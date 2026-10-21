# Design Foundation procedure

1. Read the task, existing design decisions and target audience. Preserve the approved direction during polish. For a new surface save the linked brief with task, primary action, content hierarchy and visual intent.
2. Define semantic foreground/background/action/error/focus tokens, spacing, radius, readable type and reduced-motion rules. Use existing licensed assets. Map CSS variables through top-level Tailwind v4 @theme inline; reuse the installed Vite integration and do not introduce a v3 config into a v4 project.
3. Use the approved shadcn-svelte components through dlag-advanced-core:ui-primitives. Keep complete utility class strings visible to the scanner. Runes and form mechanics belong to dlag-advanced-core:svelte-foundation. No React wrappers or copied OSPRY brand tokens.
4. Build one complete task flow with heading, clear primary action, real labels, visible focus and useful empty/error/pending/success states. Let grids collapse with long real content. Keep body text readable at zoom; reserve bounded clamp sizes for display text. Use motion sparingly and honor prefers-reduced-motion.
5. Document component states and source locations. For a new system expand into tokens, component/screen notes and examples only as needed; no fixed component count or minimum document length.
6. Use dlag-advanced-core:browser-checks for narrow/desktop, keyboard, long text, zoom, requested themes and reduced motion. Missing browser access means unexecuted checks. This is an adapted design procedure; it does not install or run the full Impeccable engine or its detector and cannot claim its certification.

Read the [recipe](../examples/token-bridge.css) and fill the [record](../templates/design-brief.md) for the requested scope.

## Worked guidance

- [Surface design](../guides/surface-design.md)
- [Server-rendered theme and tokens](../guides/theme-and-tokens.md)
