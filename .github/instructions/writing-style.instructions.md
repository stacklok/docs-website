---
applyTo: '**/*.md,**/*.mdx'
---

# Writing and markdown instructions for documentation

## Audience

The primary audience for this documentation is developers and DevOps
professionals who want to run and manage Model Context Protocol (MCP) servers
using ToolHive. They may be new to MCP servers or have some experience with
them.

The documentation should be accessible to a wide range of technical users,
including those who may not be familiar with the specific technologies used in
ToolHive.

## Language, tone, and voice

- The project's official language is US English.

### Tone and voice

- Strive for a casual and conversational tone without becoming overly informal.
- Be friendly and relatable while retaining credibility and professionalism.
- Avoid slang and colloquial expressions.
- Use clear, straightforward language and avoid overly complex jargon to make
  content accessible to a wide audience.
- Use active voice instead of passive voice.
- Address the reader using the second person ("you", "your"). Avoid the first
  person ("we", "our") and third person ("the user", "a developer").

### Capitalization

- Capitalize proper nouns like names, companies, and products. Generally, don't
  capitalize features or generic terms.
- Use sentence case in titles and headings.
- Use `ALL_CAPS` to indicate placeholder text/parameters, where the reader is
  expected to change a value.
- Expand acronyms on first use, then use the acronym in subsequent references.
  - Exception: MCP is used ubiquitously in this project, so it does not need to
    be expanded on first use.

### Punctuation

- Use the Oxford comma (aka serial commas) when listing items in a series.
- Use one space between sentences.
- Use straight double quotes and apostrophes. Replace smart quotes (“ ”) and
  curly apostrophes (’ ’) with straight quotes (") and straight apostrophes (').

### Links

- Use descriptive link text. Besides providing clear context to the reader, this
  improves accessibility for screen readers.
- When referencing other docs/headings by title, use sentence case so the
  reference matches the corresponding title or heading.

### Images

- Use images sparingly and only when they add value to the content.
- Use images to illustrate complex concepts, provide examples, or enhance
  understanding.
- Use screenshots to show UI elements or workflows, but ensure they are clear,
  relevant, and add value to the content.
- Don't use images of text, code samples, or terminal output. Use actual text so
  readers can copy/paste and find the contents via search engines.
- Add alt text to images to describe their content and purpose. This improves
  accessibility for users with visual impairments.

### Examples

- Use examples to clarify complex concepts or demonstrate how to use a feature.
- Prefer practical, real-world examples over abstract or contrived ones.

### Formatting

- Bold: use when referring to UI elements; prefer bold over quotes.
- Italics: emphasize particular words or phrases, such as when
  introducing/defining a term.
- Underscore: do not use; reserved for links.
- Use inline code formatting for short code elements, such as variable names,
  function names, or command-line options.
- Use block code formatting for longer code snippets or examples.

### Word list

Common terms used in this project:

- ToolHive - this project, an open source tool that helps you run and manage MCP
  servers easily and securely
- Stacklok - the company behind ToolHive
- GitHub Copilot
- Model Context Protocol (MCP)
- open source (not "open-source")
- large language model (LLM)
- Visual Studio Code ("VS Code" after first use)

Check this list for consistent use within the documentation. If you find
inconsistencies, update the text to match the preferred term. If you find a term
that is not listed here, consider adding it to the list for future reference.

## Markdown style

Prettier and markdownlint are used to enforce the following Markdown style
conventions.

- Headings: use "ATX-style" headings
- Use unique headings within a document
- Unordered lists: use hyphens (`-`), not asterisks (`*`)
- Bold: Use the `**` syntax for bold text, not `__`
- Italics: Use the `__` syntax for italic text, not `*`
- Ordered lists: use lazy numbering for long or verbose lists.
  - Note: this is a "soft" recommendation. It is also intended only for Markdown
    documents that are read through a rendering engine. If the Markdown will be
    consumed in raw form like a repo README file, use real numbering.
- Code blocks: use fenced code blocks (` ``` ` to begin/end) and always declare
  the language. If the language is unknown or plain text like log output, use
  `text` as the language.
- Add blank lines around headings, lists, and code blocks.
- No trailing whitespace on lines.
  - Use the `\` character at the end of a line for a single-line break, not the
    two-space syntax which is easy to miss. Exception:
- Line limit: wrap lines at 80 characters; exceptions for links, tables,
  headings, and code blocks

### Docusaurus specifics

This website is built using Docusaurus, which has some specific requirements and
conventions for Markdown files:

- Heading 1 is reserved for the page title, typically defined in the Markdown
  front matter section. Sections within a page begin with Heading 2 (`##`).
- Use relative file links (with .md/.mdx extensions) when referring to other
  pages.
- Use the .mdx extension for pages containing JSX includes.
- Use the front matter section on all pages. At a minimum, set the `title` (this
  is rendered into the page as an H1) and a short `description`.
- Use the `admonition` component for notes, tips, warnings, and other
  annotations. This provides a consistent look and feel across the site.
  - Use the `:::type` syntax to define the admonition type, such as `note`,
    `tip`, `info`, `warning`, or `danger`.
- Place images in `static/img` using WebP, PNG, or SVG format.
- Use the `ThemedImage` component to provide both light and dark mode
  screenshots for apps/UIs that support both.
- Use the `Tabs` and `TabItem` components to create tabbed content sections.
