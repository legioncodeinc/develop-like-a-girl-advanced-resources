# Ux Ui routing

Use **Design Foundation** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain
This Specialist is the steady-state design-system owner and enforcer for the deploying product. It opens the product's source-of-truth design-system folder (tokens, utilities, components, screens) on every UI question, cites the governing section, and specifies pixel-perfect deltas in token-named terms. It governs the selected shadcn-svelte component system and approved icon/motion choices through clear component contracts. Do not add Mantine or another motion library implicitly.

If the current system does not cover the question, identify the missing decision and propose an authorized design-system update before dependent implementation. Do not silently invent or overwrite the product rules.


## Trigger phrases
- "review this UI"
- "is this on-brief?"
- "which component library for X?"
- "wrap this shadcn primitive"
- "motion spec for this transition"
- "update the design brief"
- "token drift audit"

## Do NOT route when
- The task is back-end, data, or asset-registry work: route to `Project Notebook`, `Svelte Foundation`, or `Project Notebook for a provenance note; a universal asset registry is not packaged`.
- Building a new system uses Design Foundation's bootstrapping mode instead of this existing-system enforcement mode.
- A new aesthetic, library migration or major token restructure needs an approved Design Foundation direction before this enforcement mode applies it.
- The task is a Svelte component's implementation logic with no visual delta at stake: route to `Svelte Foundation`.

## Inputs the Specialist needs
- The product's design-system folder path and which section governs the question at hand
- The exact file and line range of the code under review
- Which selected shadcn-svelte components and approved icon/motion primitives are in play
- Any product-specific non-negotiables documented in that product's own knowledge-base folder
- Whether the change is a component-level delta or a system-level change, to route the latter correctly

## Outputs
- A cited review with `path:startLine-endLine` references and a proposed delta in token-named terms, using the current owner's local Playbook
- A new or updated component or screen spec in `03-components/` or `04-screens/`
- A library-wrapper component (Button, Icon, Motion) mapping the library's API to the product's tokens
- A UX review report filed under the relevant feature, issue, or standalone accessibility audit path

## Commonly sequenced with
- Design Foundation's direction mode: resolves approved system changes before existing-system enforcement continues
- `Svelte Foundation`: implements the component code this Specialist specifies
- Project Notebook: records provenance and decisions; a universal asset registry is not packaged
- Svelte Foundation: preserve component event/ref/state behavior while applying the current design system. Framework-port work is outside Advanced.

Ambiguous invocations (unclear product, folder, or library) get one clarifying question rather than a silent guess.


## Product-system Svelte primitives and mobile flow contracts

Intake requires actual product-system/context/token/user-task/layout sources; missing inputs stay unknown. Source family/provenance, ref/event/semantic behavior and state acceptance precede a primitive recommendation. Mobile acceptance includes task priority, navigation, density, touch, keyboard, safe areas, reflow and focus/state continuity with actual device/manual/automation proof. These contracts route actual UI design/build/refinement through Design Foundation and relevant framework/available runtime owners. A worksheet or screenshot is not proof of task completion or accessibility.
