# 01. Run a security review

> Role boundary: review supplied local evidence with Read/Grep/Glob/Skill and return findings in chat. Execution, remediation, configuration, external requests and saves require a separate authorized caller. Examples below do not grant those tools or permissions.

## First gate and evidence continuity

Security Review runs before Quality Review and the orchestrator's repository-health review. Pin the candidate, including dirty/untracked files. A branch name or commit SHA does not identify additional working bytes. Record the observed date, exact paths and available artifact hashes; unknown identity stays unknown. Existing reports apply only to the candidate and scope they actually inspected. If Quality already ran and security changes follow, its implementation conclusions need renewed review of the changed candidate.

1. Scope the review and its immediate neighbors. Read every changed protected route plus its identity verifier, permission helper, scoped queries, serialization and storage access paths. Review complete operations including denial and failure branches. Record absent provider, schema, build and runtime evidence as reduced coverage. Advanced uses Svelte 5/SvelteKit on Vercel, Neon PostgreSQL with Drizzle, WorkOS customer identity, Doppler secrets, R2 through the S3 API and transactional Resend. Payload 3 runs separately on Next.js with its built-in editor auth. Stripe is optional custom checkout. No newsletter or background-job provider is selected.

## Design mode before code

Use [threat modeling](11-threat-model-before-features.md), [response boundaries](12-response-and-tenant-boundaries.md), [webhook trust](13-webhook-forgery-replay-and-recovery.md), [exposure scope](14-browser-log-and-context-secrets.md) and [risk verification](15-verify-actual-risk.md). These prepare a packet from actual supplied facts. They do not grant execution authority, select new providers or create an accepted architecture. The author cannot independently approve their own new packet. Synthetic cases demonstrate review reasoning only.

## Stop and escalation rules

If the implementation is outside the inspected stack, state REDUCED COVERAGE and the missing specialist/evidence. If a verifier, policy or helper is unavailable, stop the dependent conclusion rather than invent its behavior. If evidence contains a live credential, record only class/location, preserve existing evidence safely and alert the authorized custodian. Never read more secrets to prove a suspected exposure. Commit, push, provider operations and publication need their own explicit task authorization after all review gates.
