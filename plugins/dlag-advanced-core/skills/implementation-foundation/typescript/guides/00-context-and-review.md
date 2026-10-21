# Context and review

Classify each module before recommending an import, type or runtime feature. Advanced uses Svelte/SvelteKit on Vercel, Neon/Drizzle and WorkOS. Browser code must not import server credentials. The separate Payload Next.js host has its own compiler and runtime. Record the actual Vercel runtime and Node version from the project instead of treating build-tool execution as deployment proof. Shared pure functions must work in every context that imports them.

Read the supplied package manifest, lockfile kind, compiler configuration, route configuration, scripts, and selected source. Record actual installed declarations separately from installed resolution. Do not inspect credential files or private human notes. Do not install or execute the project merely to identify its stack. When a required configuration is missing, name the missing evidence instead of inventing a standard version.

A review proceeds through module/runtime classification, external inputs, validated domain types, data access, serialized output, errors, concurrency, tests, build artifacts, and the relevant failure checks. Cite the affected project file and line and the local guide section. Missing evidence is an execution gap, not an automatic pass.

Must-fix findings have a concrete effect: trusted `any` or casts across an external boundary, missing authorization or input bounds, SQL interpolation, swallowed required writes, leaked secrets, wrong-runtime imports, a failing required check, or CI changing files to hide a failure. Refactor findings need observed maintenance cost, unnecessary round trips, duplicated policy, or an important uncovered path. Style preferences do not become blockers. A line heuristic is a lead until a reviewer confirms the reachable behavior.

The implementation role may read and edit authorized local source. This material does not grant shell execution, installs, provider access, credentials, configuration changes, commits, pushes, or deployment. A capable caller must obtain the applicable authorization and report exact commands, versions, artifact identity, and limits. Formal Security, Quality against requirements, and repository health remain separate reviews, in that order before any authorized release action.

Return a concrete patch or findings with behavior, impact, evidence, and validation. Use the project's existing documentation destination when writing is authorized. Keep reviewer reports and task state out of shipped application code. Do not require any separate skill archive to understand this material.
