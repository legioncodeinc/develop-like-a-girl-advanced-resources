# Verify the requested website or app

Start from accepted requirements and Security clearance for the same candidate. Build one compact requirement-to-evidence table: criterion, implementation path, actual check result and any missing evidence. Keep optional features out of the required set unless the user selected them.

## Website examples

- The public homepage and article deep link render meaningful content on the first response.
- Unknown paths/slugs produce the intended status and useful navigation.
- Published Payload content reaches the site; drafts and private fields do not.
- Forms have labels, bounded server validation, pending/error/success states and duplicate handling.
- Saving a lead and sending a notification have separate truthful outcomes.
- Images, fonts and narrow layouts use the real content and assets selected for the project.

## App examples

- Signed-out, owner, different organization and missing-membership requests behave as specified.
- Create/edit/list/detail preserve validated fields, ownership and appropriate failure states.
- Pagination/search/import/export do not bypass the same data scope.
- Private uploads are completed against the owning record, with failed/abandoned state handled.
- Optional checkout renders the selected custom flow and records server-verified entitlement independently of browser return state.

These examples guide relevant coverage, not mandatory new features. Source inspection establishes authored behavior. Type checks and builds establish their own narrow results. Browser and database checks establish only exercised cases. Do not infer provider readiness from mocks or invoke live systems through this read-only role.

## Reuse evidence without review loops

Use an existing passing result when its code, configuration, dependencies and relevant environment are unchanged. When a fix occurs, identify exactly which evidence is invalidated and cover affected neighbors. Do not repeat unrelated checks or create tests that only assert the prose of a checklist. Report implemented-but-unproven behavior separately from missing implementation. Give one concrete correction per actual defect and finish the report even when no defect is found.
