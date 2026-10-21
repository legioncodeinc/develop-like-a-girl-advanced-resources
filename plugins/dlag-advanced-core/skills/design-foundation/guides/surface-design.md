# Design a usable website or application surface

Start from the user's task and actual content. For a marketing page, identify the promise, supporting proof and next action. For an application, identify the record or decision being worked on, the next action and feedback after it. Reuse the existing brand; ask for a direction only when none exists and the choice changes the product.

## Make the first surface concrete

1. Sketch the content order in headings and short paragraphs before adding cards. Put the primary action near the information needed to make it.
2. Choose one body typeface, a restrained heading scale, spacing steps and a small set of semantic color roles. A second typeface must earn its asset cost and remain readable.
3. Build one representative page with real-length copy and at least one long label. Use that page to settle tokens rather than inventing dozens of unused components.
4. Reuse source-owned shadcn-svelte controls where interaction benefits from them. A simple editorial section can remain semantic HTML.
5. Record approved values in the existing design document. Component notes need states and behavior, not screenshots alone.

## Layout recipes

```css
.page-shell { width: min(100% - 2rem, 76rem); margin-inline: auto; }
.reading-width { max-width: 68ch; }
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1.5rem;
}
.app-columns { display: grid; gap: 1.5rem; }
.app-columns > * { min-width: 0; }
@media (min-width: 64rem) {
  .app-columns { grid-template-columns: 15rem minmax(0, 1fr); }
}
h1 { font-size: clamp(2rem, 1.2rem + 3vw, 4rem); line-height: 1.1; }
body { font-size: 1rem; line-height: 1.6; }
```

Adapt max widths to content, not a fixed device list. A table may scroll horizontally inside a labeled region; the surrounding page should reflow. Keep DOM reading order meaningful without CSS. Avoid placing a sticky action over the last content or keyboard focus.

## States belong in the design

| State | Useful treatment |
| --- | --- |
| Empty | Explain what belongs here and offer the first authorized action |
| Pending | Preserve context, label the operation and avoid layout jumps |
| Invalid | Identify the field and the correction; retain safe input |
| Unavailable | Explain the next retry step without exposing internal details |
| Success | Confirm the saved result at its new location |
| Forbidden | Explain access or use a concealed not-found response as designed |

Use text or an icon plus text for status, not color alone. Check body text and control contrast against the actual paired backgrounds, including disabled/hover/focus states. Test 200% text zoom and narrow reflow. Motion supports state changes; reduced-motion users receive the same information immediately. Do not claim conformance from a token palette.

Theme implementation: [server-rendered preferences](theme-and-tokens.md). Media layout: use the packaged Font and Image Delivery Playbook.
