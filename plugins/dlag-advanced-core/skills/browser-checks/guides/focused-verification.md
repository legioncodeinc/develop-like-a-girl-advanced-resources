# Verify the user's flow with existing browser tools

Select the smallest cases that prove the changed behavior. A website page needs content, links, responsive layout and any requested form. An app mutation also needs permission, validation and persistence evidence. Do not turn a typography change into a full provider test campaign.

## Evidence ladder

| Check | What it establishes |
| --- | --- |
| Source inspection | Intended markup, boundaries and links |
| Svelte compile/type check | Accepted syntax/types for the installed project |
| Synthetic browser flow | Observed UI behavior against the chosen local/mock services |
| Authorized integration test | Actual connection behavior for the selected environment |

Keep these labels in the report. Publishing a Playbook does not require constructing a sample customer application. When a user later invokes the Playbook to build an app, run the checks appropriate to that app and state any missing tooling.

## Use assertions that wait for meaning

This Playwright Test excerpt assumes an existing configured local test server and synthetic record fixture. Adapt route and labels to the application. It demonstrates assertions; it is not permission to start a production browser session or install Playwright.

```ts
import { test, expect } from '@playwright/test';
test('a record screen has usable filtering', async ({ page }) => {
  await page.goto('/records');
  await expect(page.getByRole('heading', { name: 'Records', exact: true })).toBeVisible();
  await page.getByLabel('Search records').fill('Quarterly');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/q=Quarterly/);
  await expect(page.getByRole('link', { name: 'Open Quarterly review', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Reset', exact: true }).click();
  await expect(page.getByLabel('Search records')).toHaveValue('');
});
```

Use semantic labels and auto-retrying assertions. Avoid arbitrary sleeps and networkidle as a proxy for a business result. For server rendering and native forms, use a separate context with JavaScript disabled and perform the requested POST path. Do not fake persistence by checking only a transient toast; reload or query the synthetic store through its approved test interface.

For network isolation, use an isolated test process and mock provider clients at the server boundary. Browser request routing alone cannot stop a local SvelteKit server from calling a provider. Browser service workers can also bypass ordinary routing interception, so use a context with service workers blocked when isolation relies on routes. Never reuse production credentials or a personal authenticated browser profile for synthetic checks.

## Small manual accessibility pass

| Inspect | Relevant WCAG 2.2 criterion |
| --- | --- |
| Programmatic labels, headings and table headers | 1.3.1, 3.3.2 |
| Text and control contrast | 1.4.3, 1.4.11 |
| Text resize and narrow reflow | 1.4.4, 1.4.10 |
| Keyboard operation and no trap | 2.1.1, 2.1.2 |
| Focus order, visible and unobscured focus | 2.4.3, 2.4.7, 2.4.11 |
| Error identification and suggestions | 3.3.1, 3.3.3 |
| Name/role/value and status announcements | 4.1.2, 4.1.3 |

Inspect the actual flow with keyboard and zoom. Check that a dialog returns focus, a sticky header does not obscure focus, and a failure is announced without erasing input. Include motion and target-size checks where the changed interaction warrants them. State the sampled routes and limitations; this pass does not certify whole-site accessibility.

A failure report needs route, actor, action, expected/observed result and a minimal screenshot or console excerpt when useful. Fix once, rerun the affected failure cases, and reuse unrelated passing results.

Sources: [Playwright assertions](https://playwright.dev/docs/test-assertions), [Playwright network](https://playwright.dev/docs/network), [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/).
