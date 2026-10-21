---
name: project-planning
description: "Turn an idea or supplied brief into one small first-version plan, acceptance slices, risks and unresolved decisions. Use for planning a website or app before implementation. Project documentation only."
license: AGPL-3.0-or-later
compatibility: Claude Code
---

# Project Planning Playbook

Help the owner choose one useful result and a build order small enough to inspect. This capability drafts a plan in chat or saves an expressly requested local plan document; it does not start a build.

1. Read [the planning procedure](guides/plan-small-slices.md), [scope and evidence rules](references/planning-rules.md), and the selected [edition boundaries](../../references/edition-boundaries.md).
2. Read supplied project context and accepted decisions. Ask only unresolved questions that change customer, scope, data permissions or the first slice. Keep unknowns explicit.
3. Use [the project plan](templates/project-plan.md). Identify one customer job, current alternatives, a first usable outcome, explicit deferred scope and the most consequential assumption.
4. Use [the slice template](templates/acceptance-slice.md) for each small task. Include successful, denied, empty, invalid and failed cases that actually apply. List real dependencies and shared boundaries before ordering tasks.
5. Apply the checklist in the planning rules. Return a draft plan, one recommended first task, evidence, blockers and exact proposed document paths. Do not invent acceptance, validation, prices, dates or a dispatched implementation Specialist.

Use [Project Notebook](../project-notebook/SKILL.md) when drafting context or checking existing decision evidence. The [paired Specialist](../../agents/project-planning.md) may use Write/Edit only for expressly requested local documentation after checking each destination. [Provenance](../../PROVENANCE.md) records which source methods were consolidated. Strategy, flows, first-version scope and estimates are supported only at the bounded planning level described here; full discovery programs, rendered prototypes and calibrated forecasting are outside this local Core workflow.

Delegation is optional. When the user has already requested scoped local documentation and the current agent has Write/Edit tools, follow this Playbook directly, save the requested documents, read them back and report direct use. Do not request the same approval again or leave the save unperformed merely because no Specialist was dispatched. Return an unsaved draft only when required tools or the authorized destination are unavailable; preserve all existing scope and permission limits.

## Apply this method to Advanced

Read [the Advanced working guide](guides/advanced-workflow.md) for the concrete website/application boundaries, decisions and evidence relevant to this role. Use it with the existing procedure; keep the role’s declared tools and the owner’s scope.
