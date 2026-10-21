# From Payload content to a public SvelteKit page

Keep public content reads credential-free. The fixed CMS collection access rule is the authority; a published query is defense in depth. The following route recipe uses `pages` with `title`, `slug`, `description` and `sections`, defined by the Payload collection recipe. It gives an editor-controlled page without requiring a React rich-text renderer in Svelte.

## Bounded server fetch

Place in `src/lib/server/public-content.ts`. Use the same bounded JSON reader for other public CMS queries. The limit is on bytes actually read; Content-Length is only an early rejection. The request's AbortSignal remains active while consuming the body.

```ts
import { env } from '$env/dynamic/private';
export type Section = { blockType: 'text'; heading?: string; body: string };
export type PublicPage = { title: string; slug: string; description: string; sections: Section[] };
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function string(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}
export async function boundedJson(response: Response, limit = 262144): Promise<unknown> {
  if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('application/json'))
    throw new Error('CMS response unavailable');
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) throw new Error('CMS response too large');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('CMS response missing');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('CMS response too large');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
function pageDTO(value: unknown, slug: string): PublicPage {
  if (!record(value) || value._status !== 'published' || value.slug !== slug ||
      !string(value.title, 160) || !value.title.trim() || !string(value.description, 320) ||
      !Array.isArray(value.sections) || value.sections.length > 40)
    throw new Error('CMS document invalid');
  const sections: Section[] = value.sections.map((section) => {
    if (!record(section) || section.blockType !== 'text' || !string(section.body, 12000) ||
        (section.heading !== undefined && section.heading !== null && !string(section.heading, 160)))
      throw new Error('CMS section invalid');
    return { blockType: 'text', body: section.body,
      ...(typeof section.heading === 'string' ? { heading: section.heading } : {}) };
  });
  return { title: value.title, slug, description: value.description, sections };
}
export async function publishedPage(slug: string): Promise<PublicPage | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  const origin = new URL(env.CMS_ORIGIN);
  if (origin.protocol !== 'https:' || origin.username || origin.password ||
      origin.pathname !== '/' || origin.search || origin.hash)
    throw new Error('CMS origin invalid');
  const url = new URL('/api/pages', origin);
  url.searchParams.set('where[and][0][_status][equals]', 'published');
  url.searchParams.set('where[and][1][slug][equals]', slug);
  url.searchParams.set('draft', 'false');
  url.searchParams.set('limit', '1');
  url.searchParams.set('depth', '0');
  for (const field of ['title', 'slug', 'description', 'sections', '_status'])
    url.searchParams.set(`select[${field}]`, 'true');
  const response = await fetch(url, { redirect: 'error', credentials: 'omit',
    cache: 'no-store', signal: AbortSignal.timeout(5000) });
  const body = await boundedJson(response);
  if (!record(body) || !Array.isArray(body.docs) || body.docs.length > 1)
    throw new Error('CMS list invalid');
  return body.docs.length ? pageDTO(body.docs[0], slug) : null;
}
```

`CMS_ORIGIN` is operator-controlled server configuration, never a request parameter. HTTPS is the deployed default. For local CMS development, make an explicit development-only localhost origin adapter; do not weaken this production check globally. Do not send app cookies, editor cookies or authorization headers from public loads.

## Route and rendering

`src/routes/[slug]/+page.server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';
import { publishedPage } from '$lib/server/public-content';
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store' });
  let page;
  try { page = await publishedPage(params.slug); }
  catch { error(503, 'Content is temporarily unavailable'); }
  if (!page) error(404, 'Page not found');
  // PUBLIC_SITE_ORIGIN is fixed configuration, never the incoming Host header.
  const canonical = new URL(`/${page.slug}`, publicEnv.PUBLIC_SITE_ORIGIN).href;
  return { page, canonical };
};
```

Validate `PUBLIC_SITE_ORIGIN` as an HTTPS origin at startup, using the same origin constraints as CMS_ORIGIN. Home can call `publishedPage('home')` in its own load and use `/` for canonical. Reserve application/auth/admin route names before assigning CMS slugs. Leave SSR enabled. The initial no-store choice makes publish/unpublish visible on the next successful read without a new invalidation service.

`src/routes/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>
<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
  <link rel="canonical" href={data.canonical} />
  <meta property="og:title" content={data.page.title} />
  <meta property="og:description" content={data.page.description} />
  <meta property="og:url" content={data.canonical} />
</svelte:head>
<main>
  <h1>{data.page.title}</h1>
  {#each data.page.sections as section}
    <section>
      {#if section.heading}<h2>{section.heading}</h2>{/if}
      <p class="whitespace-pre-line">{section.body}</p>
    </section>
  {/each}
</main>
```

This first block vocabulary is intentionally text-only. Add hero, CTA, image and rich-text blocks when the brief calls for them; each needs CMS fields, a validated public DTO and a matching Svelte renderer together. Reject an unknown block rather than silently publishing an incomplete page. For Lexical blog content, allowlist node types recursively with depth/node-count limits; render text with Svelte interpolation, use fixed heading tags, and validate link protocols. Preserve formatting deliberately. Never pass arbitrary CMS HTML to `{@html}`. CMS image DTOs contain approved public URLs, alt text and dimensions; private asset links are not public image URLs.

## Sitemap, search and publication

Generate `/sitemap.xml` from the same anonymous published-only collections. Fetch bounded pages of slugs with a stable sort and explicit total cap; stop and report a truncated catalog instead of silently omitting pages. Construct each URL from the fixed site origin and XML-escape it. Exclude drafts, preview, private application routes, error pages and noncanonical duplicates. Use server-generated JSON-LD only for real page facts; serialize JSON and replace `<` with `\u003c` before embedding in a script element.

If traffic requires caching, choose a declared maximum stale interval or implement the signed publication events described in [the existing recipes](../references/recipes.md). Cover both publish and unpublish. A short cache is not immediate withdrawal. Preview stays private/no-store/noindex and uses the CMS-specific handshake, not this public fetcher. Lead capture belongs to the SvelteKit application data boundary described in [lead capture](lead-capture.md), not the public CMS collection API.

Primary references: [SvelteKit server loads](https://svelte.dev/docs/kit/load), [Svelte head](https://svelte.dev/docs/svelte/svelte-head), [Payload drafts](https://payloadcms.com/docs/versions/drafts).
