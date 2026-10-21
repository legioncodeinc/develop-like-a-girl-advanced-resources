# Example: system overview

Synthetic abbreviated architecture specimen, NOT_RUN. It demonstrates the complete document shape and useful Mermaid grouping; a real overview must replace every intended component with actual source-backed mechanisms and evidence.

> Category: Architecture | Version: 1.0 | Date: [actual date] | Status: Draft

How the browser, SvelteKit server, WorkOS, Neon and private R2 storage relate, including the identity and file-access boundaries.

**Related:** actual request lifecycle, session/ownership policy, complete schema reference and accepted ADR paths after inspection in the target repository.

## Architecture diagram

```mermaid
flowchart TB
  subgraph client["Browser: untrusted input"]
    ui["Svelte interface"]
  end
  subgraph backend["SvelteKit server on Vercel: custom backend"]
    routes["SvelteKit SSR/load functions/form actions"]
    checks["Identity and ownership checks"]
    services["Request-scoped server services"]
  end
  subgraph data["Separate service boundaries"]
    auth["WorkOS"]
    db[("Neon PostgreSQL")]
    objects[("Private R2 bytes")]
    cms["Separate Payload Next.js host: content and editor auth"]
  end
  ui --> routes
  routes --> checks
  checks --> auth
  checks --> services
  services --> db
  services --> objects
  routes -->|published content when requested| cms
```

These boxes show logical groupings, not automatically enforced trust. Inspect the actual validator, server verification, owner-scoped queries and R2 authorization for each arrow. Database RLS cannot authorize an object download. Doppler secrets remain server-only; loader output becomes browser-visible.

## Component summary

| Component | What a real document must explain | Required source detail |
| --- | --- | --- |
| Browser and SvelteKit routes | Entry action, rendered/pending/error states and SSR/hydration | Actual route/component paths and data exposure |
| SvelteKit server checks/services | Identity, owner derivation, early denials and failure behavior | Exact verifier and protected-operation call order |
| WorkOS | Customer session and organization context | Actual session verification and membership checks |
| Neon/Drizzle | Business records and migrations | Actual schema, grants and tenant-scoped queries; RLS only when explicitly implemented |
| Separate Payload host | CMS content, built-in editor identity and its own migrations | Actual editor/content access rules and separate schema ownership |
| R2 | Private bytes, upload quarantine/finalization and download access | Actual object/metadata binding and revocation policy |
| Optional transactional email | Intended message versus accepted send versus delivery | Only real Resend paths; no runner assumed |

## Key design decisions

For each consequential actual choice, record its accepted ADR and the source behavior it supports: SvelteKit custom backend ownership, WorkOS identity versus record permission, R2 byte access separate from database policies, and private/public file separation. Do not fabricate an accepted ADR from this illustrative table. Optional custom Stripe needs its own actual server entitlement and webhook evidence when selected.

## Failure and evidence boundaries

A complete overview links to denied/invalid requests, stale/revoked identity, cross-owner access, database failures, unfinalized files and external-delivery failures where implemented. A diagram, grouped box or accepted design does not prove any path executed. No queue, background provider, AI daemon or additional assistant is implied. The Payload CMS host is a separate content/editor boundary when requested.

## Why this form helps

The overview gives the reader the architecture first, then concrete component/source responsibilities, then actual decision pointers and limitations. Use readable local links, color-free diagrams, short connected explanations and the full schema/flow references for depth. No inspected code or execution evidence exists for this constructed architecture itself.
