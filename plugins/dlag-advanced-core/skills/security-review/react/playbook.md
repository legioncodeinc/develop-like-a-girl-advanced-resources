# React Security review method

> Advanced scope: this React catalog applies only to the separate Payload CMS. Other frameworks are conditional comparisons; no React/JSX helper inspects Svelte. Advisory versions remain historical candidates until current supplied primary evidence confirms them.

Review React client and SSR code within the existing [Security Review](../SKILL.md) gate. Use [scope/version detection](guides/00-scoping-and-version-detection.md), then the complete XSS/SSR, data, client-trust and supply-chain procedures. The [reference index](references/REFERENCE.md) links every detection/confirmation/false-positive/severity/code-pair check, dated advisory table and optional helper. No separate Specialist or audit-run workspace is required.

Advanced's React surface is the separate Payload 3/Next.js CMS only. Its editor authentication is Payload built-in and is independent of WorkOS customer identity. The SvelteKit app uses its own [full procedure](../guides/02-sveltekit-attack-surface.md). Use [Payload/Next boundaries](../guides/16-payload-next-boundary.md) for CMS access/Local API, published/draft output, server endpoints and cache scope. The inherited conditional RSC catalog includes non-Next framework comparisons; apply only mechanisms and advisory rows that match the actual CMS runtime, and mark other framework rows N/A. This React helper is not a full Next.js server or Svelte scanner.

1. Pin actual paths/candidate, React/renderer/router mode, installed resolved versions and source/production evidence gaps.
2. Trace every RX/RS candidate through actual source, sanitizer and sink; keep all false-positive and confirmation rules.
3. If RSC is actually present, inspect its ten RC checks, real endpoint/export/argument/closure/response/CSRF/development exposure and installed advisory preconditions.
4. Trace SD exposure from server/config/source to actual client outputs, per-request SSR state, storage, maps and logs; never print credential values.
5. Pair each AR client guard/role/redirect/message/cookie/token decision with its backing server authority.
6. Review SC dependencies, version-specific behavior and all ten AI-pattern mechanisms without assuming authorship from a weak signal.
7. Return every confirmed finding, suspicion, dismissal reason/count and coverage cap using [local finding rules](references/finding-rules.md) and the full root report. All applicable unresolved Medium-or-higher findings block Quality Review.

Use only supplied local Read/Grep/Glob/Skill and return chat output. Do not run scanners/tests/builds, write files, access credentials, browse, contact providers, install, configure or publish. The Python sources/tests are optional inert resources for a separately authorized caller using existing Python 3.9+. Their offline advisory data is dated 2026-09-30: it generates review candidates, not current vulnerability verdicts or safe version recommendations. Actual target/installed API/runtime/primary advisory confirmation remains required. A content author cannot independently clear this new method.
