#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Render the release workflow's marked section without contacting GitHub.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const START = '<!-- upstream-release-docs:start -->';
const END = '<!-- upstream-release-docs:end -->';
const countLines = (value) => value.split('\n').filter(Boolean).length;

export function renderSection(env) {
  const v = new Proxy(
    { ...env, START, END },
    { get: (target, key) => target[key] ?? '' }
  );
  v.COMPARE_URL = `https://github.com/${v.REPO}/compare/${v.PREV_TAG}...${v.NEW_TAG}`;
  v.GAPS_COUNT = v.GAPS_BLOCK.split('\n').filter((line) =>
    /^### /.test(line)
  ).length;
  v.AUTOGEN_DRIFT = v.AUTOGEN_TOUCHED;
  const silent =
    v.SKILL_COMMIT_COUNT === '0' &&
    !v.NOTE_BLOCK &&
    v.GEN_CONCLUSION === 'success' &&
    v.REVIEW_CONCLUSION === 'success';
  v.UNRESOLVED_COUNT ||= '0';
  v.FYI_COUNT ||= '0';
  v.ACTION_REQUIRED = v.AUTOGEN_DRIFT
    ? '**Yes** — revert auto-generated-path drift (see above)'
    : v.GAPS_COUNT > 0
      ? `**Yes** — resolve ${v.GAPS_COUNT} gap(s), then spot-check prose`
      : Number(v.UNRESOLVED_COUNT) > 0
        ? `**Yes** — manually route ${v.UNRESOLVED_COUNT} unresolved review(s)`
        : silent
          ? '**None** — approve and merge if the silent-run signal is expected'
          : v.SKILL_COMMIT_COUNT && v.SKILL_COMMIT_COUNT !== '0'
            ? 'Spot-check skill-authored prose for accuracy'
            : '—';
  v.CHANGES_CELL = v.SKILL_COMMIT_COUNT
    ? `${v.SKILL_COMMIT_COUNT} commit(s)`
    : '—';
  v.REFRESH_CELL =
    { true: 'refreshed (separate commit)', false: 'unchanged' }[v.REFRESHED] ??
    '—';
  const assigned = countLines(v.ASSIGN_LIST.replaceAll(',', '\n'));
  v.CONTRIB_CELL = !v.COMPARE_OK
    ? '**Not attempted** — run failed before reviewer assignment'
    : v.COMPARE_OK !== 'true'
      ? `**Compare failed** — pinned \`${v.PREV_TAG}\` missing upstream, no auto-assignment`
      : assigned > 0
        ? `${assigned} review requested (see sidebar)`
        : 'none in release range';
  if (Number(v.FYI_COUNT) > 0)
    v.CONTRIB_CELL += ` · ${v.FYI_COUNT} not requested (no docs impact)`;
  if (Number(v.UNRESOLVED_COUNT) > 0)
    v.CONTRIB_CELL += ` · **${v.UNRESOLVED_COUNT} review routing issue(s)**`;
  v.OWNER_CELL = v.OWNER
    ? `@${v.OWNER}`
    : '**Unresolved** - no human found for this release; a docs maintainer needs to adopt this PR';
  if (v.OWNER && v.OWNER_ASSIGNED !== 'true')
    v.OWNER_CELL += " (couldn't set as assignee)";
  if (v.OWNER && v.OWNER_SOURCE)
    v.OWNER_CELL += ` - identified from ${v.OWNER_SOURCE}`;
  const lines = [];
  const emit = (line = '') => lines.push(line);
  emit(`${v.START}`);
  emit(``);
  emit(`## Docs update for \`${v.PROJECT_ID}\` ${v.NEW_TAG}`);
  emit(``);
  if (v.AUTOGEN_DRIFT) {
    emit(`> [!CAUTION]`);
    emit(`> **Auto-generated-path drift**: the skill edited files that should`);
    emit(`> only come from the refresh step. Review and revert:`);
    emit(`>`);
    for (const entry of v.AUTOGEN_DRIFT.split(',')) emit(`> - \`${entry}\``);
    emit();
  } else if (v.NOTE_BLOCK) {
    emit(`> [!NOTE]`);
    emit(`> Skill reported **no doc-relevant changes** for this release.`);
    emit(`> This PR only bumps the version pin and any pin_files edits.`);
    emit(``);
  } else if (silent) {
    emit(`> [!NOTE]`);
    emit(`> **Silent run** — skill produced no content commits. The docs are`);
    emit(
      `> likely already up-to-date (e.g. \`main\` ahead of pin, or a re-run`
    );
    emit(`> after a previous PR for this tag merged). Only the version bump`);
    emit(`> and refreshed reference assets are included.`);
    emit(``);
  }
  emit(`### At a glance`);
  emit(``);
  emit(`| | |`);
  emit(`| --- | --- |`);
  emit(
    `| **Upstream** | \`${v.REPO}\` [\`${v.PREV_TAG}\` → \`${v.NEW_TAG}\`](${v.COMPARE_URL}) |`
  );
  emit(`| **Hand-written changes** | ${v.CHANGES_CELL} |`);
  emit(`| **Reference assets** | ${v.REFRESH_CELL} |`);
  emit(`| **Gaps** | ${v.GAPS_COUNT} |`);
  emit(`| **Owner** | ${v.OWNER_CELL} |`);
  emit(`| **Release contributors** | ${v.CONTRIB_CELL} |`);
  emit(`| **Action required** | ${v.ACTION_REQUIRED} |`);
  emit(``);
  emit(`### Who does what`);
  emit(``);
  if (v.OWNER) {
    emit(
      `@${v.OWNER} cut this release and owns this PR: review your own changes, chase the remaining approvals, and merge once they're in. You don't need to wait on a review from anyone listed as having no docs impact below.`
    );
  } else {
    emit(
      `No release owner could be resolved automatically, so this PR has no assignee. A docs maintainer needs to adopt it, collect approvals, and merge.`
    );
  }
  emit(``);
  emit(
    `Everyone with a review request: the target is a review and approval within **2 business days**.`
  );
  emit(``);
  if (v.SUMMARY_BLOCK) {
    emit(`### Summary of changes`);
    emit(``);
    emit(`${v.SUMMARY_BLOCK}`);
    emit(``);
  }
  if (v.GAPS_BLOCK) {
    emit(v.GAPS_BLOCK.replace(/^### /gm, '#### ').replace(/^## /gm, '### '));
    emit();
  }
  if (Number(v.FYI_COUNT) > 0) {
    emit(`### No docs impact identified`);
    emit(``);
    emit(
      `${v.FYI_COUNT} contributor(s) had no-docs-impact commits in this release. No review was requested, and the workflow did not auto-notify them.`
    );
    emit(``);
  }
  const standins = countLines(v.STANDIN_BLOCK);
  if (standins > 0 || Number(v.UNRESOLVED_COUNT) > 0) {
    emit(`### Review routing`);
    emit(``);
    if (standins > 0) {
      emit(
        `GitHub could not request the upstream contributor directly, so review went to the human merger of each relevant upstream PR:`
      );
      emit(``);
      for (const line of v.STANDIN_BLOCK.split('\n')) emit(`- ${line}`);
      emit();
    }
    if (Number(v.UNRESOLVED_COUNT) > 0) {
      emit(`These reviews require manual routing:`);
      emit(``);
      for (const line of v.UNRESOLVED_BLOCK.split('\n')) emit(`- ${line}`);
      emit();
    }
  }
  if (v.GEN_TURNS || v.REVIEW_TURNS) {
    emit(`### Run cost`);
    emit(``);
    emit(`| Session | Turns | Cost (USD) |`);
    emit(`| --- | ---: | ---: |`);
    if (v.GEN_TURNS) {
      emit(`| Generation | ${v.GEN_TURNS} | $${v.GEN_COST} |`);
    }
    if (v.REVIEW_TURNS) {
      emit(`| Editorial review | ${v.REVIEW_TURNS} | $${v.REVIEW_COST} |`);
    }
    if (v.GEN_TURNS && v.REVIEW_TURNS) {
      v.TOTAL_TURNS = Number(v.GEN_TURNS) + Number(v.REVIEW_TURNS);
      v.TOTAL_COST = (Number(v.GEN_COST) + Number(v.REVIEW_COST)).toFixed(4);
      emit(`| **Total** | **${v.TOTAL_TURNS}** | **$${v.TOTAL_COST}** |`);
    }
    emit();
  }
  emit(`<details><summary>How this PR was built</summary>`);
  emit(``);
  emit(`Two Claude Opus sessions run per release: a generation pass`);
  emit(`(\`upstream-release-docs\` skill, 6 phases) followed by a fresh-`);
  emit(`context editorial pass (\`docs-review\`). Prettier/ESLint`);
  emit(`auto-fixes are applied after.`);
  emit(``);
  emit(`Auto-synced paths — do not hand-edit these in review:`);
  emit(`- \`static/api-specs/\``);
  emit(`- \`docs/toolhive/reference/cli/\` (toolhive only)`);
  for (const dir of v.CRD_PAGES_DIRS.trim().split(/\s+/).filter(Boolean))
    emit(`- \`${dir}/\``);
  emit(``);
  emit(`If a "Gaps needing human context" section is present above,`);
  emit(`each entry includes a paste-ready **Helper prompt for local`);
  emit(`Claude** a reviewer can use to resolve the gap.`);
  emit(``);
  emit(`</details>`);
  emit(``);
  emit(`${v.END}`);
  return lines.join('\n') + '\n';
}

export function renderBody(existing, env) {
  const section = renderSection(env);
  // Shell command substitution stripped trailing newlines from the old body.
  const body = existing.replace(/\n+$/, '');
  if (!body.includes(START)) return `${body}\n\n---\n\n${section}`;
  let inside = false;
  const lines = [];
  for (const line of body.split('\n')) {
    if (line === START) {
      inside = true;
      lines.push(section.replace(/\n$/, ''));
    } else if (line === END && inside) {
      inside = false;
    } else if (!inside) {
      lines.push(line);
    }
  }
  return lines.join('\n') + '\n';
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const pr = process.env.PR_NUMBER;
  if (!/^[1-9][0-9]*$/.test(pr ?? ''))
    throw new Error('PR_NUMBER must be a positive integer');
  const existing = execFileSync(
    'gh',
    ['pr', 'view', pr, '--json', 'body', '--jq', '.body'],
    { encoding: 'utf8' }
  );
  const directory = mkdtempSync(join(tmpdir(), 'release-pr-body-'));
  try {
    const file = join(directory, 'body.md');
    writeFileSync(file, renderBody(existing, process.env));
    execFileSync('gh', ['pr', 'edit', pr, '--body-file', file], {
      stdio: 'inherit',
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
