# Explain an Advanced source in context

Use only the supplied source scope. Start with the owner's question: what this code/document does, why it failed or what a configuration means. Read the relevant excerpt and its direct local dependencies when authorized; do not launch an unrelated repository audit.

Identify the application boundary before explaining: SvelteKit customer app, Payload CMS host, WorkOS identity, Neon data, or an external service. The same word “user” can mean an application customer, CMS editor or service principal. Name which one the source uses and where its authority comes from.

For a route, explain input, verified principal, permission check, data operation, response and failure path in that order. For a configuration, distinguish declared values from observed deployment settings. For an error, quote the precise message and stack location, list what it proves and one next diagnostic that could distinguish the likely causes. Do not claim a cause was reproduced when it was only inferred.

Use a short example only when it helps the actual question. Do not invent customer data, provider responses or a successful test. An analogy may aid understanding but must preserve sequence and permission boundaries. End with the concrete implication for the user's task and any unresolved fact; avoid an obligatory quiz when no teaching interaction was requested.

This is an explanation method. It grants no execution, provider access or application edit authority. A caller can route an actual requested fix through Build Lead separately.
