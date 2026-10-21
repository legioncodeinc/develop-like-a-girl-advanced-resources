# CMS acceptance cases

Use fictional editor/admin/customer/anonymous identities and a draft, changed published post and released/unreleased media. Anonymous public list/detail/file requests cannot reveal drafts, editor email, private uploads or a new autosave. WorkOS customer is not a CMS editor. Editor can save/publish allowed content, cannot create admin or change role. Admin can manage editors.

Preview accepts one valid scoped nonce; missing/expired/replayed nonce, wrong origin, shared header only, alternate collection, document mismatch and requested overrideAccess fail. Preview is private/no-store/noindex. Published sitemap excludes drafts; unpublish withdraws content/media through cache invalidation. A fake renderer or handwritten signature does not prove Payload's runtime access or SDK behavior.
