#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Generates an HTML-table summary of visual-regression screenshot changes
// (tests/visual/*.spec.ts-snapshots/*.png) between two git refs, for
// pasting into a PR description. Grouped into New / Changed / Deleted
// (git's A/M/D status), one HTML table per snapshot group (a light/dark
// pair, or a singleton when only one scheme changed) so each group reads
// as a self-contained card. Raw HTML tables are used (not GFM pipe
// tables) because only HTML supports colspan, and GitHub renders HTML
// tables fine inside markdown.
//
// Images are embedded via GitHub's own raw-blob URLs
// (github.com/<owner>/<repo>/raw/<sha>/<path>) — baselines are already
// committed PNGs, so this needs no separate image hosting. Changed
// entries additionally link into GitHub's own rich image diff via its
// undocumented but empirically-verified #diff-<sha256-of-path> anchor
// convention (this has changed once before per public discussion; treat
// it as best-effort, not a stable contract).
//
// Usage:
//   node scripts/pr-screenshot-summary.mjs [--base <ref>] [--head <ref>]
// Defaults: --base origin/main, --head HEAD. Run `git fetch origin` first
// if --base hasn't been fetched recently — this script never fetches on
// its own.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

function parseArgs(argv) {
  const args = { base: 'origin/main', head: 'HEAD' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base' && argv[i + 1]) args.base = argv[++i];
    else if (argv[i] === '--head' && argv[i + 1]) args.head = argv[++i];
  }
  return args;
}

function git(...gitArgs) {
  return execFileSync('git', gitArgs, { encoding: 'utf-8' }).trim();
}

function repoSlug() {
  const url = git('remote', 'get-url', 'origin');
  const match = url.match(/github\.com[:/]([^/]+\/[^/.]+?)(\.git)?$/);
  if (!match) {
    throw new Error(`Could not parse an owner/repo from remote url: ${url}`);
  }
  return match[1];
}

const SNAPSHOT_GLOB = 'tests/visual/*.spec.ts-snapshots/*.png';
const SCHEME_RE = /-(light|dark)-(?:desktop|mobile)-linux\.png$/;

/** @typedef {{ path: string, status: 'A'|'M'|'D', sha: string }} Entry */

function lastCommitWith(filePath, beforeRef) {
  return git('log', '-1', '--format=%H', beforeRef, '--', filePath);
}

/** @returns {Entry[]} */
function diffEntries(base, head) {
  const out = git(
    'diff',
    '--name-status',
    `${base}...${head}`,
    '--',
    SNAPSHOT_GLOB
  );
  if (!out) return [];
  return out.split('\n').map((line) => {
    const [rawStatus, filePath] = line.split('\t');
    // Collapse rename-detection scores (e.g. "R100") to a single letter —
    // PNGs don't meaningfully rename-detect against each other, but git
    // diff still tags binary adds/deletes with a bare status letter, so
    // this only ever needs the first character in practice.
    const status = rawStatus[0];
    const sha = status === 'D' ? lastCommitWith(filePath, base) : head;
    return { path: filePath, status, sha };
  });
}

function titleize(pngPath) {
  const base = pngPath.split('/').pop() ?? pngPath;
  const stripped = base.replace(SCHEME_RE, '');
  return stripped
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function schemeOf(pngPath) {
  return pngPath.match(SCHEME_RE)?.[1] ?? 'unknown';
}

const SCHEME_EMOJI = { light: '☀️', dark: '🌙' };
// Fixed order (not alphabetical — "dark" < "light" lexically) so light
// always renders above dark within a group.
const SCHEME_ORDER = ['light', 'dark'];

/** Same PNG path with the "-<scheme>-<project>-linux.png" suffix stripped
 *  — the key that groups a light/dark pair (or singleton) back into one
 *  logical snapshot for the merged-cell table layout. */
function baseKeyOf(pngPath) {
  return pngPath.replace(SCHEME_RE, '');
}

function groupByBaseSnapshot(entries) {
  const order = [];
  const groups = new Map();
  for (const e of entries) {
    const key = baseKeyOf(e.path);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)?.push(e);
  }
  return order.map((key) => {
    const g = groups.get(key) ?? [];
    return [...g].sort(
      (a, b) =>
        SCHEME_ORDER.indexOf(schemeOf(a.path)) -
        SCHEME_ORDER.indexOf(schemeOf(b.path))
    );
  });
}

function rawUrl(slug, sha, filePath) {
  return `https://github.com/${slug}/raw/${sha}/${filePath}`;
}

/** GitHub's file-diff anchor: sha256 of the repo-relative path, hex —
 *  verified against a known-good example, not officially documented. */
function diffAnchor(filePath) {
  return createHash('sha256').update(filePath).digest('hex');
}

function compareUrl(slug, baseSha, headSha, filePath) {
  return `https://github.com/${slug}/compare/${baseSha}...${headSha}#diff-${diffAnchor(filePath)}`;
}

function blobUrl(slug, sha, testFile) {
  return `https://github.com/${slug}/blob/${sha}/${testFile}`;
}

const UNKNOWN_METADATA = { urlPath: '(unknown URL path)', testFile: null };

/** Reads the PNG's same-named .json sidecar at the given commit (not off
 *  disk) so this works uniformly for New/Changed entries (sha = head) and
 *  Deleted ones (sha = the last commit that still had the file) alike. */
function readMetadata(pngPath, sha) {
  const jsonPath = pngPath.replace(/\.png$/, '.json');
  try {
    const raw = git('show', `${sha}:${jsonPath}`);
    const metadata = JSON.parse(raw);
    return {
      urlPath: metadata.url?.path ?? UNKNOWN_METADATA.urlPath,
      testFile: metadata.testFile ?? null,
    };
  } catch {
    return UNKNOWN_METADATA;
  }
}

function titleCell(title, slug, sha, meta) {
  if (!meta.testFile) return `<strong>${title}</strong>`;
  return `<a href="${blobUrl(slug, sha, meta.testFile)}"><strong>${title}</strong></a>`;
}

const STATUS_HEADING = { A: '🟢 New', M: '🟡 Changed', D: '🔴 Deleted' };
const STATUS_TITLE_SUFFIX = { A: '✨', M: '🔀', D: '🗑️' };

/** New/Deleted entries: one HTML table per snapshot group. */
function buildSection(status, entries, slug) {
  const group = entries.filter((e) => e.status === status);
  if (group.length === 0) return '';

  const lines = [`### ${STATUS_HEADING[status]}`, ''];
  for (const rowGroup of groupByBaseSnapshot(group)) {
    const title = `${titleize(rowGroup[0].path)} ${STATUS_TITLE_SUFFIX[status]}`;
    const meta = readMetadata(rowGroup[0].path, rowGroup[0].sha);
    lines.push(
      '<table>',
      `<tr><td colspan="2" align="center">${titleCell(title, slug, rowGroup[0].sha, meta)}<br><code>${meta.urlPath}</code></td></tr>`,
      '<tr><th></th><th>Preview</th></tr>'
    );
    for (const e of rowGroup) {
      const emoji = SCHEME_EMOJI[schemeOf(e.path)] ?? '';
      const img = `<img src="${rawUrl(slug, e.sha, e.path)}" alt="${title} (${schemeOf(e.path)})">`;
      lines.push(`<tr><td align="center">${emoji}</td><td>${img}</td></tr>`);
    }
    lines.push('</table>', '');
  }
  return lines.join('\n');
}

const CHANGE_ARROW = '➡️';

/** Changed entries get a before/after layout plus a link into GitHub's
 *  own rich diff for pixel-level comparison. */
function buildChangedSection(entries, slug, baseSha, headSha) {
  const group = entries.filter((e) => e.status === 'M');
  if (group.length === 0) return '';

  const lines = [`### ${STATUS_HEADING.M}`, ''];
  for (const rowGroup of groupByBaseSnapshot(group)) {
    const title = `${titleize(rowGroup[0].path)} ${STATUS_TITLE_SUFFIX.M}`;
    const meta = readMetadata(rowGroup[0].path, rowGroup[0].sha);
    lines.push(
      '<table>',
      `<tr><td colspan="4" align="center">${titleCell(title, slug, rowGroup[0].sha, meta)}<br><code>${meta.urlPath}</code></td></tr>`,
      '<tr><th></th><th>Before</th><th></th><th>After</th></tr>'
    );
    for (const e of rowGroup) {
      const scheme = schemeOf(e.path);
      const emoji = SCHEME_EMOJI[scheme] ?? '';
      const diff = compareUrl(slug, baseSha, headSha, e.path);
      const schemeCell = `${emoji}<br><a href="${diff}">diff</a>`;
      const beforeImg = `<img src="${rawUrl(slug, baseSha, e.path)}" alt="Before (${scheme})">`;
      const afterImg = `<img src="${rawUrl(slug, e.sha, e.path)}" alt="After (${scheme})">`;
      lines.push(
        `<tr><td align="center">${schemeCell}</td><td>${beforeImg}</td><td align="center">${CHANGE_ARROW}</td><td>${afterImg}</td></tr>`
      );
    }
    lines.push('</table>', '');
  }
  return lines.join('\n');
}

function main() {
  const { base, head } = parseArgs(process.argv.slice(2));
  const slug = repoSlug();
  // Resolve refs to full commit SHAs up front — entries store a SHA for
  // the raw-URL link, and a bare ref name like "HEAD" or "origin/main"
  // isn't stable/dereferenceable in a raw-blob-style URL.
  const baseSha = git('rev-parse', base);
  const headSha = git('rev-parse', head);
  const entries = diffEntries(baseSha, headSha);

  if (entries.length === 0) {
    console.log(
      `No visual-regression snapshot changes between ${base} and ${head}.`
    );
    return;
  }

  const sections = [
    buildSection('A', entries, slug),
    buildChangedSection(entries, slug, baseSha, headSha),
    buildSection('D', entries, slug),
  ].filter(Boolean);

  console.log(sections.join('\n'));
}

main();
