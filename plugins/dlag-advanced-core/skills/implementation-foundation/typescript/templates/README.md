# Template preconditions

These worksheets and compiler/schema examples are not an application scaffold. tsconfig.browser.json illustrates a SvelteKit 2 project extending its generated configuration; merge the intended checks into the existing config instead of replacing it. Preserve framework include paths, aliases and project references. Use the installed Svelte-aware checker for .svelte files. Payload’s Next.js host keeps its own compiler configuration. A newer SvelteKit major needs its documented config rather than this legacy generated path.

boundary-schema.ts performs dependency-free runtime validation and projection; it does not authorize records. Test, migration, entry/artifact and gate worksheets need actual project values and evidence. No lifecycle commands or hooks are installed.
