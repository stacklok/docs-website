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

**When the check fails on a PR from a branch in this repo (not a fork), this
happens automatically.** A follow-up job regenerates the baselines inside the
same pinned container the check uses and pushes the result as a new commit on
the PR branch — no action needed. **Review that commit's diff before trusting
it** (the PR description's screenshot summary, added automatically, is the
fastest way to do that) — a passing check only proves the render is _consistent_
with the new baseline, not that it's _correct_. It won't retry indefinitely: if
the last commit on the branch was already a baseline update and it's still
failing, that's left for a human to look at rather than chaining another
auto-commit on top.

On a fork PR (GitHub withholds write secrets from fork `pull_request` runs, so
auto-fix can't push there) or to trigger it manually, comment
**`/update-snapshots`** on the pull request instead. Any repo collaborator with
write access can trigger it; it refuses to run on forked-repo PRs, which it
can't push to either — in that case, regenerate locally
(`npm run test:visual:update`) and push the changed files yourself.

**Known gap:** GitHub currently requires manual "Approve and run" for a check
run triggered by a `github-actions[bot]`/`GITHUB_TOKEN`-authored push, even on a
same-repo branch — so the auto-fix commit's own check needs one manual approval
click before it runs. A follow-up human-authored push (even a trivial one) isn't
subject to that gate and runs normally. Fixing this for good means pushing via a
GitHub App installation token or a PAT instead of `GITHUB_TOKEN` — not done here
to avoid a new secret/app for a first cut of this suite.

## Adding a new case

Add to the existing `NAV_PAGES` array or as its own `test(...)` in
`pages.spec.ts`/`mobile.spec.ts`, calling `captureColorScheme` (single theme) or
`captureBothThemes` (light + dark) from `fixtures.ts` once the test has already
asserted the state being snapshotted. Keep the matrix small — a new entry should
exercise shared layout/theme/nav that nothing else here already covers, not add
per-page content coverage (that's what regular review is for, not this suite).
