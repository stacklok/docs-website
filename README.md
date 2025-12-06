# Stacklok docs <!-- omit in toc -->

[![GitHub deployments][deployment-img]][deployment]

This repository contains the public-facing docs for Stacklok's projects, hosted
at [https://docs.stacklok.com](https://docs.stacklok.com).

- [Contributing to docs](#contributing-to-docs)
- [Local development](#local-development)
- [Formatting](#formatting)
- [Building the site](#building-the-site)
- [Deployment](#deployment)
- [About](#about)

## Contributing to docs

We welcome contributions to the Stacklok documentation - if you find something missing, wrong, or unclear, please let us know via an issue or open a PR!

Please review the [style guide](./STYLE-GUIDE.md) for help with voice, tone, and
formatting.

### Reporting issues

Found a problem with the documentation? We have issue templates to help you report it:

- **[Documentation error](https://github.com/stacklok/docs-website/issues/new?template=01-doc-error.yml)** - Report incorrect, outdated, or unclear content
- **[Documentation gap](https://github.com/stacklok/docs-website/issues/new?template=02-doc-gap.yml)** - Request documentation for features that aren't covered
- **[Documentation enhancement](https://github.com/stacklok/docs-website/issues/new?template=03-doc-enhancement.yml)** - Suggest improvements to existing content

For general questions, please visit [Stacklok's community Discord](https://discord.gg/stacklok).

## Local development

You'll need Node.js available (v24 recommended) or VS Code with the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension and Docker.

[![Open in Dev Containers][devcontainer-img]][devcontainer]

```bash
npm install
npm run start
```

This command starts a local development server on port 3000 and opens a browser
window to <http://localhost:3000>. Most changes are reflected live without
having to restart the server.

## Formatting

We use a combination of Prettier, markdownlint, and ESLint to normalize
formatting and syntax. Before you submit a PR, please check for issues:

```bash
npm run prettier
npm run markdownlint
npm run eslint
```

To automatically fix issues:

```bash
npm run prettier:fix
npm run markdownlint:fix
npm run eslint:fix
```

The formatting commands also run as a pre-commit hook using
[Husky](https://typicode.github.io/husky/), so commits will fail if there are
formatting issues that can't be fixed automatically. You can skip this by using
`git commit --no-verify`, but it's recommended to fix the issues instead since
the P workflow will fail the checks anyway.

## Building the site

```bash
npm run build
```

This command generates static content into the `build` directory. It also checks
for broken links, so it's recommended to run this before submitting a PR.

## Deployment

The `docs.stacklok.com` site is published using Vercel. Automatic previews for
branches and pull requests are enabled. The production site is published from
the `main` branch.

## About

This site is built with [Docusaurus](https://docusaurus.io/).

<!-- badge links -->

[deployment-img]: https://img.shields.io/github/deployments/stacklok/docs-website/Production?logo=vercel&label=Vercel%20deployment
[deployment]: https://github.com/stacklok/docs-website/deployments/Production
[devcontainer-img]: https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue
[devcontainer]: https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/stacklok/docs-website
