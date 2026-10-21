# Browser and Accessibility Checks procedure

1. Record the requested routes, expected task and authorized local URL. Identify existing browser tools and installed binaries. If missing, return the exact pending check; never install a browser or claim a run from source inspection.
2. Use an isolated context and synthetic actors. Prevent external network side effects unless explicitly authorized. Never submit a live lead, real payment, email or provider mutation to test a local UI.
3. For a signed-in app inspect signed-out, owner and other-user paths. Confirm denied records do not appear through direct URLs, list counts, search, download, cached SSR data or back/forward navigation. Cookies must not be client-forgeable identities.
4. Check SSR HTML, hydration console, native forms without JavaScript, validation, empty/error/pending/success states, narrow and desktop viewports. Use semantic locators and expected conditions. Keep failure screenshot/console evidence and repeat only affected cases after a fix.
5. Perform a bounded keyboard/name/focus/zoom/reflow/contrast/alt/reduced-motion inspection using the relevant WCAG criterion. A heuristic or automated sample is not full WCAG AA/AAA or legal conformance. Record routes and checks actually exercised, severity and exact evidence.
6. Lighthouse lab metrics and field CWV measure different conditions. Do not claim measured INP from a TBT result, or treat a high lab score as live field proof. Run performance tools only if available, authorized and relevant; name the device, network, build and cache conditions.
7. Save the linked evidence template. Distinguish static inspection, mock browser behavior, compiled SSR and live provider checks. Reuse passing evidence unchanged; keep unavailable/skipped/cancelled checks unproven. This read-oriented procedure grants no shell or browser tool by itself.

Read the [recipe](../examples/bounded-cases.md) and fill the [record](../templates/browser-report.md) for the requested scope.

## Worked guidance

- [Focused verification and accessibility](../guides/focused-verification.md)
