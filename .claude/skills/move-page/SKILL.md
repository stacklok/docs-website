---
name: move-page
description: >
  Move or rename a documentation page safely: relocate the file, update sidebars.ts, sweep and fix inbound links, add a vercel.json redirect from the old URL, and verify the build. Use whenever a docs page's file path or URL changes for any reason: moving a page to another section, renaming a file or slug, restructuring or consolidating a section, or retiring a page in favor of another. E.g. "move the vault guide into integrations", "rename quickstart-cli to quickstart", "fold the ngrok tutorial into the integrations guide".
argument-hint: '<old-path> <new-path>'
---

# Move or rename a documentation page

Relocating a page touches five things: the file, the sidebar, inbound links, the published URL (which external sites and search results already point at), and the build. Missing the redirect is the costly failure: it produces 404s for every existing external link and search result. Follow every step; none are optional.

## URL model

Docs are served with `routeBasePath: '/'`, so a page's URL is its file path relative to `docs/`, without the extension:

- `docs/toolhive/guides-cli/network-isolation.mdx` → `/toolhive/guides-cli/network-isolation`
- `index.mdx` pages resolve to their directory path: `docs/toolhive/guides-registry/index.mdx` → `/toolhive/guides-registry/`
- A doc's sidebar ID is the same path without the extension (e.g. `toolhive/guides-cli/network-isolation`).

## Before moving

1. Confirm the old file exists and check `git status` for uncommitted changes to it.
2. Confirm the destination follows the information architecture placement rules (AGENTS.md "Where to place new content"). If the requested destination conflicts with those rules, raise it before proceeding.
3. Never move auto-generated pages (see AGENTS.md "Auto-generated content"). Their location is owned by the generation scripts; moving them requires changes to the upstream config, not a file move.

## Steps

1. **Move the file** with `git mv <old> <new>` so history follows the file.

2. **Update `sidebars.ts`**: change the doc ID to the new path (relative to `docs/`, no extension). If the page moved between sections, place it appropriately in the destination category and remove it from the source category.

3. **Sweep inbound links.** Search for both reference forms and update every hit:
   - Relative file links from other pages: grep for the old filename (e.g. `network-isolation.mdx`) across `docs/` and `blog/`. Recompute each relative path from the linking file's location.
   - Site-absolute URL links: grep for the old URL path (e.g. `/toolhive/guides-cli/network-isolation`) across `docs/`, `blog/`, `src/`, and `docusaurus.config.ts` (navbar/footer links).
   - If an auto-generated page links to the old path, don't hand-edit it; the fix belongs in its source (`scripts/lib/crd-intros.mjs` for CRD page intros, or the upstream repo).
   - For a rename, also check the page's own front matter (`title`, `description`) and opening prose for the old name while the file is open.

4. **Add a redirect** in `vercel.json` from the old URL to the new one:

   ```json
   {
     "source": "/toolhive/guides-cli/old-name",
     "destination": "/toolhive/guides-cli/new-name",
     "permanent": true
   }
   ```

   Use `"permanent": true` for a real move or rename; reserve `"permanent": false` for URLs expected to change again soon. If the old URL already appears as a `destination` in existing redirects, update those entries to point directly at the new URL so readers don't hop through redirect chains. Place the new entry next to related redirects (same section or topic) rather than appending at the end.

5. **Check anchors.** Redirects preserve `#fragment` anchors, so any inbound link that targets a heading (`old-page#some-heading`) only works if that heading still exists on the destination page. If headings changed during the move, update the linking pages to the new anchors.

6. **Format and lint the touched files**: `npx prettier --write <files>` and `npx eslint <files>` (`.mdx` needs both; see AGENTS.md's linter mapping). Call the binaries directly with file paths; the repo's `npm run prettier:fix` script formats the entire repo and can't be scoped. Note: a longer filename can push wrapped lines past the 80-character limit, causing Prettier to reflow prose and re-pad table rows around the edited links. That churn is expected; mention it in the PR so reviewers don't puzzle over seemingly unrelated line changes.

7. **Verify**: run `npm run build` after formatting, so the build validates the final content (broken internal links fail the build). Confirm the new page path exists in `build/` output. The build cannot catch external links to the old URL; that's what the redirect is for, so double-check step 4 happened.

## Moving a whole section

For a directory move, repeat the sweep per page, move the category entry in `sidebars.ts`, and add one redirect per page (Vercel redirects support `:slug*` path parameters for whole-directory moves; prefer one wildcard rule when every page in the directory moves to the same relative location):

```json
{
  "source": "/toolhive/tutorials/:slug*",
  "destination": "/toolhive/guides-k8s/:slug*",
  "permanent": true
}
```

Only use a wildcard when the mapping is truly uniform; mixed destinations need per-page rules.
