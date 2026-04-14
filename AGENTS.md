# Project overview

This is the user-facing documentation for ToolHive, an open source tool that helps you run and manage Model Context Protocol (MCP) servers easily and securely.

## Tech stack

- Docusaurus 3, based on React 19 and TypeScript
- Node.js 24 (exact version required - see `package.json` engines field)
- npm for package management
- Vercel for deployment and hosting

## Folder structure

- `/docs`: contains the main documentation files. Each file corresponds to a page in the documentation.
- `/blog/toolhive-updates`: contains weekly update posts from the ToolHive team. These posts follow a slightly different voice (see "Tone and voice" section).
- `/static`: contains static assets like images, icons, and other files that are served directly.
- `/src`: contains the source code for the website, including components, styles, and customizations.

## Primary configuration files

- `/docusaurus.config.ts`: the main configuration file for Docusaurus, where you define site metadata, theme, plugins, and other settings.
- `/sidebars.ts`: defines the structure of the documentation sidebar, including which pages appear in the sidebar and their order.
- `/vercel.json`: configuration file for Vercel deployment, specifying build settings and redirects.

## Auto-generated content

Do not edit these files directly; they are generated automatically by upstream processes.

- `/docs/toolhive/reference/cli/*.md`: auto-generated CLI reference documentation from the ToolHive CLI source code.
- `/static/api-specs/*`: auto-generated API, CRD, and JSON schema specifications.

## Commands

Development commands:

- `npm run start`: starts a local development server with hot reloading.
- `npm run build`: runs a production build of the site to verify there are no build errors. Run this before creating a PR to ensure the site builds successfully.

Code quality commands (note: pre-commit hooks run these automatically on staged files):

- `npm run prettier` and `npm run prettier:fix`: check and fix code formatting issues (all file types).
- `npm run eslint` and `npm run eslint:fix`: check and fix code quality and Markdown style issues (`.js`, `.jsx`, `.ts`, `.tsx`, `.mdx` files).

## Contribution guidelines

- Use the GitHub flow for contributions: create a branch, make changes, open a pull request (PR).
- Use the pull request template (`/.github/pull_request_template.md`) when opening a PR on behalf of the user.
- Ensure all changes pass linting and formatting checks before submitting a PR.
- Write concise commit messages, limited to 50 characters for the subject line, with a detailed body only if necessary.
- Do NOT use conventional commits style; use imperative mood in the subject line (e.g., "Add", "Fix", "Update").

## Automated quality checks

The project uses automated tooling to enforce code quality and formatting standards:

- **Pre-commit hooks**: lint-staged runs automatically on `git commit`, applying Prettier and appropriate linters to staged files.
- **GitHub Actions**: All PRs trigger automated checks (ESLint, Prettier).
- **No manual formatting needed**: The pre-commit hook handles formatting automatically - you do not need to run formatters manually.

File type to linter mapping (handled automatically by pre-commit hooks):

- `.md` files: Prettier only
- `.mdx` files: Prettier + ESLint
- `.js`, `.jsx`, `.ts`, `.tsx` files: Prettier + ESLint
- `.css`, `.json`, `.jsonc`, `.yaml`, `.yml` files: Prettier only

## Git workflow

- **Main branch**: `main` - all feature branches should be created from and merged into main
- **Branch naming**: Use descriptive names (e.g., `fix-broken-link`, `add-vmcp-docs`)
- **Pre-commit hooks**: Automatically format and lint staged files on commit
- **Before pushing**: Run `npm run build` to verify the site builds successfully
- **Default branch for PRs**: Target `main` unless working on a specific release branch

## Audience

The primary audience is developers and DevOps professionals who want to run and manage Model Context Protocol (MCP) servers using ToolHive. They may be new to MCP servers or have some experience with them.

The documentation should be accessible to a wide range of technical users, including those who may not be familiar with the specific technologies used in ToolHive.

## Information architecture

This project follows the [Diataxis framework](https://diataxis.fr/) for documentation authoring - each page is a tutorial, how-to guide, reference, or explanation. The site is organized by **product area**, with each section self-contained so a reader can complete their journey without leaving it. Cross-cutting content lives in dedicated shared sections.

All documentation lives under `docs/toolhive/`. Folder paths below are relative to that root.

### Design principles

1. **Route readers to value fast.** The home page helps a reader figure out where to go within 10 seconds.
2. **Each section is self-contained.** A reader in the CLI section shouldn't need to leave it to complete their task. Quickstarts, guides, and relevant reference material live together.
3. **Forward momentum on every page.** Every page ends with a "Next steps" section linking to the next logical page.
4. **Consistent structure across sections.** Each product area follows the same pattern: Introduction, Quickstart, how-to guides.
5. **Progressive disclosure.** Core workflows first, advanced topics grouped separately.

### Top-level sections

| Section | Folder | What belongs here |
| --- | --- | --- |
| ToolHive UI | `guides-ui/` | Desktop app guides, quickstart, and reference |
| ToolHive CLI | `guides-cli/` | CLI guides, quickstart, command reference, API reference |
| Kubernetes Operator | `guides-k8s/` | K8s deployment, operation, auth, telemetry, CRD reference |
| Virtual MCP Server | `guides-vmcp/` | Gateway/aggregation guides, quickstart, optimizer |
| Registry Server | `guides-registry/` | Registry Server deployment, config, auth, API reference |
| Integrations | `integrations/` | Cross-cutting third-party integration guides (ngrok, Vault, OpenTelemetry, Okta, etc.) |
| Concepts | `concepts/` | Cross-cutting explanations (MCP primer, groups, auth framework, observability, etc.) |
| MCP server guides | `guides-mcp/` | Per-server usage guides (auto-generated index) |
| Reference | `reference/` | Client compatibility, CLI commands, API specs, CRD specs, registry schemas |
| Tutorials | `tutorials/` | End-to-end tutorials that span multiple components (kept small; most tutorials moved to product sections or Integrations) |

### Section skeleton

Each product section follows this pattern:

```text
[Product Area]           (category label)
├── Introduction         (what it is, who it's for, where to start)
├── Quickstart           (hands-on in <10 minutes)
├── [How-to guides]      (organized by journey phase)
│   ├── Install / Deploy
│   ├── Use
│   ├── Secure
│   ├── Operate
│   └── Optimize
└── [Reference]          (inline where relevant)
```

Not every section needs every phase. The Introduction is an explicit first sidebar child, not a hidden category-link page.

### Where to place new content

- **Product-specific content** goes in the relevant product section (`guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`).
- **Quickstarts** live inside their product section, not in a separate top-level section.
- **Third-party integration guides** (connecting ToolHive with external tools/services) go in `integrations/`.
- **Cross-cutting concepts** (applicable to multiple product areas) go in `concepts/`.
- **Per-MCP-server usage guides** go in `guides-mcp/`.
- **Reference material** (specs, schemas, compatibility matrices) goes in `reference/`, with cross-links from the relevant product section.
- Update `/sidebars.ts` to include any new page in the navigation.

### Page requirements

Every how-to guide and tutorial page must include:

- Front matter with `title` and `description`.
- A "Next steps" section with 1-3 links to the next logical pages, following the journey phases (install, use, secure, operate, optimize).
- Cross-links to related content in other sections where relevant.

#### Description field guidelines

The `description` serves as both the DocCard preview (truncated at ~70-75 characters) and the page's `<meta>` description for SEO (ideally 80-150 characters total). Write descriptions so the first 70 characters stand alone as a useful summary. Lead with the action or topic, not filler like "Learn how to," "Understanding," or "A guide to." Avoid unquoted colons in YAML description values.

Pages that include closing sections must use this ordering:

1. **Next steps** (required for how-to guides and tutorials)
2. **Related information** (if applicable)
3. **Troubleshooting** (if applicable)

## Review process

When you are asked to review documentation changes, you are a subject matter expert (SME) for the content and a technical writer. Your role is to ensure that the content is accurate, clear, and consistent with the project's goals and standards.

- Prioritize clarity, accuracy, and consistency.
- Ensure that the content is easy to understand, follows the writing style guide.
- Do not consider markdown formatting or syntax, as these will be handled by the code quality tools.

## Writing style guide

The primary goal of the documentation is to be clear, concise, and user-friendly. The writing style should be approachable and easy to understand, while still providing the necessary technical details.

The project's official language is US English.

### Tone and voice

- Strive for a casual and conversational tone without becoming overly informal.
- Be friendly and relatable while retaining credibility and professionalism.
- Avoid slang and colloquial expressions.
- Use clear, straightforward language and avoid overly complex jargon to make content accessible to a wide audience.
- Use active voice instead of passive voice.
- Address the reader using the second person ("you", "your"). Avoid the first person ("we", "our") and third person ("the user", "a developer").
  - Exception: In `/blog/toolhive-updates` posts, it's acceptable to use the first person ("we", "our") to communicate updates from the ToolHive team.

### Capitalization

- Capitalize proper nouns like names, companies, and products. Generally, don't capitalize features or generic terms.
- Use sentence case in titles and headings.
- Use `<ALL_CAPS>` to indicate placeholder text/parameters, where the reader is expected to change a value.
- Expand acronyms on first use, then use the acronym in subsequent references.
  - Exception: MCP is used ubiquitously in this project, so it does not need to be expanded on first use.

### Punctuation

- Use the Oxford comma (aka serial commas) when listing items in a series.
- Use one space between sentences.
- Use straight double quotes and apostrophes. Replace smart quotes (“ ”) and curly apostrophes (‘ ’) with straight quotes (") and straight apostrophes (').
- Avoid em dashes (`—`) and en dashes (`–`). They are hard to type, easy to miss in editors, and have proliferated with AI-generated content. Instead, rephrase naturally: use commas, split into two sentences, or restructure. If a separator is truly needed, use a spaced hyphen (`-`) in list-style contexts like "Related information" entries.

### Links

- Use descriptive link text. Besides providing clear context to the reader, this improves accessibility for screen readers.
- When referencing other docs/headings by title, use sentence case so the reference matches the corresponding title or heading.

### Images

- Use images sparingly and only when they add value to the content.
- Use images to illustrate complex concepts, provide examples, or enhance understanding.
- Use screenshots to show UI elements or workflows, but ensure they are clear, relevant, and add value to the content.
- Don't use images of text, code samples, or terminal output. Use actual text so readers can copy/paste and find the contents via search engines.
- Add alt text to images to describe their content and purpose. This improves accessibility for users with visual impairments.

### Examples

- Use examples to clarify complex concepts or demonstrate how to use a feature.
- Prefer practical, real-world examples over abstract or contrived ones.

### Formatting

- Bold: use when referring to UI elements; prefer bold over quotes.
- Italics: emphasize particular words or phrases, such as when introducing/defining a term.
- Underscore: do not use; reserved for links.
- Use inline code formatting for short code elements, such as variable names, function names, or command-line options.
- Use block code formatting for longer code snippets or examples.

### Word list

ALWAYS use these exact terms and capitalizations. When editing documentation, replace any variations with the preferred terms listed here:

- ToolHive - this project, a collection of open source tools that help you run and manage MCP servers easily and securely
- Stacklok - the company behind ToolHive
- GitHub Copilot
- Model Context Protocol (MCP)
- open source (not "open-source")
- large language model (LLM)
- Visual Studio Code ("VS Code" after first use)
- Virtual MCP Server (vMCP) - a feature of ToolHive that aggregates multiple MCP servers into a single endpoint; use "Virtual MCP Server (vMCP)" on first use, "vMCP" thereafter

If you encounter a term not listed here that appears frequently in the documentation, consider adding it to this list for consistency.

## Markdown style

Prettier is used to enforce the following Markdown style conventions.

- Headings: use "ATX-style" headings
- Use unique headings within a document
- Unordered lists: use hyphens (`-`), not asterisks (`*`)
- Bold: Use the `**` syntax for bold text, not `__`
- Italics: Use the `__` syntax for italic text, not `*`
- Ordered lists: use lazy numbering for long or verbose lists.
  - Note: this is a "soft" recommendation. It is also intended only for Markdown documents that are read through a rendering engine. If the Markdown will be consumed in raw form like a repo README file, use real numbering.
- Code blocks: use fenced code blocks (` ``` ` to begin/end) and always declare the language. If the language is unknown or plain text like log output, use `text` as the language.
- Add blank lines around headings, lists, and code blocks.
- No trailing whitespace on lines.
  - Use the `\` character at the end of a line for a single-line break, not the two-space syntax which is easy to miss.
- Line limit: wrap lines at 80 characters; exceptions for links, tables, headings, and code blocks

### Docusaurus specifics

This website is built using Docusaurus, which has some specific requirements and conventions for Markdown files:

- Heading 1 is reserved for the page title, typically defined in the Markdown front matter section. Sections within a page begin with Heading 2 (`##`).
- Use relative file links (with .md/.mdx extensions) when referring to other pages.
- Use the `.mdx` file extension for pages (exception for auto-generated content).
- Use the front matter section on all pages. At a minimum, set the `title` (this is rendered into the page as an H1) and a short `description`.
- Use titles and line highlights in code blocks to provide context and improve readability.
  - Titles are added using the `title="..."` attribute in the opening code fence.
  - Line highlights are added using comma-separated `{number}` or `{start-end}` ranges in the opening code fence, or `highlight-next-line`, `highlight-start`, and `highlight-end` comments within the code block.
- Use admonitions for notes, tips, warnings, and other annotations. This provides a consistent look and feel across the site.
  - Use the `:::type` syntax to define the admonition type: `note`, `tip`, `info`, `warning`, `danger`, or `enterprise`. Use square brackets to add a custom title, e.g. `:::info[Title]`. Add empty lines around the start and end directives.
  - The `:::enterprise` admonition is for Stacklok Enterprise content only - see "Enterprise content constructs" below.
- Place images in `static/img` using WebP, PNG, or SVG format.
- Use the `ThemedImage` component to provide both light and dark mode screenshots for apps/UIs that support both. Typically used with the `useBaseUrl` hook to construct the image paths. Both require import statements.
- Use the `Tabs` and `TabItem` components to create tabbed content sections. These are in the global scope and do not require imports.
- Use the `EnterpriseBadge` component to label individual features or capabilities as enterprise-only. This is in the global scope and does not require imports. See "Enterprise content constructs" below.

### Enterprise content constructs

Three constructs are available for presenting Stacklok Enterprise content inline with OSS documentation. Use the right one for the context:

**`:::enterprise` admonition** - for callout content within OSS pages, typically 2-4 sentences describing an Enterprise capability with a link to the Enterprise landing page. Use when Enterprise adds a meaningful capability to the topic being documented. Don't overuse - one per page is typical, two is the practical maximum.

```mdx
:::enterprise

Stacklok Enterprise includes turnkey integrations for common identity providers. Instead of manually configuring OIDC, use the built-in Okta or Entra ID integration to map IdP groups directly to ToolHive roles and policy sets.

[Learn more about Stacklok Enterprise](/toolhive/enterprise).

:::
```

**`<EnterpriseBadge />`** - inline label for tagging individual features, capabilities, or configuration options as enterprise-only. Works next to headings, in lists, or inline with text. Use when a specific feature within a broader page is enterprise-only.

```mdx
### Session pinning <EnterpriseBadge />

- **Automatic failover** <EnterpriseBadge /> - connections are automatically rerouted when a node becomes unavailable.
```

**`className: 'enterprise-only'` sidebar badge** - for marking enterprise-only pages in the sidebar navigation. Applied in `sidebars.ts`, not in the page itself. Renders a small "ENT" pill badge with a tooltip on hover.

```ts title="sidebars.ts"
{
  type: 'doc',
  id: 'toolhive/guides-enterprise/config-server',
  className: 'enterprise-only',
}
```
