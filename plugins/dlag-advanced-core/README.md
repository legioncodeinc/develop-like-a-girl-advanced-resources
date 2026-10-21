# Advanced Core platform and design

Commands: `/dlag-advanced-core:get-started`, `/dlag-advanced-core:review-project`, `/dlag-advanced-core:plan-project`, `/dlag-advanced-core:manage-repository`, `/dlag-advanced-core:explain-this`, `/dlag-advanced-core:check-dependencies`, `/dlag-advanced-core:build-task`, `/dlag-advanced-core:ready-check`, `/dlag-advanced-core:design-data`, `/dlag-advanced-core:design-interface`.

Core contains 24 Playbooks and Specialists; Website Builder contains one; App Builder contains six. Install dlag-advanced-core explicitly before either builder. Cross-pack calls use namespaced Skills. Missing Core is a blocked prerequisite, never evidence that a Playbook ran. No automatic plugin dependency installation is assumed.

The three shared document Specialists retain document-only scope; eight shared review/coordination Specialists and Browser Checks remain read-only. New implementation Specialists have Read, Grep, Glob, Skill, Write and Edit for authorized local source. Shell, dependency installation, provider configuration, credentials, live sends, payment operations and deployment require suitable caller tools and express authorization. No hooks or MCP servers are installed.

SvelteKit server functions on Vercel own application operations. Payload owns CMS operations on its separate Next.js host with Payload editor login. WorkOS owns app identity. R2 holds file bytes; Neon and Payload retain their separate ownership records. Resend is transactional only. Optional Stripe custom checkout is off until requested; success URLs never grant entitlement. Static and native discovery establish packaging only, not model behavior, builds or live integrations.
