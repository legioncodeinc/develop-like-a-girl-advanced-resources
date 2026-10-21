# Image Optimization routing

Use **Font and Image Delivery** for the bounded decisions below. Check [scope and tool limits](../scope-and-tools.md) first. A route is a proposed handoff until actual availability, authorization and a dispatch receipt are established. Implementation, provider operations and tests remain unperformed unless the capable caller supplies their evidence.

The selected stack is Svelte 5/SvelteKit, Tailwind and shadcn-svelte, Neon Postgres/Drizzle, WorkOS customer identity, Doppler secrets, Vercel application functions, Cloudflare R2 and transactional Resend. Payload CMS has its own Next.js host and built-in editor identity. Optional Stripe uses custom checkout only when requested. No newsletter or background-job provider is selected. Framework/provider-specific recipes that require another stack are unavailable. Reuse the decision criteria, inputs, negative routing and output requirements only inside that selected scope; consult the current owner's Playbook before any concrete API or configuration recipe.



## Domain
This Specialist owns how images are encoded, sized, delivered, and perceived in SvelteKit and plain HTML contexts: format selection justified by image content, actual browser support and measured delivery size, responsive srcset/sizes correctness, blur placeholders (LQIP, BlurHash-as-CSS-gradient, ThumbHash), SvelteKit-compatible delivery and loading attributes; any next/image concern is confined to the separate Payload CMS host, and CLI tooling (Sharp for pipelines, Squoosh for one-offs).


## Trigger phrases
- "optimize my images"
- "convert to AVIF"
- "fix layout shift from images"
- "add blur placeholders"
- "what remote patterns do I need for next/image"
- "my LCP image is slow"
- "AVIF vs WebP"
- "audit our images"

## Do NOT route when
- The request is about SVG icon components rather than raster/photo images; that belongs to UI Primitives.
- The request is a general Lighthouse score audit beyond image-specific findings; that belongs to Browser and Accessibility Checks.
- The request is CDN cache TTL or caching architecture; that belongs to GitHub Workflow for review of existing CI evidence; broader CI implementation needs a designated capable caller.
- The request is CSS animation performance; that belongs to Design Foundation.

## Inputs the Specialist needs
- The SvelteKit image-rendering and delivery path; qualify installed Next.js APIs only for the separate Payload CMS host.
- The CDN setup, if any, and whether it supports format negotiation.
- The known or suspected LCP candidate image.
- Existing next.config or picture-element patterns.

## Outputs
- Corrected format pipeline, srcset/sizes values, and placeholder implementation.
- A next.config fix (formats, remotePatterns, minimumCacheTTL).
- An image-audit-report with inventory, format breakdown, LCP candidates, and a prioritized remediation checklist.

## Commonly sequenced with
- Browser and Accessibility Checks: measures the before/after impact of image fixes on LCP and CLS.
- UI Primitives: takes over when the asset in question is an SVG icon, not a photo.
- GitHub Workflow for review of existing CI evidence; broader CI implementation needs a designated capable caller: owns CDN-level format negotiation and cache TTL strategy.
