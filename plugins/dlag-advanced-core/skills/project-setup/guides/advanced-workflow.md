# Establish an Advanced project baseline

Start with the requested product and the repository the owner supplied. A website and an application can share a SvelteKit project, but the Payload editor is a separate Next.js application. Do not create a monorepo, split an existing repository or add a CMS to an app-only brief automatically.

## Inspect the actual project

Record the package manager and lockfile, Svelte/SvelteKit and adapter versions, route tree, server modules, generated types, test scripts and deployment declarations. For a CMS inspect the separate Payload package, database adapter, collections, access callbacks, migrations and storage adapter. Inspect variable **names** and config references, never secret values or local credential files. Use the existing directories; examples such as apps/web and apps/cms are labels rather than prescribed moves.

| Boundary | Evidence to locate | First decision if absent |
| --- | --- | --- |
| Public site/app | SvelteKit routes, adapter and project scripts | Existing project to extend or owner-requested scaffold |
| Customer identity | WorkOS session hook and route guards | Sign-in and organization model |
| Business data | Neon/Drizzle schema and migrations | Record owner and tenant key |
| CMS | Separate Payload host, editor collection and content access | Whether this product needs an editor |
| Secrets | Doppler project/config references and deployment variable names | Local, preview and production isolation |
| Files | R2 client/bucket role and metadata ownership | Public media versus private application files |
| Mail/payments | Requested event, delivery state or checkout flow | Whether either capability is actually needed |

For each prerequisite use present, proposed or unknown and one evidence location. An account name or environment variable declaration does not prove access. Do not turn this inventory into an obligatory provider questionnaire for a local UI task.

## Produce the smallest useful handoff

For a website: accepted pages, brand/assets, whether content is repository-only temporarily or must ship through Payload, public/published versus preview content, lead destination and one page to implement. Payload is the Advanced CMS choice when an editor is requested; a missing CMS cannot be described as a working editorial website.

For an app: the first user action, anonymous/owner/other-member rules, record shape, loading/empty/error/success states and first route to implement. List later optional file/mail/payment work separately.

Save only the requested project documents using the existing Notebook procedure. Route actual authoring to [Build Lead](../../build-lead/SKILL.md), which selects the installed website or app builder. Setup's documentation tools do not become an application scaffold runner. The implementation caller may use its own authorized tools without asking again for an already approved edit.
