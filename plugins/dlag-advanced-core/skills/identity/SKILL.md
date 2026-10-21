---
name: identity
description: "Implement WorkOS app sessions with request-local authorization and separate Payload editor login."
license: AGPL-3.0-or-later
compatibility: Claude Code
---

# Authentication Playbook

Advanced uses Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon with Drizzle, WorkOS app authentication, Doppler secrets, Vercel functions, R2 and transactional Resend. Payload owns CMS operations and its own editor login.

Read [the procedure](guides/procedure.md), [the example](examples/recipe.ts), [the worksheet](templates/worksheet.md) and [official sources](references/official-sources.md). Use the [Specialist](../../agents/identity.md) when available, or apply this procedure directly without claiming dispatch.

For implementation, read [wire login, refresh and logout](guides/workos-session-flow.md).

Inspect the existing project first, preserve unrelated work and build only the requested local slice. Read package scripts and lockfiles before choosing syntax. Read [edition boundaries](../../references/edition-boundaries.md). Use explicit namespaced Core handoffs. If Core is missing, stop and name the dependency; never search sibling plugin-cache directories. These methods permit local file authoring and readback, not provider operations, shell execution, credentials, installs, migrations, publishing or deployments. Existing task-specific authorization still governs the operator's actions. Save edited files and read them back. Run only affected existing checks when tools and authorization permit; otherwise give their exact script names and mark them pending. Never repeat unchanged passing checks or invent runtime evidence.
