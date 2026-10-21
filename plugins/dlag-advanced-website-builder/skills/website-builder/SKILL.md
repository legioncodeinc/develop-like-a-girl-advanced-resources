---
name: website-builder
description: "Build Advanced SvelteKit websites with Payload editor content and bounded lead capture."
license: AGPL-3.0-or-later
compatibility: Claude Code
---

# Website Builder Playbook

Build Advanced SvelteKit websites with Payload editor content and bounded lead capture.

1. Read the [implementation procedure](guides/workflow.md), [published-page recipe](guides/published-page.md), [lead capture](guides/lead-capture.md) and [preview/cache recipes](references/recipes.md) and [local acceptance example](examples/local-proof.md).
2. Complete the [delivery record](templates/delivery-record.md) from accepted project requirements and installed versions.
3. Load required Core Playbooks by exact Skill name: `dlag-advanced-core:project-planning`, `dlag-advanced-core:design-foundation`, `dlag-advanced-core:browser-checks`, `dlag-advanced-core:svelte-foundation`, `dlag-advanced-core:payload-host`, `dlag-advanced-core:data-foundation`, `dlag-advanced-core:identity`, `dlag-advanced-core:secrets`, `dlag-advanced-core:vercel-platform`, `dlag-advanced-core:r2-storage`, `dlag-advanced-core:resend-transactional`. Missing prerequisites must be reported; never resolve another plugin through sibling cache paths.
4. Implement one requested local slice, read it back and report observed checks and pending proof.

Read existing destinations and preserve unrelated work. Write/Edit only the requested local project slice and placeholder wiring. No shell, installs, credentials, provider calls, migrations, account changes, real sends or charges, deployment, commit or push. Any such operation needs its own user authorization. Distinguish saved guidance, compiled application, mock behavior, real SDK behavior and live provider proof.

Read the [edition boundaries](../../references/edition-boundaries.md). The [paired Specialist](../../agents/website-builder.md) follows the same scope. If delegation is unavailable, use this Playbook directly and say so.
