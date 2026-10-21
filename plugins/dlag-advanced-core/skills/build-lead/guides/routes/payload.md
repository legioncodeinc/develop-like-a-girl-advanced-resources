# Separate Payload CMS and Next.js host

Use **Payload Host** through its registered Advanced Playbook. Check [scope and tools](../scope-and-tools.md) before work. Build Lead remains read-only. A proposed route is not dispatch or execution.

## Complete the bounded method

Identify collections/globals, published/draft state, access predicates, media operations, editor authentication and content API shape. Keep service tokens server-only, bind preview to an accepted narrow contract and define publication/cache invalidation failures. Inspect React/Next behavior only inside this host.

## Ownership and negative routing

Payload built-in authentication owns CMS editors. WorkOS owns customer application identity; neither session grants the other domain access. Website Builder renders public content in SvelteKit; App Builder owns customer journeys; R2 Storage qualifies approved object handling. General Next.js application builds are unavailable.

## Inputs, artifacts and proof

Supply Payload/Next/React versions, collection and access source, accepted content consumer/preview contract, media policy and exact owned paths. Return host code or findings, collection-access/draft-leakage/media checks and pending provider/runtime evidence. No editor account or hosted project is created by routing.

Preserve the owner's exact scope, existing approvals, path ownership and deadline. Inspect the selected Playbook before authoring APIs. Security Review precedes independent Quality Review after fixes; the coordinator applies GitHub Workflow to the final candidate.
