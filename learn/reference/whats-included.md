<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../assets/brand/dlag-signature-on-dark-1200.png">
  <img src="../../assets/brand/dlag-signature-on-light-1200.png" alt="Develop Like a Girl" width="210">
</picture>

**THE BUILD STUDIO · ADVANCED KIT**

# What is included

The Advanced Kit contains three independently installable plugins. Core is required by either builder. Each listed Playbook has a paired Specialist and supporting resources in this repository.

| Plugin | Playbooks | Specialists | Public commands |
| --- | --- | --- | --- |
| Core | 24 | 24 | 10 |
| Website Builder | 1 | 1 | 1 |
| App Builder | 6 | 6 | 3 |
| **Total** | **31** | **31** | **14** |

## Core

| Playbook | What it covers |
| --- | --- |
| [Asset Delivery](../../plugins/dlag-advanced-core/skills/asset-delivery/SKILL.md) | Improve responsive images, fonts, and visual stability. |
| [Browser Checks](../../plugins/dlag-advanced-core/skills/browser-checks/SKILL.md) | Check browser behavior, mobile layouts, and accessibility. |
| [Build Lead](../../plugins/dlag-advanced-core/skills/build-lead/SKILL.md) | Scope work and hand it to an available owner. |
| [Data Foundation](../../plugins/dlag-advanced-core/skills/data-foundation/SKILL.md) | Design records, indexes, ownership, and local migration drafts. |
| [Dependency Review](../../plugins/dlag-advanced-core/skills/dependency-review/SKILL.md) | Review manifests, lockfiles, and supplied vulnerability evidence. |
| [Design Foundation](../../plugins/dlag-advanced-core/skills/design-foundation/SKILL.md) | Apply a focused visual direction and reusable design tokens. |
| [Github Workflow](../../plugins/dlag-advanced-core/skills/github-workflow/SKILL.md) | Understand repository changes and safe Git workflows. |
| [Identity](../../plugins/dlag-advanced-core/skills/identity/SKILL.md) | Implement app sessions, authentication, and server authorization. |
| [Implementation Foundation](../../plugins/dlag-advanced-core/skills/implementation-foundation/SKILL.md) | Apply TypeScript, input validation, and server request boundaries. |
| [Payload Host](../../plugins/dlag-advanced-core/skills/payload-host/SKILL.md) | Build the separate Payload CMS, editor access, and publishing flow. |
| [Project Notebook](../../plugins/dlag-advanced-core/skills/project-notebook/SKILL.md) | Keep context, decisions, and documentation grounded in the project. |
| [Project Planning](../../plugins/dlag-advanced-core/skills/project-planning/SKILL.md) | Define scope, acceptance checks, dependencies, and a useful first version. |
| [Project Setup](../../plugins/dlag-advanced-core/skills/project-setup/SKILL.md) | Inspect an existing or empty project and propose its next step. |
| [Quality Review](../../plugins/dlag-advanced-core/skills/quality-review/SKILL.md) | Compare the implementation and check results with the accepted brief. |
| [R2 Storage](../../plugins/dlag-advanced-core/skills/r2-storage/SKILL.md) | Authorize private file uploads and downloads. |
| [Ready Check](../../plugins/dlag-advanced-core/skills/ready-check/SKILL.md) | Combine reviews and evidence into a scoped readiness assessment. |
| [Resend Transactional](../../plugins/dlag-advanced-core/skills/resend-transactional/SKILL.md) | Prepare transactional messages and reliable delivery boundaries. |
| [Secrets](../../plugins/dlag-advanced-core/skills/secrets/SKILL.md) | Keep private values and environment boundaries out of client code. |
| [Security Review](../../plugins/dlag-advanced-core/skills/security-review/SKILL.md) | Review authorization, secrets, injection, uploads, and other relevant risks. |
| [Session Protocol](../../plugins/dlag-advanced-core/skills/session-protocol/SKILL.md) | Carry goals, decisions, and evidence across work sessions. |
| [Svelte Foundation](../../plugins/dlag-advanced-core/skills/svelte-foundation/SKILL.md) | Build with Svelte 5 and SvelteKit server loads and actions. |
| [Technical Explainer](../../plugins/dlag-advanced-core/skills/technical-explainer/SKILL.md) | Explain code, errors, and unfamiliar technical material. |
| [Ui Primitives](../../plugins/dlag-advanced-core/skills/ui-primitives/SKILL.md) | Build accessible controls, dialogs, feedback, and theme behavior. |
| [Vercel Platform](../../plugins/dlag-advanced-core/skills/vercel-platform/SKILL.md) | Prepare SvelteKit Node functions and deployment boundaries. |

## Website Builder

| Playbook | What it covers |
| --- | --- |
| [Website Builder](../../plugins/dlag-advanced-website-builder/skills/website-builder/SKILL.md) | Build public pages, content, lead capture, and their states. |

## App Builder

| Playbook | What it covers |
| --- | --- |
| [App Builder](../../plugins/dlag-advanced-app-builder/skills/app-builder/SKILL.md) | Build one signed-in product flow with owned records. |
| [App Data Ui](../../plugins/dlag-advanced-app-builder/skills/app-data-ui/SKILL.md) | Build data screens, tables, and import/export boundaries. |
| [App Integrations](../../plugins/dlag-advanced-app-builder/skills/app-integrations/SKILL.md) | Define and implement one provider operation safely. |
| [App Onboarding](../../plugins/dlag-advanced-app-builder/skills/app-onboarding/SKILL.md) | Build onboarding and meaningful activation steps. |
| [App Search](../../plugins/dlag-advanced-app-builder/skills/app-search/SKILL.md) | Implement search over an agreed source with access controls. |
| [Stripe Payments](../../plugins/dlag-advanced-app-builder/skills/stripe-payments/SKILL.md) | Prepare optional custom Stripe Elements payment flows. |

## How the files fit together

Each plugin keeps Playbooks in `skills/`, Specialist roles in `agents/`, public entry points in `commands/`, and shared context in `references/`. The human guides you are reading live in `learn/`. Open a Playbook to reach its procedures, templates, examples, and deeper resources.

The current release targets Claude Code. Marketing and Business Tools are not included. Providers, account setup, hosting, and usage are separate from installing the kit. The [technology stack](technology-stack.md) lists the intended service responsibilities.

Package versions are recorded in each plugin’s `.claude-plugin/plugin.json`. The marketplace’s catalog is `.claude-plugin/marketplace.json`.

---

[Learning hub](../README.md) · [Kit overview](../../README.md)
