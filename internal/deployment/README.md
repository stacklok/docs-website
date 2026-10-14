# Deploy and review the website

Vercel publishes the documentation at `https://docs.stacklok.com`. Branches and
pull requests receive preview deployments, and the production site deploys from
`main`. Use previews to review changes before merging, then verify the resulting
production deployment.

## Build configuration

[`vercel.json`](../../vercel.json) defines the deployment commands and permanent
redirects:

| Setting | Command                                     |
| ------- | ------------------------------------------- |
| Install | `dnf install -q -y jq && npm install`       |
| Build   | `./scripts/install-thv.sh && npm run build` |

Use Node.js 24, as required by [`package.json`](../../package.json). The build
generates the site in `build/` and checks documentation links.

The Vercel build installs the ToolHive CLI through
[`scripts/install-thv.sh`](../../scripts/install-thv.sh). The script downloads
the Linux x64 release and requires `jq`. It selects `TOOLHIVE_VERSION` when set,
or the latest release otherwise. Deployment builds therefore depend on GitHub
release metadata and downloads as well as npm dependencies.

The production branch and account-level deployment settings are managed in
Vercel. Consult the project settings when checking access, domain configuration,
or environment variables.

## Review a preview deployment

1. Open or update a pull request targeting `main`.
2. Wait for its Vercel preview deployment and GitHub Actions checks. Open the
   deployment link from the pull request and confirm it corresponds to the
   latest commit you want to review.
3. Open the changed pages directly, then follow their sidebar entries and
   related links. Check light and dark mode, and use a narrow viewport for
   changes that affect layout or navigation.
4. For a moved page, open its old path on the preview deployment and confirm
   that the redirect in `vercel.json` leads to the intended destination.
5. Review any failed checks before merging. Use the Vercel build log for preview
   failures and the corresponding GitHub Actions job for CI failures.

Previews and local development omit the production tracking and marketing
scripts guarded by `VERCEL_ENV === 'production'` in
[`docusaurus.config.ts`](../../docusaurus.config.ts). Review those integrations
on the production deployment when changing them.

The Algolia crawler reads the production hostname. Search results on a preview
can reflect the production index; use direct navigation to review content that
has not been published and crawled yet.

## Understand the pull request checks

The [On PR workflow](../../.github/workflows/on-pr.yaml) runs two reusable
workflows. New commits cancel stale runs for the same pull request.

- [Static checks](../../.github/workflows/_static-checks.yaml) run ESLint,
  Prettier, and tests for workflow helpers and the release PR body renderer.
- [Visual regression](../../.github/workflows/_visual-regression.yaml) builds
  the site and runs Playwright checks in a pinned container. It uploads a
  `playwright-report` artifact on failure, retained for seven days. This job
  pins a ToolHive version for stable screenshot metadata, so its build can use a
  different CLI release from a Vercel build.

Inspect screenshot differences before approving a baseline update. For the
`/update-snapshots` workflow and local visual checks, follow the
[visual regression test instructions](../../tests/visual/README.md).

## Verify production after merging

1. Check the production deployment triggered by the merge to `main`. Confirm its
   commit and build result using the
   [production deployment history](https://github.com/stacklok/docs-website/deployments/Production)
   or the Vercel project.
2. Open the changed pages at `https://docs.stacklok.com` and verify navigation,
   assets, and any redirects. A successful build alone does not confirm that a
   redirect or interactive component behaves as intended.
3. For changes to search extraction or API and CRD rendering, follow the
   [search validation workflow](../search/README.md#update-and-validate-the-crawler).
   Publishing the website and updating the search indexes are separate steps.

## Next steps

- Follow the [search maintenance guide](../search/README.md) when checking
  indexing after publication.
- Use the
  [repository development instructions](../../README.md#local-development) to
  investigate build failures locally.
