# Font and Image Delivery procedure

1. Inventory the requested page's actual fonts/images, sizes, sources and rights. Measure dimensions and identify the probable LCP element before changing formats. No invented savings or browser coverage percentages.
2. Public, repository-owned static files live under static/ with stable URLs. Use width and height or an explicit aspect ratio to reserve image space. Supply meaningful alt text or empty alt for decoration, correct srcset/sizes and bounded responsive CSS. Avoid lazy-loading the actual initial hero/LCP image; lazy-load below-the-fold images.
3. Prefer the existing image pipeline and inspected installed SvelteKit enhanced-image integration where applicable. Do not paste next/image props or install an optimizer for a small task. Keep fallback formats where actual target support requires them.
4. Self-host only licensed font subsets and serve woff2 where supported. Preload only the font needed for first render with the correct URL/type/crossorigin behavior. Choose font-display intentionally, measure layout shift and retain metric-compatible readable fallbacks.
5. Public marketing media and private uploads use different contracts. Use dlag-advanced-core:r2-storage for private access checks, quarantined uploads and expiring links; never publish a private object URL or signed URL into static content or a shared cache. Payload editor uploads use the Website Builder CMS storage procedure.
6. Use dlag-advanced-core:browser-checks for visual layout/load failures. A valid srcset is static evidence; LCP/CLS claims require actual measured runtime data and a stated environment.

Read the [recipe](../examples/responsive-image.svelte) and fill the [record](../templates/media-inventory.md) for the requested scope.

## Worked guidance

- [Responsive media and font recipes](../guides/media-recipes.md)
