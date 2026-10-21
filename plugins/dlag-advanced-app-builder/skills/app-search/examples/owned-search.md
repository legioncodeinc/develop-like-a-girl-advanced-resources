# Owner-scoped lexical search

Use the packaged `searchInput` parser for `q`, `page` and `sort`. It limits query length and page size; its four-digit page allowance is a ceiling, not a promise that deep offset queries are affordable. For the small-list recipe below, reject pages above 100 before querying and reject duplicate or unexpected query keys. The empty query lists recent records.

The integration contract assumes `records` has `id`, `title`, `updatedAt`, `ownerId` and `organizationId`. `actor.userId` and `actor.organizationId` come from the verified server session and current membership. Adapt those names to Data Foundation's actual schema. This module belongs under `src/lib/server`.

```ts
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { records } from '$lib/server/schema';

type Search = { q: string; page: number; pageSize: number; sort: 'newest' | 'title' };
type Actor = { userId: string; organizationId: string };
export async function searchOwnedRecords(actor: Actor, input: Search) {
  // Defense at the repository boundary as well as the route parser.
  if (!Number.isInteger(input.page) || input.page < 1 || input.page > 100 ||
      input.pageSize !== 20 || input.q.length > 120 ||
      !['newest', 'title'].includes(input.sort)) throw new RangeError('Invalid search');
  const scope = and(eq(records.ownerId, actor.userId),
    eq(records.organizationId, actor.organizationId));
  // strpos gives literal substring semantics: percent and underscore are ordinary text.
  const match = input.q ? sql<boolean>`strpos(lower(${records.title}), lower(${input.q})) > 0` : undefined;
  const order = input.sort === 'title'
    ? [asc(records.title), asc(records.id)]
    : [desc(records.updatedAt), desc(records.id)];
  const rows = await db.select({ id: records.id, title: records.title, updatedAt: records.updatedAt })
    .from(records).where(and(scope, match)).orderBy(...order)
    .limit(input.pageSize + 1).offset((input.page - 1) * input.pageSize);
  return { rows: rows.slice(0, input.pageSize), hasNext: rows.length > input.pageSize };
}
```

This is a bounded small-list method, not an indexed full-text engine. Literal substring scans can become expensive; capture representative query plans and latency before expanding the corpus. Authorization precedes returned candidates and the extra-row lookahead. The helper's Actor type is not proof of a verified session; only server identity code may construct it for the request. Details, exports and downloads must repeat their own scope check.

## Connect the route

In `+page.server.ts`, verify the actor, validate the URL, call the repository and return only display fields. Set private/no-store headers. Use a native GET form and render escaped Svelte text. The Data UI Playbook includes a complete paginated table view. Never put result snippets into `{@html}` unless a separate sanitization contract justifies it.

If a current schema already has a `tsvector` column and GIN index, use its documented language configuration with a parameterized `websearch_to_tsquery`. Apply the same actor predicate, order by rank plus a unique ID, and test punctuation, stop words and no-match queries. Creating an index or changing a language configuration is a Data Foundation migration decision, not a UI side effect. Do not add embeddings or a paid search provider for this lexical requirement.

Sources: [Drizzle select](https://orm.drizzle.team/docs/select), [PostgreSQL string functions](https://www.postgresql.org/docs/current/functions-string.html), [PostgreSQL text search controls](https://www.postgresql.org/docs/current/textsearch-controls.html).
