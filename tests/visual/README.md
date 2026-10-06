# Visual regression tests

Playwright screenshot tests covering docs-website's shared layout, theme, and
navigation. The theme-preview page has a fixed sidebar rendered by the same
Docusaurus components as the product sidebars. Screenshots cover its expanded
and collapsed categories, active links, and enterprise badge. Product routes
retain checks for successful responses and visible navigation; sidebar additions
and renames do not require baseline updates. The MCP guide screenshot captures
the main content with volatile metadata masked. See `pages.spec.ts` and
`mobile.spec.ts` for the exact page/viewport matrix (issue
[#1163](https://github.com/stacklok/docs-website/issues/1163)).

## Running locally

```bash
npm run test:visual          # compare against the committed baselines
npm run test:visual:update   # regenerate them
```

This builds the site and serves it in production mode before running the suite
(see `playwright.config.ts`'s `webServer`). CI builds in a separate step and
sets `PLAYWRIGHT_SKIP_BUILD=1` so Playwright serves that build without
rebuilding.

**Local baselines won't match CI.** `toHaveScreenshot()` compares rendered
pixels, and font rendering differs by host OS/GPU even on the same Chromium
build. CI runs inside a pinned `mcr.microsoft.com/playwright` image for exactly
this reason — a locally-generated PNG committed by hand will just fail again on
the next CI run. Use `npm run test:visual:update` locally only to sanity-check
that a scenario renders correctly (the metadata panel opens, the mobile menu
doesn't overflow, mermaid diagrams finish rendering) — never to produce the
baseline you commit.

When a committed baseline differs from the current render, CI maintains one
compact comment on the pull request. The comment groups light and dark changes
for each screen, reports the changed-pixel count, and links to the complete
Playwright report. CI removes the comment after the visual check passes.

## Updating baselines

When a visual difference is intentional, comment **`/update-snapshots`** on the
pull request. Any repository collaborator with write access can trigger it. The
workflow regenerates the baselines inside the same pinned container used by the
check and pushes them to the pull request branch. Review the resulting
before-and-after screenshot summary before merging. A passing check only proves
that the render is consistent with the approved baseline, not that it is
correct.

The command refuses to run on forked pull requests because it cannot push to
their branches. For a fork, regenerate locally with
`npm run test:visual:update`, then push the changed snapshot files yourself.

## Adding a new case

Add product route checks to `NAV_PAGES`. Add screenshot cases as `test(...)` in
`pages.spec.ts`/`mobile.spec.ts`, calling `captureColorScheme` (single theme) or
`captureBothThemes` (light + dark) from `fixtures.ts` once the test has already
asserted the state being snapshotted. Keep the matrix small — a new entry should
exercise shared layout/theme/nav that nothing else here already covers, not add
per-page content coverage (that's what regular review is for, not this suite).
