---
name: tech-writer
description: >
  Write clear, focused technical documentation following the Diataxis framework and the project style guide. Use whenever writing or substantively editing a documentation page: drafting a new page, rewriting or restructuring an existing one, adding a major section, or turning engineering material (PR descriptions, specs, release notes, rough notes) into user-facing docs. Use it even when the request doesn't mention writing quality; it governs how pages get written here. Other authoring skills (mcp-guide-writer, upstream-release-docs) should apply this skill's references during their drafting steps. Not for editorial review of finished work (use docs-review or review-docs-pr) and not for relocating pages (use move-page).
---

# Technical writing

Write documentation as a senior technical writer: clear, accurate, and focused on what the reader needs to accomplish. Every page has one primary reader need, and the discipline of this skill is deciding which one before writing a word, then keeping that purpose clear. Brief supporting context from another mode is often useful; it should help the reader without competing with the page's primary purpose.

Everything in this skill and its references is guidelines, not rules. Each one explains its reasoning so you can depart from it when doing so genuinely improves the content for the reader, knowing why you're departing. What's never optional is the judgment itself: a rule followed into an absurd result is as much a failure as a rule ignored.

## Canonical sources

Don't duplicate guidance; read it from where it lives:

- **`STYLE-GUIDE.md`** (repo root): the canonical style guide. Voice, tone, capitalization, punctuation, formatting, page structure, front matter, closing sections, Markdown conventions, and the word list. Read the sections relevant to your task before drafting. CLAUDE.md carries a condensed copy that is always in context, but STYLE-GUIDE.md is the source of truth when they differ.
- **CLAUDE.md** (always loaded): information architecture, section placement rules, and page requirements. Use it to decide where a page lives and what its skeleton must include.
- **This skill's references** (`references/`): Diataxis mode discipline and write-time anti-patterns, which neither of the above covers in depth.

## Workflow

1. **Classify.** Use the compass below to decide the page's primary mode. Include brief in-situ context from another mode when it helps the reader understand or complete the task. Split supporting material into a separate page only when it warrants a full discussion or workflow, or when it would compete with the page's primary purpose. Keep the modes distinguishable without creating a separate page for every type of content.
2. **Place.** Decide where the page or section lives using the information architecture rules in CLAUDE.md. Placement problems are more expensive to fix after merge than prose problems, so settle this before drafting.
3. **Read.** Read the reference file for your mode, plus `references/anti-patterns.md`, plus the STYLE-GUIDE.md sections your task touches. For a new page, also skim 1-2 existing pages of the same type in the same section so the new page reads like a sibling, not a transplant.
4. **Draft.** Outline first, weighting coverage by real-world use: the workflow most readers came for gets the worked example and the narrative; situational options get a sentence and a reference link; esoteric knobs stay in reference (see "Proportionality" in the anti-patterns file). Then write for the reader described in the mode reference, stating the most important thing first on the page and in each section.
5. **Self-check.** Before presenting the draft, reread it against the anti-patterns file and the mode's "keep out" list. Cut what fails. For substantial new content, follow up with the docs-review skill; for small edits, the self-check is enough.

## The compass: classifying content

Two questions determine the mode: does the content inform the reader's _action_ (doing) or _cognition_ (understanding), and does it serve the _acquisition_ of skill (learning) or the _application_ of skill (working)?

| Content...        | ...serves skill... | Mode        | It is...     |
| ----------------- | ------------------ | ----------- | ------------ |
| informs action    | acquisition        | tutorial    | a lesson     |
| informs action    | application        | how-to      | a recipe     |
| informs cognition | application        | reference   | a map        |
| informs cognition | acquisition        | explanation | a discussion |

A quick tiebreaker: ask what the reader is doing when they open the page. Learning by following along means tutorial. Getting a real task done means how-to guide. Looking something up means reference. Trying to understand why or how something works means explanation.

## The four modes in this site

- **Tutorial** - a guided lesson where you take responsibility for the reader's success. Quickstarts inside product sections and the pages under `tutorials/`. Read `references/tutorials.md`.
- **How-to guide** - a recipe for a competent user with a real task. The bulk of the site: `guides-ui/`, `guides-cli/`, `guides-k8s/`, `guides-vmcp/`, `guides-registry/`, `integrations/`, `guides-mcp/`. Read `references/how-to-guides.md`.
- **Reference** - neutral, complete description of the machinery. `reference/` and the reference pages inside product sections. Much of it is auto-generated; check CLAUDE.md's auto-generated content rules before touching anything there. Read `references/reference.md`.
- **Explanation** - understanding-oriented discussion of concepts, background, and design reasoning. `concepts/` and product Introduction pages. Read `references/explanation.md`.

## Reference files

| When you are... | Read |
| --- | --- |
| Writing or editing a tutorial or quickstart | `references/tutorials.md` |
| Writing or editing a how-to guide | `references/how-to-guides.md` |
| Writing or editing reference material | `references/reference.md` |
| Writing or editing concept/explanation content | `references/explanation.md` |
| Drafting anything (always, before self-check) | `references/anti-patterns.md` |

## Self-check

Before presenting a draft, verify:

- [ ] The page has a clear primary mode. Supporting context from another mode helps that purpose; material that warrants a full discussion or competing workflow was split out and linked.
- [ ] The most important point leads the page and each section; no buried ledes.
- [ ] Coverage is proportional to real-world use: the common workflow carries the page, situational options get a sentence and a reference link, and nothing is documented just because it exists.
- [ ] Every factual claim about behavior, flags, fields, or defaults was verified against source, specs, or generated reference docs, not recalled from memory.
- [ ] Code examples work as written: real values for fixed things, `<ALL_CAPS>` placeholders for reader-supplied values, reserved domains (`example.com`) in URLs.
- [ ] The draft passes the anti-patterns file: no changelog framing, negative restatement, redundant admonitions, hedging, listitis, or em-dash rhythm.
- [ ] Front matter has `title` and a `description` whose first 70 characters stand alone.
- [ ] How-to guides and tutorials end with Next steps (then Related information, then Troubleshooting, in that order, as applicable).
- [ ] The page is reachable: sidebar entry in `sidebars.ts` plus inbound links from related pages.
- [ ] Terminology matches the STYLE-GUIDE.md word list.
