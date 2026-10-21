# Deterministic search patterns

These are review leads, not automatic findings or execution permission. The read-only Specialist uses equivalent available Read/Grep/Glob queries. A separately authorized caller can run shell examples against its supplied project. Match actual route/source directories and installed libraries. List file names for credential leads; do not print matched values or credential-bearing git patches into chat. Do not scan personal home directories, environment values, production logs or unrelated repositories.

## Secret/public boundary leads

```bash
rg -l -i '(PUBLIC_|VITE_|NEXT_PUBLIC_).*(KEY|SECRET|TOKEN|PASSWORD)|WORKOS_.*(SECRET|KEY)|DATABASE_URL|PAYLOAD_SECRET|R2_.*SECRET|STRIPE_.*SECRET|RESEND_API_KEY' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx' --glob '*.js'
rg -l -i 'supersecret|changeme|password123|your-secret-key|test-secret' src
rg -l 'envPrefix|define:|window\.ENV|import\.meta\.env|process\.env' --glob '*config*' --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg --files --hidden -g '.env*' -g '.dev.vars*' -g '!node_modules' -g '!.git'
```

A publishable Stripe key is intentionally public and not automatically a secret finding. Trace actual authority and client reachability. A template placeholder is not a live credential. An authorized history reviewer can list affected paths with `git log --all --diff-filter=A --name-only --format= -- '**/.env*' '**/.dev.vars*'`; file-name evidence alone does not show a credential existed. Secret detectors must redact their output before supplying evidence.

## Request authorization and injection

```bash
rg -n 'export.*(load|actions|GET|POST|PUT|DELETE|PATCH)|handleFetch|handleError|isRemoteRequest' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -n 'workos|locals|Authorization|requireActor|requireUser|organizationId|tenant_id|membership|overrideAccess' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -n '\{@html|dangerouslySetInnerHTML|innerHTML|DOMParser|sanitize|redirect\(|new URL\(' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -n 'ENABLE ROW LEVEL SECURITY|FORCE ROW LEVEL SECURITY|CREATE POLICY|WITH CHECK|SECURITY DEFINER|BYPASSRLS|set_config|current_setting' --glob '*.sql' --glob '*.ts'
rg -n 'sql\.raw\(|sql\.identifier\(|\.query\(|\.execute\(|\.rpc\(|\.order\(' src --glob '*.ts'
```

The presence of a helper, auth import or RLS string is not proof that every route invokes it, that it verifies identity or that its actual role is constrained. Read its caller, implementation, query/response/effect boundary and refusal branch. Raw SQL, identifier maps and RPC permissions require the chosen driver's actual semantics. A generic search cannot detect every query interpolation or bypass.

## R2, uploads and response leakage

```bash
rg -n 'getSignedUrl|presign|S3Client|GetObjectCommand|PutObjectCommand|\.get\(|\.put\(|\.delete\(|arrayBuffer\(|formData\(' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -n 'Cache-Control|Vary|cache\.put|prerender|JSON\.stringify|Response\.json|data\(' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
```

Confirm actual bucket/key ownership, public/private split, byte/type/count limits, finalization, capability expiry, approved response fields and private cache scope. Broad method names are noisy leads; do not report every get/put as a vulnerability.

## Webhook, email and money paths

```bash
rg -n -i 'webhook|stripe-signature|constructEvent|constructEventAsync|request\.json|request\.text|waitUntil|queueMicrotask' src --glob '*.ts'
rg -n 'event\.id|processed_webhooks|inbox|pending|leased|completed|failed|idempotenc|entitlement|checkout|sendEmail|resend' src --glob '*.ts'
rg -n 'fetch\(|redirect:|https?://' src --glob '*.ts'
```

Read raw-body and signature order before any effect; distinguish durable verified acceptance from in-memory work and from completed effects. Inspect actual business/customer mapping, concurrency and recovery. URLs from signed payloads can still be SSRF inputs. Do not print webhook bodies, customer payloads or provider keys.

## Dependency and CI paths

```bash
rg -n 'npm install|npm ci|frozen-lockfile|ignore-scripts|pull_request_target|workflow_run|permissions:|id-token:|uses:' .github/workflows package.json
```

Read the full lockfile for `resolved`, `integrity`, version and `hasInstallScript` changes. Use the [parsed-origin example](secure-by-default-snippets.md) with the actual project's approved origins, not substring matching. Installed package/advisory/registry checks are external/command work and require their own caller authorization. Do not install tools or change CI while reviewing it.

## Cookies, headers, logs and telemetry

```bash
rg -n -i 'sameSite|httpOnly|secure:|__Host-|localStorage|sessionStorage|Set-Cookie' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -n 'Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|frame-ancestors|nonce|rateLimit' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
rg -l 'console\.(log|error|warn)|captureException|captureMessage|beforeSend|beforeBreadcrumb|maskAllInputs|maskTextSelector|maskCapturedNetworkRequest' src --glob '*.ts' --glob '*.svelte' --glob '*.tsx'
```

WorkOS application sessions and Payload editor sessions have separate cookies, principals and permission policies. Match actual design and SDK requirements. Telemetry may be absent or use another SDK; no product is selected by these patterns. Inspect sensitive custom properties and redact before transmission. Source matches do not replace production bundle, browser, runtime, role/policy or sink evidence.

## SvelteKit and separate Payload search coverage

Locate `hooks.server`, `+page.server`, `+layout.server`, `+server`, universal loads, `$lib/server`, `*.server.*`, `{@html}`, `handleFetch`, `handleError`, remote functions when present, public environment assignments and module-level mutable stores using actual Read/Grep tools. Follow imports before confirming a gap. For the CMS inspect `payload.config`, collection/field access, Local API `overrideAccess`, draft/preview queries, Route Handlers and actual custom Server Actions. A JSX helper cannot replace these searches or clear `.svelte` sinks.
