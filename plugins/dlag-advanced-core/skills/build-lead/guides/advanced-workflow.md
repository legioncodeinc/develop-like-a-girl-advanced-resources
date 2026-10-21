# Route Advanced work to a useful result

Load the local [available roster](../../../references/available-capabilities.md). Select the task's primary Playbook, then only the methods it needs. Existing approval for local authoring carries into the selected implementation role; do not ask the owner to repeat it after each handoff.

| Owner outcome | Primary route | Supporting boundaries |
| --- | --- | --- |
| Website or blog | `dlag-advanced-website-builder:website-builder` | Svelte, design, Payload host, public content and optional lead persistence |
| Signed-in application | `dlag-advanced-app-builder:app-builder` | WorkOS, Neon, Svelte, UI and the first record journey |
| Data screen or search | `dlag-advanced-app-builder:app-data-ui` or `dlag-advanced-app-builder:app-search` | Auth scope and bounded queries before UI state |
| External integration | `dlag-advanced-app-builder:app-integrations` | Credentials, transport bounds, idempotency and webhook ownership |
| Payment feature | `dlag-advanced-app-builder:stripe-payments` | Explicitly requested custom checkout and verified server state |
| CMS editor/content | `dlag-advanced-core:payload-host` | Separate host, editor identity, collection access and media records |

Check availability through namespaced Skill calls. Website and App Builder require Core; neither can be found by guessing a sibling plugin cache path. If dispatch is unavailable, an authorized caller can load the same Playbook directly. Report direct use honestly.

Build one complete flow before broadening it. UI and backend tasks may run in parallel when their request/response/error and ownership contracts are agreed. Assign shared files once. Review concrete output, not a worker's completion claim. Integrate the changes before one applicable Security then Quality review, followed by the coordinator's repository review. Do not review every draft independently unless a real risk or dependency requires it.

A missing provider credential does not block independent local source work, but it does leave live provider evidence pending. A missing accepted auth/data contract blocks dependent implementation. Distinguish those cases and ask only the decision that matters. Build Lead coordinates through its read-only tools; it never claims to run a build, edit code or publish itself.
