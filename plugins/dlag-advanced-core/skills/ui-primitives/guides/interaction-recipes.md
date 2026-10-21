# Choose and compose the right control

| Need | Primitive | Contract |
| --- | --- | --- |
| Navigate | Anchor | Real href; browser back/open-in-new-tab works |
| Change state | Button | Explicit type; visible pending result |
| Small mutually exclusive choice | Radio group or native select | Programmatic label and current value |
| Focused supplementary task | Dialog | Title, description, Escape, focus containment and return |
| Consequential confirmation | Alert dialog | Describe effect; deliberate confirm and cancel |
| Field validation | Inline error | Associated with input, safe value retained |
| Passive completion | Status region or existing toast | Does not steal focus or carry the only recovery action |
| Searchable command list | Existing command primitive | Keyboard navigation, names and empty result |

Use copied project source and its installed API. Do not nest a button inside a trigger that already renders a button. If customization requires a child snippet, use the installed Bits UI snippet contract and pass the supplied props to exactly one interactive child. A React `asChild` example is not a Svelte API.

## A dialog with readable content

This composition uses source-owned shadcn-svelte exports. Inspect their actual paths first. It is informational; the user's existing record-edit route can remain the primary accessible workflow.

```svelte
<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  let { recordTitle }: { recordTitle: string } = $props();
</script>
<Dialog.Root>
  <Dialog.Trigger type="button">About this record</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>About {recordTitle}</Dialog.Title>
      <Dialog.Description>How this record is used in your workspace.</Dialog.Description>
    </Dialog.Header>
    <p>Only members with permission can open or change this record.</p>
    <Dialog.Footer><Dialog.Close type="button">Close</Dialog.Close></Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

For forms inside portalled content, put the form inside the content or use a matching form ID and the submit button's `form` attribute. A form outside the portal is not necessarily a DOM ancestor of its fields. On server validation failure keep the dialog open and make errors available. Close only after confirmed success. A delete dialog must state the exact target; the server rechecks permission and the mutation contract handles retries.

## Icons and accessible names

Use the installed Svelte icon package with named imports. Decorative SVGs use `aria-hidden="true"`; an icon-only button uses a concise `aria-label`. Prefer a visible text label for the main action. Do not load every icon through a runtime namespace lookup. Keep icon dimensions stable to prevent text shifts and use currentColor so semantic states remain themeable.

A tooltip cannot supply the only label or essential instructions. Truncated text needs an accessible full value without requiring hover. Repeated row actions need target-specific names, such as “Edit quarterly report”.

## Review one complete interaction

Open with keyboard, inspect the title/name, tab through controls, attempt an invalid submission, recover, close with Escape and confirm focus returns to the trigger. Reopen after data changes and confirm no stale draft leaks from another record. Check narrow-screen content scrolling separately from the background scroll lock. These cases describe how a consumer verifies its app; packaging this guide does not claim the app exists.

Sources: [shadcn-svelte Dialog](https://www.shadcn-svelte.com/docs/components/dialog), [Bits UI Dialog](https://www.bits-ui.com/docs/components/dialog), [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
