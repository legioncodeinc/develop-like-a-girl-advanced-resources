# Theme tokens without hydration guesswork

Use the project's existing theme controller if present. For a new three-choice preference, `light`, `dark` and `system` are the entire allowed set. Render the preference from a non-sensitive cookie on the server. CSS resolves `system` using the media query, so the server never guesses the operating system and no localStorage bootstrap script is needed.

Application recipe:

1. Add a literal `data-theme="%theme%"` attribute on `html` in `src/app.html`.
2. In the existing `hooks.server.ts` response transform, replace that exact marker with the allowlisted cookie value, falling back to `system`. Compose with existing transforms. Do not replace arbitrary user-provided strings in HTML.
3. Use these semantic variables in the project's global CSS. Match existing shadcn token names; this example shows four roles, not a complete replacement theme.

```css
:root {
  color-scheme: light;
  --background: #ffffff;
  --foreground: #172033;
  --muted: #eef2f7;
  --muted-foreground: #475569;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --background: #101827;
  --foreground: #f1f5f9;
  --muted: #1e293b;
  --muted-foreground: #cbd5e1;
}
@media (prefers-color-scheme: dark) {
  :root[data-theme="system"] {
    color-scheme: dark;
    --background: #101827;
    --foreground: #f1f5f9;
    --muted: #1e293b;
    --muted-foreground: #cbd5e1;
  }
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
}
```

Use `bg-background text-foreground` rather than separate light/dark colors at every component. If existing components use `dark:` variants, their selector must follow this same explicit preference plus system-media rule. Tailwind's default media-only dark variant would ignore a forced light preference; an existing class-only controller would ignore this attribute. Keep one model.

## Preference action

Use a native POST form containing only a labeled select named `theme`. Its action bounds the body, rejects duplicate fields and unknown values, then writes the cookie with path `/`, SameSite=Lax, production Secure, a chosen expiry and HttpOnly (the browser need not read it). Return a 303 redirect to a fixed local preferences route. Full-document POST navigation ensures the next SSR HTML receives the preference. If adding enhancement later, update the root attribute from the validated result and keep the native path intact.

Personalized HTML cannot be a globally shared cached artifact. Use private responses for cookie-dependent app HTML. For a statically cached marketing page, choose pure system CSS or a separately reviewed client preference controller instead of adding a cookie-dependent server transform to shared-cache output.

Check forced light with a dark OS, forced dark with a light OS, system in both, missing/malformed cookie, no JavaScript and reload. A theme preference has no authority over identity or permissions.

Sources: [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode), [SvelteKit hooks](https://svelte.dev/docs/kit/hooks).
