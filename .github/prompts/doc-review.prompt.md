---
mode: agent
tools: ['codebase', 'problems', 'changes', 'editFiles', 'runCommands']
description: 'Perform a documentation clarity and style review'
---

Perform a review of the documentation provided in the context.

If explicit content is not provided, perform a review of all changes between the
current branch and the `main` branch, including committed and unstaged changes.
Use a PR-style approach: review all changed files, including documentation and
code, and provide actionable feedback.

**Review instructions:**

- Focus on clarity, conciseness, technical accuracy, and adherence to the
  writing style guide.
- For documentation, check tone, accessibility, and user-friendliness for
  developers and DevOps professionals.
- For code, check correctness, readability, maintainability, and adherence to
  project conventions.
- Use inline comments or suggestions for specific lines or sections.
- Summarize major issues and list minor suggestions.
- Indicate whether you would "approve", "request changes", or "comment" as in a
  typical PR review.

Refer to the writing style guide:
[copilot-instructions.md](../copilot-instructions.md)

You can run `editFiles` to make changes based on your review. You can also run
`runCommands` to test the site or check for errors:

- `npm run build` to build the documentation site.
- `npm run start` to start the local development server.
- `npm run prettier` to check formatting.
- `npm run markdownlint` to check for linting errors.
- `npm run eslint` to check for JavaScript/TypeScript linting errors.
