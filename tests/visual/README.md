# Visual regression tests

Playwright screenshot tests covering docs-website's shared layout, theme, and
navigation — see `pages.spec.ts` and `mobile.spec.ts` for the exact
page/viewport matrix (issue
[#1163](https://github.com/stacklok/docs-website/issues/1163)).

## Running locally

```bash
npm run test:visual          # compare against the committed baselines
npm run test:visual:update   # regenerate them
```

This builds the site and serves it in production mode before running the suite
(see `playwright.config.ts`'s `webServer`).

**Local baselines won't match CI.** `toHaveScreenshot()` compares byte-for-byte,
and font rendering differs by host OS/GPU even on the same Chromium build. CI
runs inside a pinned `mcr.microsoft.com/playwright` image for exactly this
reason — a locally-generated PNG committed by hand will just fail again on the
next CI run. Use `npm run test:visual:update` locally only to sanity-check that
a scenario renders correctly (the metadata panel opens, the mobile menu doesn't
overflow, mermaid diagrams finish rendering) — never to produce the baseline you
commit.

## Updating baselines

Comment **`/update-snapshots`** on the pull request. A CI workflow (any repo
collaborator with write access can trigger it; it refuses to run on forked-repo
PRs, which it can't push to) regenerates the baselines inside the same pinned
container the check uses and pushes the result as a new commit on the PR branch.
The PR description then gets a screenshot summary (new/changed/deleted,
before/after for changes) added automatically.

## Adding a new case

Add to the existing `NAV_PAGES` array or as its own `test(...)` in
`pages.spec.ts`/`mobile.spec.ts`, calling `captureColorScheme` (single theme) or
`captureBothThemes` (light + dark) from `fixtures.ts` once the test has already
asserted the state being snapshotted. Keep the matrix small — a new entry should
exercise shared layout/theme/nav that nothing else here already covers, not add
per-page content coverage (that's what regular review is for, not this suite).
