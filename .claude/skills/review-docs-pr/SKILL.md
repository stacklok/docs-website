---
name: review-docs-pr
description: >
  Review a docs-website pull request as a subject matter expert and tech writer: read the PR at its head ref, apply the docs-review criteria to the changed pages, verify factual claims against source, and draft a body-level review for approval. Use whenever the user wants a PR evaluated, even informally: "review PR 1069", "take a look at the registry docs PR", "thoughts on this?" with a PR URL, or an initial reaction to a PR they want checked. For reviewing loose files or uncommitted changes (no PR involved), use docs-review directly.
argument-hint: '<pr-number-or-url>'
---

# Review a documentation PR

Review the PR's content for accuracy, clarity, and consistency with the project's standards. The output is a draft review shown to the user; never post anything to GitHub without explicit approval.

## Gather the PR state

1. Fetch PR metadata: title, body, author, state, `headRefName`, `baseRefName`, and the diff (`gh pr view`, `gh pr diff`, or the GitHub MCP tools if available).
2. **Read the changed files at the PR's head ref**, not from the local working tree: `git fetch origin <headRefName>` and read files at that ref (`git show <ref>:<path>`), or check out the branch. Local files may be on a different branch or stale; reviewing them produces wrong line references and stale feedback.
3. Read the full changed pages, not just the diff hunks. A diff-only read misses duplication with adjacent sections, contradictions with unchanged prose, and admonitions that restate the text right above them.

## Check existing review state

Before drafting, look at reviews and threads already on the PR:

- Don't re-raise a point another reviewer already made; agreeing briefly is fine, duplicating is noise.
- A thread that was resolved without the suggested change being applied is an intentional dismissal; don't re-raise it as a new finding.
- For bot-generated release PRs (Renovate/github-actions authors), check whether a human has already pushed fix-up commits; review the current state, not the bot's original.

## Review the content

Apply the docs-review skill's criteria (information architecture, LLM-pattern table, accuracy, style guide compliance). Invoke `/docs-review` for the full criteria if not already loaded. In addition:

- **Verify factual claims at the source.** For content documenting product behavior, the code is the primary source and the docs are what's being verified: check flags, fields, defaults, and API routes against the upstream repo at the relevant tag, not against other docs or memory.
- **Check the PR's own claims.** If the PR body says "build passes" or "links verified", spot-check rather than trusting it.
- **Scope findings to the PR.** Pre-existing issues in surrounding content can be noted as out-of-scope observations or follow-up issue candidates, not blocking findings.

## Draft the review

Structure the draft as:

1. A one-or-two-sentence overall verdict (approve / needs changes, and why).
2. Primary issues (must address before merge), each with the file and a concrete fix.
3. Secondary issues (worth fixing, not blocking).
4. Out-of-scope observations, if any, framed as follow-up candidates.

Keep it a **body-level review only**: no inline (per-line) review comments. Diff line anchors are unreliable and pending inline comments can conflict with reviews a human has in progress.

## Get approval before posting

Show the draft to the user and stop. Post to GitHub only after explicit go-ahead, using the review action the user chooses (`gh pr review --comment`, `--approve`, or `--request-changes`). The user may also take the draft and post it themselves; that's a normal outcome, not a failure.
