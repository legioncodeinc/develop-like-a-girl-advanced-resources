# Plan a website or app that can be built in slices

Start with one outcome a user can finish. Preserve supplied decisions and use the existing product brief. Ask only questions whose answers change that first usable flow.

## Website sequence

1. Define audience, primary action, page list, approved copy/assets and content editors.
2. Build a SvelteKit shell and one server-rendered public page with semantic headings, navigation, metadata and real empty/error/404 behavior.
3. Add the separate Payload content model and published read contract. Keep editor authentication, draft preview and public content access separate.
4. Connect public reads, then remaining pages and optional blog routes using the same content contract. Unknown slugs must not become successful blank pages.
5. Add a lead action only if requested, with bounded validation, abuse controls and durable persistence. Mail is a separate outcome from saving a lead.
6. Verify the affected page/form journey, then prepare the requested release handoff.

## Application sequence

1. Define the first actor and record, including organization membership and ownership rules.
2. Build sign-in, protected request context and a minimal denied-access path.
3. Build create/list/detail/edit as one vertical slice with server validation and scoped Neon queries.
4. Add accessible pending/invalid/empty/error/success states and the relevant data-screen methods.
5. Add files, onboarding, search, integrations or custom checkout only when the brief calls for them. Each adds its own durable state and failure handling.
6. Verify owner versus other-user behavior and the complete first action before broadening the feature set.

## Write acceptance that can be checked

Use the [acceptance slice](../templates/acceptance-slice.md). For each task state the visible result, concrete inputs, authorization rule, data mutation, failure behavior and expected evidence. “Secure”, “responsive” and “production ready” alone are not acceptance criteria.

A CMS task might require a published article to render by slug, a draft to stay private, an unknown slug to return 404 and an editor save to preserve required fields. An app task might require an owner to update a record while another organization sees no record and no distinguishable private data.

Identify shared files and cross-service contracts before parallel authoring. One worker owns each file. UI and schema work can proceed independently after input/output and authorization semantics are agreed. When those semantics are unknown, resolve that question rather than inventing two incompatible implementations. Avoid estimating a provider-dependent completion date from local code alone.
