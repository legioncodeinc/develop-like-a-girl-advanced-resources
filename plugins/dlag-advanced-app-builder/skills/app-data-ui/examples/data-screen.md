# URL-driven table in Svelte

The page receives a server view model with at most `pageSize` authorized rows plus `hasNext`. The server fetches one extra row to determine `hasNext`; it does not need an unrestricted global count. Adapt the fields to the actual schema. Dates arrive as display-safe strings.

```svelte
<script lang="ts">
  type Row = { id: string; title: string; updatedLabel: string };
  let { data }: { data: {
    rows: Row[]; q: string; page: number; sort: 'newest' | 'title'; hasNext: boolean;
  } } = $props();
  function pageHref(page: number) {
    const params = new URLSearchParams({ q: data.q, sort: data.sort, page: String(page) });
    return `?${params}`;
  }
</script>
<h1>Records</h1>
<form method="GET">
  <label for="record-query">Search records</label>
  <input id="record-query" name="q" value={data.q} maxlength="120" />
  <label for="record-sort">Sort</label>
  <select id="record-sort" name="sort" value={data.sort}>
    <option value="newest">Newest first</option><option value="title">Title</option>
  </select>
  <button type="submit">Apply</button>
  <a href="?">Reset</a>
</form>
{#if data.rows.length}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (The named region must be keyboard-scrollable when the table overflows.) -->
  <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Record table">
    <table>
      <caption>Records on page {data.page}</caption>
      <thead><tr><th scope="col">Title</th><th scope="col">Updated</th><th scope="col">Action</th></tr></thead>
      <tbody>{#each data.rows as row (row.id)}
        <tr><th scope="row">{row.title}</th><td>{row.updatedLabel}</td>
          <td><a href={`/records/${encodeURIComponent(row.id)}`} aria-label={`Open ${row.title}`}>Open</a></td></tr>
      {/each}</tbody>
    </table>
  </div>
{:else}
  <p>No records match this page. Change the search or return to the first page.</p>
{/if}
<nav aria-label="Record pages">
  {#if data.page > 1}<a href={pageHref(data.page - 1)}>Previous</a>{/if}
  {#if data.hasNext}<a href={pageHref(data.page + 1)}>Next</a>{/if}
</nav>
```

The GET form omits `page`, so changing the filter resets to page 1. Links preserve the validated query and sort. A deep page that becomes empty after deletes is an expected state; offer return to page 1. Offset pages are not stable snapshots during concurrent changes. For larger datasets use a query-bound cursor through Data Foundation.

For editable cells keep a real form contract, field error associations and per-row pending state. Avoid turning every cell into an interactive control. Bulk operations submit IDs, then the server re-resolves every ID under the actor scope; do not trust the selection's original authorization. A “select all matching” operation needs an explicit server query contract and upper bound, not a hidden list of every ID.

Sources: [SvelteKit state management](https://svelte.dev/docs/kit/state-management), [Drizzle select](https://orm.drizzle.team/docs/select).
