# Select assets by the work they support

Select the minimum assets justified by accepted product requirements. This reference prepares evidence and owner actions, not purchases or provider setup. An unused capability receives a reason and an explicit trigger.

| Capability | Prepare when selected | Include when | Defer when |
| --- | --- | --- | --- |
| Public web presence | Domain ownership reference, DNS contact, Vercel project/environment, HTTPS owner, repository brand/content | A public address is needed | Approved local/private proof needs no public address |
| Repository | GitHub repository reference, accountable maintainer, permission and review evidence | Source is shared or deployed | Supplied local evidence is enough for the current document task |
| Persistent records | Neon database project/environment, region, policy/backup/recovery owner and evidence request | Product stores server-side records | A static brochure has no remote records |
| Customer identity | WorkOS environment, callback/contact and permission-policy owner | Real customers sign in | Public read-only pages need no login |
| Social login | Only the explicitly requested provider's current project, callback, brand, scopes and verification evidence | The user journey requires that provider | Do not add every social network by default; unresearched requirements stay unknown |
| Server secrets | Doppler secrets reference and custodian | Server operations need secrets | Never request the values in a ledger |
| Files and media | R2 endpoint/bucket reference, public/private policy and Neon ownership-record owner | The accepted product stores files | Static repository assets meet the current need |
| Transactional mail | Resend sender/domain/environment reference and delivery/recovery owner | The product sends transactional notifications | No application mail is required; newsletters remain outside this provider boundary |
| Payments | Optional Stripe business/environment reference, custom checkout flow, webhook/signature, entitlement and recovery owners | Money moves in the product | Free pages need no payment account |
| Search/retrieval | Existing Neon/Postgres or application search design and update/access owner | Accepted search needs persistent retrieval | Basic/local search already suffices; do not add a second database, crawler or vector service by default |
| Reliability/support | Error/availability check responsibility, recipient, support contact and recovery owner | The milestone needs customer response/recovery | Choose required outcomes before selecting an extra vendor |
| Background work | Dependency and retry/outbox ownership, marked unimplemented | An accepted requirement needs it | No job provider is selected; do not invent one |
| Content editing | Separate Payload Next.js host, built-in editor accounts, content/media rights and schema/migration owner | Editors need to manage content | An app-only brief or explicitly temporary repository content needs no CMS setup |
| Desktop/mobile distribution | Route mismatch and accountable product/release owner | Owner requests a different product scope | Outside Advanced web/app scope; see [distribution boundaries](distribution-boundaries.md) |

Do not require every Advanced service, additional private networks, infrastructure-as-code tools, newsletters, search vendors or signing/store accounts because they occur in a general vendor list. Topology changes require an accepted decision outside this preparation method. Record the dependency and missing owner rather than silently choosing a tool.

## HTTPS and executable signing

HTTPS uses a TLS certificate for a network service; a host may manage issuance and renewal. Executable signing identifies a publisher and protects signed content. Apple notarization and Windows SmartScreen reputation have separate roles. A website certificate cannot sign an installer. OV/EV are certificate-validation categories, not proof of a selected code-signing product or Windows reputation. These differences explain why a desktop/mobile request needs a separate release scope; they do not add store or signing requirements to Advanced.
