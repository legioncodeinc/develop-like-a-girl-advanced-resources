# Browser Automation routing

Use **Browser and Accessibility Checks** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain

Browser Checks prepares scoped Playwright/Puppeteer test and isolation decisions and evaluates supplied traces, screenshots and browser-specific CI evidence. Actual browser provisioning or execution needs a capable authorized caller. Record the exact browser/environment behind every observed result.


## Trigger phrases

- "write a Playwright test"
- "Puppeteer script"
- "browser automation"
- "Playwright browser install"
- "trace this browser test"

## Do NOT route when

- The work implements CDP directly or builds Chromium, which belongs to a separately qualified browser-engine workflow; CDP internals and Chromium builds are outside this method.
- The work is Electron process design, which belongs to a separately qualified native desktop workflow; Electron process architecture is outside Advanced.
- The work is generic CI topology rather than browser-specific provisioning or test behavior, which belongs to GitHub Workflow for existing workflow and release evidence; a new CI engine is outside this method or GitHub Workflow for review of existing CI evidence; broader CI implementation needs a designated capable caller.

## Inputs the Specialist needs

- Browser tool and version, channel, target URL, test data, external-effect authorization, CI environment, and desired artifacts.

## Outputs

- A stable test/script proposal, browser/tool prerequisites, diagnostics, supplied environment-scoped observations and explicit unrun checks. Do not install browsers or claim execution from this routing review.
