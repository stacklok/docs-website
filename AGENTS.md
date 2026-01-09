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
- `npm run eslint` and `npm run eslint:fix`: check and fix code quality issues (`.js`, `.jsx`, `.ts`, `.tsx`, `.mdx` files only).
- `npm run markdownlint` and `npm run markdownlint:fix`: check and fix Markdown style issues (`.md` files only - DO NOT use with `.mdx` files).

## Contribution guidelines

- Use the GitHub flow for contributions: create a branch, make changes, open a pull request (PR).
- Use the pull request template (`/.github/pull_request_template.md`) when opening a PR on behalf of the user.
- Ensure all changes pass linting and formatting checks before submitting a PR.
- Write concise commit messages, limited to 50 characters for the subject line, with a detailed body only if necessary.
- Do NOT use conventional commits style; use imperative mood in the subject line (e.g., "Add", "Fix", "Update").

## Automated quality checks

The project uses automated tooling to enforce code quality and formatting standards:

- **Pre-commit hooks**: lint-staged runs automatically on `git commit`, applying prettier and appropriate linters to staged files.
- **GitHub Actions**: All PRs trigger automated checks (ESLint, markdownlint, Prettier).
- **No manual formatting needed**: The pre-commit hook handles formatting automatically - you do not need to run formatters manually.

File type to linter mapping (handled automatically by pre-commit hooks):

- `.md` files: Prettier + markdownlint
- `.mdx` files: Prettier + ESLint (NOT markdownlint)
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

This project follows the [Diataxis framework](https://diataxis.fr/) for documentation organization. Diataxis divides documentation into four types based on user needs:

1. **Tutorials** (`/docs/toolhive/tutorials/`) - Learning-oriented, step-by-step lessons that guide users through completing a project or learning a concept.
2. **How-to guides** (`/docs/toolhive/guides-*/`) - Task-oriented, practical guides that show how to solve specific problems or accomplish specific tasks.
3. **Reference** (`/docs/toolhive/reference/`) - Information-oriented, technical descriptions of the machinery and how to operate it (API docs, CLI commands, configuration options).
4. **Explanation/Concepts** (`/docs/toolhive/concepts/`) - Understanding-oriented, explanations that clarify and illuminate topics, provide background and context.

### When to create new pages

Create a new documentation page when:

- The content addresses a distinct task, concept, or reference topic that doesn't fit within existing pages.
- An existing page would become too long or cover too many disparate topics.
- The information architecture requires it (e.g., a new MCP server guide, a new tutorial).
- The content belongs to a different Diataxis category than existing content.

Always consider where the new page fits in the Diataxis framework and place it in the appropriate directory. Update `/sidebars.ts` to include the new page in the navigation.

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
- Use straight double quotes and apostrophes. Replace smart quotes (“ ”) and curly apostrophes (’ ’) with straight quotes (") and straight apostrophes (').

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

Prettier and markdownlint are used to enforce the following Markdown style conventions.

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
  - Use the `:::type` syntax to define the admonition type: `note`, `tip`, `info`, `warning`, or `danger`. Use square brackets to add a custom title, e.g. `:::info[Title]`. Add empty lines around the start and end directives.
- Place images in `static/img` using WebP, PNG, or SVG format.
- Use the `ThemedImage` component to provide both light and dark mode screenshots for apps/UIs that support both. Typically used with the `useBaseUrl` hook to construct the image paths. Both require import statements.
- Use the `Tabs` and `TabItem` components to create tabbed content sections. These are in the global scope and do not require imports.
