# Style guide for Stacklok docs <!-- omit in toc -->

This style guide is a reference for anyone who contributes to the user-facing
Stacklok docs contained in this repository. By adhering to these guidelines, we
aim to deliver clear, concise, and valuable information to project users.

## Contents <!-- omit in toc -->

- [Content framework](#content-framework)
- [Writing style](#writing-style)
  - [Language](#language)
  - [Tone and voice](#tone-and-voice)
    - [Active voice](#active-voice)
    - [Speak to the reader](#speak-to-the-reader)
  - [Capitalization](#capitalization)
  - [Punctuation](#punctuation)
  - [Links](#links)
  - [Formatting](#formatting)
- [Screenshots and images](#screenshots-and-images)
- [Markdown style](#markdown-style)
- [Projects](#projects)
- [Word list \& glossary](#word-list--glossary)
  - [Products/brands](#productsbrands)

## Content framework

We follow the [Diátaxis framework](https://diataxis.fr/#) of documentation
structure, which defines four distinct types of documentation: tutorials, how-to
guides, reference, and explanation.

This guide does not seek to reproduce the definitions and background found on
the Diátaxis site. The best starting point for background is
[Applying Diátaxis](https://diataxis.fr/application/).

## Writing style

This list is not exhaustive, it is intended to reflect the most common and
important style elements. For a more comprehensive guide that aligns with our
style goals, or if you need more details about any of these points, refer to the
[Google developer documentation style guide](https://developers.google.com/style).

### Language

The project's official language is **US English**.

### Tone and voice

Strive for a casual and conversational tone without becoming overly informal. We
aim to be friendly and relatable while retaining credibility and professionalism
– approachable yet polished.

Avoid slang and colloquial expressions. Use clear, straightforward language and
avoid overly complex jargon to make content accessible to a wide audience.

#### Active voice

Use **active voice** instead of passive voice. Active voice emphasizes the
subject performing the action, making the writing more direct and engaging.
Passive voice focuses on the recipient of the action rather than the actor,
often resulting in unclear sentences and misinterpretation of responsibility.

:white_check_mark: Yes: Replace `docker` with `podman` in all commands if you
use Podman.\
:x: No: `docker` should be replaced with `podman` in all commands if Podman is
used.

#### Speak to the reader

Address the reader using the **second person** ("you", "your"). Avoid the first
person ("we", "our") and third person ("the user", "a developer").

### Capitalization

Capitalize **proper nouns** like names, companies, and products. Generally,
**don't** capitalize features or generic terms. For non-Stacklok terms, follow
the norms of the third-party project/company (ex: npm is stylized in lowercase,
even when it begins a sentence).

:white_check_mark: Yes: ToolHive includes a built-in registry of MCPs...\
:x: No: ToolHive includes a built-in Registry of MCPs...

Use **sentence case** in titles and headings.

:white_check_mark: Yes: Alternative run commands\
:x: No: Alternative Run Commands

Use `ALL_CAPS` to indicate placeholder text/parameters, where the reader is
expected to change a value.

### Punctuation

**Oxford comma**: use the Oxford comma (aka serial commas) when listing items in
a series.

:white_check_mark: Yes: ToolHive requires minimal CPU, memory, and disk space.\
:x: No: ToolHive requires minimal CPU, memory and disk space.

**Quotation marks**: use straight double quotes and apostrophes, not "fancy
quotes" or "smart quotes" (the default in document editors like Word/Docs). This
is especially important in code examples where smart quotes often cause syntax
errors.

Tip: if you are drafting in Google Docs, disable the "Use smart quotes" setting
in the Tools → Preferences menu to avoid inadvertently copying smart quotes into
Markdown or other code.

### Links

Use descriptive link text. Besides providing clear context to the reader, this
improves accessibility for screen readers.

:white_check_mark: Yes: For more information, see
[Purpose and scope](?tab=t.0#heading=h.qaqvuha5efk).\
:x: No: For more information, see
[this section](?tab=t.0#heading=h.qaqvuha5efk).

Note on capitalization: when referencing other docs/headings by title, use
sentence case so the reference matches the corresponding title or heading.

### Formatting

**Bold**: use when referring to UI elements; prefer bold over quotes. For
example: Click **Add Rule** and select the rule you want to add to the profile.

**Italics**: emphasize particular words or phrases, such as when
introducing/defining a term. For example: A _profile_ defines which security
policies apply to your software supply chain.

**Underscore**: do not use; reserved for links.

**Code**: use a `monospaced font` for inline code or commands, code blocks, user
input, filenames, method/class names, and console output.

## Screenshots and images

Considerations for screenshots and other images:

- Don't over-use screenshots:
  - Screenshots are useful for complex UIs or to point out specific elements
    that are otherwise hard to describe with text. But for example, an input
    form doesn't need a screenshot when text can just as easily list the fields
    and their purpose.
  - Screenshots age rapidly.
  - Too many screenshots can become visually overwhelming and interrupt the flow
    of documentation.
- Don't use images of text, code samples, or terminal output. Use actual text so
  readers can copy/paste and find the contents via search engines.
- Use alt text to describe images for readers using screen readers and to assist
  search engines.
- Be consistent when taking screenshots - use the same OS if possible (macOS has
  been used in Stacklok docs to date) and zoom level (ex: zoom twice in VS Code,
  125% in browsers).
- Crop screenshots to the relevant portion of the interface.
- Use the primary brand color (`#5058ff`) for annotations like callouts and
  highlight boxes.

## Markdown style

Just like a consistent writing style is critical to clarity and messaging,
consistent formatting and syntax are needed to ensure the maintainability of
Markdown-based documentation.

We generally adopt the
[Google Markdown style guide](https://google.github.io/styleguide/docguide/style.html),
which is well-aligned with default settings in formatting tools like Prettier
and `markdownlint`.

Our preferred style elements include:

- Headings: use "ATX-style" headings (hash marks - `#` for Heading 1, `##` for
  Heading 2, and so on); use unique headings within a document
- Unordered lists: use hyphens (`-`), not asterisks (`*`)
- Ordered lists: use lazy numbering (`1.` for every item and let Markdown render
  the final order – this is more maintainable when inserting new items)
  - Note: this is a "soft" recommendation. It is also intended only for Markdown
    documents that are read through a rendering engine. If the Markdown will be
    consumed in raw form, use real numbering.
- Code blocks: use fenced code blocks (` ``` ` to begin/end) and explicitly
  declare the language, like ` ```python ` or ` ```plain `
- Add blank lines around headings, lists, and code blocks
- No trailing whitespace on lines
  - Use the `\` character at the end of a line for a single-line break, not the
    two-space syntax which is easy to miss
- Line limit: wrap lines at 80 characters; exceptions for links, tables,
  headings, and code blocks

Specific guidelines for Docusaurus:

- Heading 1 is reserved for the page title, typically defined in the Markdown
  front matter section. Sections within a page begin with Heading 2 (`##`).
  [Reference](https://docusaurus.io/docs/markdown-features/toc)
- Use relative file links (with .md/.mdx extensions) when referring to other
  pages. [Reference](https://docusaurus.io/docs/markdown-features/links)
- Use the .mdx extension for pages containing JSX includes. Docusaurus v3
  currently runs all .md and .mdx files through an MDX parser but this will
  change in a future version.
  [Reference](https://docusaurus.io/docs/migration/v3#using-the-mdx-extension)
- Use the front matter section on all pages. At a minimum, set the `title` (this
  is rendered into the page as an H1) and a short `description`.
  [Reference](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter)
- Place images in `static/img` using WebP, PNG, or SVG format.
- Use the
  [`ThemedImage` component](https://docusaurus.io/docs/markdown-features/assets#themed-images)
  to provide both light and dark mode screenshots for apps/UIs that support
  both.

## Projects

These are the projects we work on, and a short description of each one.

**ToolHive**: [ToolHive](https://github.com/stacklok/toolhive) is a lightweight
utility designed to simplify the deployment and management of MCP (Model Context
Protocol) servers, ensuring ease of use, consistency, and security. It's the
simplest and safest way to use MCP (Model Context Protocol). Start from a set of
curated MCP images and run MCP clients in lightweight, locked-down containers
that give you control of permissions (cause you don’t want those MCP clients
digging around anywhere they don’t belong). It's written bi-capitalized as one
word (not "Toolhive" or "Tool Hive").

## Word list & glossary

Common terms used in Stacklok content:

**open source**: we prefer using two words over the hyphenated form (not
"open-source"). It's not a proper noun, so don't capitalize unless it starts a
sentence.

**OSS**: abbreviation for "open source software".

**Stacklok**: our company! It's written as one word with a single capital (not
"StackLok" or "Stacklock").

### Products/brands

**aider** - an open source AI pair programmer in your terminal. It's written
lowercase unless it starts a sentence.

**Continue** - an open source AI coding assistant for IDEs that connects to many
model providers. It's written as just "Continue" (not "Continue.dev", which is
their website).

**Copilot** - GitHub's AI coding assistant. It's written with only a leading
capital (not "CoPilot").

**Git**: the most popular distributed version control system. It underpins most
commercial VCS offerings like GitHub, Bitbucket, and GitLab. Unless specifically
referring to the `git` command line tool, it's a proper noun and should be
capitalized.

**GitHub**: the most popular source code hosting provider, especially for open
source. It's written bi-capitalized as one word (not "Git Hub" or "Github").

**JetBrains**: a company that makes IDEs for many languages, including IntelliJ
IDEA, PyCharm, GoLand, and more. It's written bi-capitalized as one word (not
"Jet Brains" or "Jetbrains"). It's proper to reference a specific JetBrains IDE
when needed, or simply refer to "all JetBrains IDEs".

**LLM**: large language model, a type of machine learning model designed for
natural language processing tasks. LLM is an abbreviation, so it's written in
all caps. Written out, it is lower-cased.

**MCP**: Model Context Protocol. MCP is an open protocol that standardizes how
applications provide context to LLMs. MCP is an abbreviation, so it's written in
all caps. Written out, it is proper-cased.

**npm**: the registry for JavaScript packages (the "npm registry"), and the
default package manager for JavaScript. Since it's both the registry _and_ the
package manager, it may be useful to disambiguate "the npm registry". It's not
an abbreviation, so it's not capitalized; it's written all lowercase (not
"NPM").

**OpenAI**: the company behind the GPT models and ChatGPT. It's written
bi-capitalized as one word (not "Open AI" or "Openai").

**Visual Studio Code**: a very popular free integrated development environment
(IDE) from Microsoft. Per Microsoft's
[brand guidelines](https://code.visualstudio.com/brand#brand-name), use the full
"Visual Studio Code" name the first time you reference it. "VS Code" is an
acceptable short form after the first reference. It's written as two words and
there are no other abbreviations/acronyms (not "VSCode", "VSC", or just "Code").

<!-- markdownlint-disable-file MD044 -->
