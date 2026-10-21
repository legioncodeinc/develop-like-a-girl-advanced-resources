# Tailwind routing

Use **Design Foundation** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain
Design Foundation applies Tailwind CSS v4 mechanics within the selected product: CSS-first configuration, `@theme` mechanics and namespace-to-utility generation, the full directive/function set (`@utility`, `@variant`, `@custom-variant`, `@apply`, `@reference`, `@source`), the `@tailwindcss/vite` plugin, v3-to-v4 migration, dark mode variants, container queries, arbitrary values, class ordering, and Oxide-engine performance. It explains `@theme` as a mechanism and preserves the product's accepted token values; a framework recipe does not invent a brand decision.


## Trigger phrases
- "should this app use Tailwind and shadcn"
- "migrate to Tailwind v4"
- "set up @theme"
- "wire up the Tailwind Vite plugin"
- "why isn't dark mode working after the v4 upgrade"
- "container query this component"
- "sort my Tailwind classes"
- "should this repeated arbitrary value be a token"

## Do NOT route when
- Svelte runes/component behavior goes to Svelte Foundation; Design Foundation owns Tailwind tokens and layout rules.
- UI Primitives owns shadcn-svelte and underlying accessible primitive behavior; confirm installed Bits UI or Melt UI usage instead of assuming either version.
- The ask is a project's specific token values, brand contract, or product-surface enforcement (the current project's approved token/brand sources define the requirement): use Design Foundation's product-context method before applying general Tailwind mechanics.
- The ask is cross-framework dark mode/theming strategy beyond Tailwind's own `@custom-variant` mechanics: route to UI Primitives for the pattern, keep this Specialist for the Tailwind-specific implementation.
- The ask is bootstrapping a design system from scratch rather than bridging an existing one into Tailwind: route to Design Foundation.

## Inputs the Specialist needs
- Whether the project is on Tailwind v3 or v4, and the framework/build tool (Vite and the selected SvelteKit runtime).
- The specific surface: theme/tokens, migration, Vite setup, dark mode, container queries, class ordering, or anti-pattern review.
- Whether the question is about Tailwind mechanics or about a specific product's token values (the latter needs the accepted product context).

## Outputs
- CSS-first `@theme` configuration or a token-extension/override/reset recommendation.
- A version-pinned migration proposal, with CSS/config/content-scan/theme breaking changes and required manual follow-ups. Running an upgrader or installing tooling requires a capable authorized caller.
- SvelteKit/Vite wiring, `@custom-variant dark` configuration, or container-query patterns.
- File:line-cited findings for anti-pattern or performance review, citing supplied measurements rather than treating upstream benchmarks as project evidence.

## Commonly sequenced with
- Svelte Foundation for the selected SvelteKit target: when a styling task is entangled with component architecture.
- UI Primitives: selected shadcn-svelte copy-in and theme compatibility.
- Design Foundation: whenever the question turns out to be about a project's actual token values or app-specific enforcement (the current project, for example).
- Quality Review: for post-migration or post-refactor verification.

## Component fit intake
For SvelteKit/Vite compatibility, pin Tailwind v3/v4, content scanning, theme variables, component variants and dark-mode contracts. Design Foundation owns token values; UI Primitives owns shadcn-svelte component copy-in mechanics. Svelte Foundation owns runes and component lifecycle. Other frameworks are outside the customer app target. A worksheet does not prove mounted browser behavior or accessibility.
