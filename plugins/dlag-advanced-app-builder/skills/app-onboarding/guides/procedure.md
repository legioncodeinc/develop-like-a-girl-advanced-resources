# Application Onboarding procedure

1. Choose the user's first valuable action and save the linked activation contract. Reuse existing approved goals; avoid a tour before the user can complete the real task.
2. Use dlag-advanced-core:identity for the verified WorkOS actor and dlag-advanced-core:data-foundation for owner-bound saved progress. Derive completion from persisted business facts, not browser flags, cookies or a submitted completed=true value. Never let completing a tour grant permissions or paid access.
3. Render a clear checklist through dlag-advanced-core:svelte-foundation and dlag-advanced-core:ui-primitives. Let users skip or dismiss guidance. Any optional tooltip/dialog needs stable data-tour anchors, labels, keyboard dismissal and focus return. Reuse installed primitives; no React onboarding library or new external tour service by default.
4. Store dismissals separately from business completion. Use $derived for view progress based on server facts; keep any reactive state per component/context, never a shared SSR singleton. Refresh the view after the validated server mutation.
5. Recheck actor segmentation and organization membership server-side on each relevant request. Clear client-only progress on sign-out or organization switch. Analytics and lifecycle mail require a separately selected capability and authorization.
6. Exercise incomplete/completed/dismissed state, other-user isolation, keyboard navigation and sign-out/return. Do not repeat unaffected app cases or report mock identity as real WorkOS evidence.

Read the [recipe](../examples/progress.mjs) and fill the [record](../templates/activation-checklist.md) for the requested scope.

## Worked guidance

- [Activation checklist component](../examples/activation-panel.md)
