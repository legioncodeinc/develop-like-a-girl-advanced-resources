# React Security routing

Use **Security Review** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



Scope is React/Next.js inside the separate Payload CMS host. Customer application SvelteKit findings use [Security](security.md). Audit scope must identify the host and exact installed versions.

## Domain

Deep security audit of React 18 and 19 code: XSS sinks, unsafe URLs, markdown and sanitizer misuse, SSR serialization, React Server Components and Server Functions advisories (including CVE-2025-55182), client-side secrets, and client-only trust.


## Trigger phrases

- "Security audit our React app"
- "Are we affected by React2Shell?"
- "Check for XSS in our components"

## Do NOT route when

- A customer-app SvelteKit audit: use Security Review's SvelteKit method. Do not apply React-specific findings to Svelte code.
- Fixing vulnerabilities: route to Payload Host under a separate authorized implementation scope. Security Review stays read-only.
- The user wants the audited repository changed during an audit: this Specialist is read-only.

## Inputs the Specialist needs

- The supplied audit scope, exact read-only repository/evidence paths, stack versions, candidate identity and approved output format. No throwaway copy, scanner or audit workspace is presumed to exist.

## Outputs

- Read-only findings in the supplied review format, with exact locators, method, severity, evidence and limits. Do not imply an external audit-contract engine or writable report folder.

## Commonly sequenced with

- Payload Host supplies host boundary evidence; Security Review inspects it, then Quality Review follows resolved findings.
