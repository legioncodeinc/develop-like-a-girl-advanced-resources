# Responsive media and fonts

## Match the image request to its rendered slot

The browser selects width candidates using `sizes`, viewport width and pixel density. Write `sizes` from the actual layout, not from the source image dimensions. For a full-width picture inside a 76rem shell with 1rem side gutters:

```svelte
<picture>
  <source type="image/avif"
    srcset="/images/team-640.avif 640w, /images/team-1280.avif 1280w, /images/team-1920.avif 1920w"
    sizes="(min-width: 78rem) 76rem, calc(100vw - 2rem)" />
  <source type="image/webp"
    srcset="/images/team-640.webp 640w, /images/team-1280.webp 1280w, /images/team-1920.webp 1920w"
    sizes="(min-width: 78rem) 76rem, calc(100vw - 2rem)" />
  <img src="/images/team-1280.jpg"
    srcset="/images/team-640.jpg 640w, /images/team-1280.jpg 1280w, /images/team-1920.jpg 1920w"
    sizes="(min-width: 78rem) 76rem, calc(100vw - 2rem)"
    width="1920" height="1200" alt="The workshop team reviewing a prototype"
    fetchpriority="high" decoding="async" class="block h-auto w-full" />
</picture>
```

All candidates above must exist and share the same crop/aspect ratio. The high-priority example is for the actual visible hero only. Below-fold media uses `loading="lazy"` and omits high priority. Do not preload every candidate or every page's hero. Width/height reserve the ratio; they do not force a 1920px layout.

For a two-column layout with a 2rem gap after a 48rem breakpoint, derive the slot as half the container minus half the gap. Test one narrow, one mid-width and one capped-width calculation. If the crop changes by viewport, use art-directed picture sources and reserve the corresponding aspect ratio at each breakpoint.

## Choose a delivery path

- Repository assets with fixed imports can use an already configured `@sveltejs/enhanced-img` pipeline. Its source processing happens at build time; a dynamic external CMS URL cannot be assumed to receive the same transform.
- Public Payload media needs a projected media model: approved URL, meaningful alternative text, intrinsic width/height and available variant widths. Do not construct variant URLs that the CMS did not generate.
- Private R2 media goes through the packaged storage/auth contract. A signed private URL must not become a static HTML artifact, public sitemap value or shared-cache entry.

For remote image ingestion, limit origins, response bytes, pixel dimensions and transform resources. Do not fetch arbitrary submitted URLs through an unrestricted server proxy. Preserve the original if an authorized destructive transform has not been requested.

## Font loading

Use licensed WOFF2 assets and only required weights/scripts. A complete definition for a real variable font would look like:

```css
@font-face {
  font-family: 'Project Sans';
  src: url('/fonts/project-sans-latin.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
body { font-family: 'Project Sans', system-ui, sans-serif; }
```

The weight range must match the actual font. `swap` permits visible fallback; `optional` may retain fallback on a slow first visit. Choose deliberately. Preload only an essential first-render font with `as="font" type="font/woff2" crossorigin="anonymous"`, using the identical URL as CSS. An unused preload wastes bandwidth.

For a fallback metric override, measure the chosen font pair and write the actual size-adjust/ascent/descent/line-gap values. Do not copy percentages from another font. Check headings, button width and line wrapping with the font blocked and loaded. Cache versioned public assets immutably only when their URL changes with content. Report measured LCP/CLS with build, viewport, network and cache conditions, not projected savings.

Sources: [SvelteKit images](https://svelte.dev/docs/kit/images), [MDN responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images), [MDN font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display).
