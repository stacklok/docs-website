#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Generate MDX pages for each CRD plus the CRD reference landing page and a
 * sidebar.json consumed by sidebars.ts. Every CRD present in the data
 * directory's index.json (produced by extract-crd-schemas.mjs) is published.
 * Hand-written overrides in scripts/lib/crd-intros.mjs are merged over
 * schema-derived defaults, so a new upstream CRD ships a usable page
 * automatically; overrides are improvements, not prerequisites.
 *
 * Usage:
 *   node scripts/generate-crd-pages.mjs [--data <dir>] [--pages <dir>]
 *
 * --data              Directory produced by extract-crd-schemas.mjs (contains
 *                     index.json and per-CRD schema/example files).
 *                     Default: static/api-specs/toolhive-crds
 * --pages             Directory to write MDX pages into.
 *                     Default: docs/toolhive/reference/crds
 * --landing-title     Title for the CRD reference landing page and sidebar
 *                     category label.
 *                     Default: "Kubernetes CRD reference"
 * --landing-description  Front-matter description for the landing page (used
 *                     for DocCard previews and SEO meta).
 *                     Default: "Reference for all ToolHive Kubernetes Operator
 *                     custom resource definitions."
 * --landing-intro     Intro paragraph text rendered below the landing page
 *                     title, above the DocCard grid.
 *                     Default: ToolHive-specific copy.
 *
 * The Docusaurus doc-ID prefix (used in sidebar items and landing-page hrefs)
 * is derived automatically from --pages by stripping the leading docs/ path.
 * Run the script twice with different flags to publish OSS and enterprise CRDs
 * to separate sections without the indexes clobbering each other.
 *
 * This script writes per-set output only (MDX pages, sidebar fragment, and
 * the enriched index.json). The consolidated Kind -> schema barrel consumed
 * by <CRDFields> spans all sets and is generated separately by
 * scripts/generate-crd-barrel.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { intros, groupLabels, groupOrder } from './lib/crd-intros.mjs';

// The <CRDReference kind="..." /> element is a marker; the
// plugins/crd-reference-remark plugin expands it at build time into an
// ordered sequence of headings and <CRDFields> calls. Keeping this
// invocation trivial is the whole point of the plugin approach.

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const defaultDataDir = path.join(
  repoRoot,
  'static',
  'api-specs',
  'toolhive-crds'
);
const defaultPagesDir = path.join(
  repoRoot,
  'docs',
  'toolhive',
  'reference',
  'crds'
);

const args = process.argv.slice(2);

const dataArgIdx = args.indexOf('--data');
const crdsDataDir =
  dataArgIdx >= 0 ? path.resolve(args[dataArgIdx + 1]) : defaultDataDir;

const pagesArgIdx = args.indexOf('--pages');
const pagesDir =
  pagesArgIdx >= 0 ? path.resolve(args[pagesArgIdx + 1]) : defaultPagesDir;

function argValue(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : fallback;
}

const landingTitle = argValue('--landing-title', 'Kubernetes CRD reference');
const landingDescription = argValue(
  '--landing-description',
  'Reference for all ToolHive Kubernetes Operator custom resource definitions.'
);
const landingIntro = argValue(
  '--landing-intro',
  'The ToolHive operator manages MCP workloads using Kubernetes custom resources.\nEach page below documents one resource - its fields, defaults, validation\nrules, and a minimal example manifest - and links to the other resources it\nreferences.'
);

// Derive the Docusaurus doc-ID prefix from pagesDir (strip the leading docs/).
const docsRoot = path.join(repoRoot, 'docs');
const docIdPrefix = path.relative(docsRoot, pagesDir); // e.g. "toolhive/reference/crds"

fs.mkdirSync(pagesDir, { recursive: true });

const index = JSON.parse(
  fs.readFileSync(path.join(crdsDataDir, 'index.json'), 'utf8')
);

const DEFAULT_GROUP = 'shared';

// Strip the kubebuilder boilerplate prefix ("Foo is the Schema for the foos
// API") that shows up at the top of every CRD description. If something
// useful follows, return that; otherwise return ''.
function cleanUpstreamDescription(raw, kind, plural) {
  if (!raw) return '';
  const pattern = new RegExp(
    `^\\s*${kind}\\s+is\\s+the\\s+Schema\\s+for\\s+the\\s+${plural}\\s+API\\.?\\s*`,
    'i'
  );
  return raw.replace(pattern, '').trim();
}

function firstSentence(text) {
  if (!text) return '';
  const match = text.match(/^(.+?[.!?])(\s|$)/s);
  return (match ? match[1] : text).replace(/\s+/g, ' ').trim();
}

function truncate(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  const clipped = text.slice(0, max).replace(/\s+\S*$/, '');
  return `${clipped.replace(/[,;:.!?-]+$/, '')}...`;
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Upstream descriptions often lead with a sentence naming the Kind (stripped
// as boilerplate) and then continue with "It <verbs>..." or "This <noun>".
// That reads awkwardly once the opening is gone, so rewrite the first token
// to use the backticked Kind. If the cleaned text already starts with the
// Kind, just backtick it in place.
function formatIntro(cleaned, kind) {
  const text = normalizeWhitespace(cleaned);
  if (!text) return '';
  const kindPattern = new RegExp(`^${kind}\\b`);
  if (kindPattern.test(text)) {
    return text.replace(kindPattern, `\`${kind}\``);
  }
  const pronounPattern = /^(It|This resource|This)\s+/;
  if (pronounPattern.test(text)) {
    return text.replace(pronounPattern, `\`${kind}\` `);
  }
  return `\`${kind}\` - ${text}`;
}

// Landing-card taglines already have the Kind as their label, so strip any
// Kind or pronoun prefix and uppercase the remaining verb instead of
// backticking. Produces "Enables proxying..." rather than "It enables...".
function formatSummary(cleaned, kind) {
  const text = normalizeWhitespace(cleaned);
  if (!text) return '';
  const stripped = text
    .replace(new RegExp(`^${kind}\\s+`), '')
    .replace(/^(It|This resource|This)\s+/, '');
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

// Merge an override entry (if any) over schema-derived defaults so every CRD
// in index.json has complete metadata.
function resolveMeta(entry) {
  const override = intros[entry.kind] || {};
  const cleaned = cleanUpstreamDescription(
    entry.description,
    entry.kind,
    entry.plural
  );
  const fallbackSummary =
    truncate(firstSentence(formatSummary(cleaned, entry.kind)), 90) ||
    `${entry.kind} custom resource.`;
  const fallbackIntro =
    formatIntro(cleaned, entry.kind) ||
    `\`${entry.kind}\` is a ToolHive custom resource.`;

  return {
    slug: override.slug ?? entry.kind.toLowerCase(),
    group: override.group ?? DEFAULT_GROUP,
    summary: override.summary ?? fallbackSummary,
    description: override.description ?? `Schema reference for ${entry.kind}.`,
    intro: override.intro ?? fallbackIntro,
    // Track whether this CRD has a hand-written override so the release
    // workflow can surface "drive-by improvement" opportunities without
    // treating them as blockers.
    hasOverride: Boolean(intros[entry.kind]),
  };
}

// Resolve every CRD up front so link formatters can look up any sibling's
// slug without re-deriving it.
const metaByKind = new Map();
for (const entry of index) metaByKind.set(entry.kind, resolveMeta(entry));

function renderPage(entry) {
  const meta = metaByKind.get(entry.kind);

  const shortNamesLine = entry.shortNames.length
    ? ` · **Short names:** ${entry.shortNames.map((n) => `\`${n}\``).join(', ')}`
    : '';

  const examplePath = path.join(crdsDataDir, `${entry.plural}.example.yaml`);
  const example = fs.readFileSync(examplePath, 'utf8').trimEnd();
  const exampleFileLabel = `${meta.slug}.yaml`;

  // The Schema section and its Related resources tail are both injected by
  // plugins/crd-reference-remark when it expands <CRDReference>. That
  // plugin reads index.json (including each sibling's slug written below)
  // so cross-reference edits regenerate without rewriting these MDX files.
  return `---
title: ${entry.kind}
description: >-
  ${meta.description}
toc_max_heading_level: 4
---

${meta.intro}

**API:** \`${entry.group}/${entry.version}\`
 · **Scope:** ${entry.scope}${shortNamesLine}

## Example

\`\`\`yaml title="${exampleFileLabel}"
${example}
\`\`\`

## Schema

<CRDReference kind="${entry.kind}" />
`;
}

function kindsByGroup() {
  // Within each group, emit overridden entries first (in their declaration
  // order in intros) so hand-curated ordering is preserved, then append any
  // defaults-only CRDs alphabetically by Kind for a predictable landing-page
  // layout when upstream adds new resources.
  const byGroup = Object.fromEntries(groupOrder.map((g) => [g, []]));
  const overrideOrder = new Map(
    Object.keys(intros).map((kind, i) => [kind, i])
  );
  const ordered = [...index].sort((a, b) => {
    const ao = overrideOrder.has(a.kind);
    const bo = overrideOrder.has(b.kind);
    if (ao && bo) return overrideOrder.get(a.kind) - overrideOrder.get(b.kind);
    if (ao) return -1;
    if (bo) return 1;
    return a.kind.localeCompare(b.kind);
  });
  for (const entry of ordered) {
    const meta = metaByKind.get(entry.kind);
    if (!byGroup[meta.group]) {
      throw new Error(
        `Unknown group "${meta.group}" for ${entry.kind}; expected one of ${groupOrder.join(', ')}`
      );
    }
    byGroup[meta.group].push({ kind: entry.kind, ...meta });
  }
  return byGroup;
}

function renderLandingPage() {
  const grouped = kindsByGroup();
  const sections = groupOrder
    .filter((group) => grouped[group].length > 0)
    .map((group) => {
      const label = groupLabels[group];
      const cards = grouped[group]
        .map(
          (item) => `<DocCard
  item={{
    type: 'link',
    href: '/${docIdPrefix}/${item.slug}',
    label: '${item.kind}',
    description: '${item.summary.replace(/'/g, "\\'")}',
  }}
/>`
        )
        .join('\n\n');
      return `## ${label}

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', margin: '1rem 0'}}>

${cards}

</div>`;
    });

  return `---
title: ${landingTitle}
description:
  ${landingDescription}
---

import DocCard from '@theme/DocCard';

${landingIntro}

${sections.join('\n\n')}
`;
}

function renderSidebarFragment() {
  const grouped = kindsByGroup();
  return {
    type: 'category',
    label: landingTitle,
    description: landingDescription,
    link: { type: 'doc', id: `${docIdPrefix}/index` },
    items: groupOrder
      .filter((group) => grouped[group].length > 0)
      .map((group) => ({
        type: 'category',
        label: groupLabels[group],
        collapsed: false,
        collapsible: false,
        items: grouped[group].map((item) => `${docIdPrefix}/${item.slug}`),
      })),
  };
}

// Augment index.json with each entry's resolved slug so the
// crd-reference-remark plugin can build relative links to sibling pages
// without re-running override resolution at Docusaurus build time.
const enrichedIndex = index.map((entry) => ({
  ...entry,
  slug: metaByKind.get(entry.kind).slug,
}));
fs.writeFileSync(
  path.join(crdsDataDir, 'index.json'),
  JSON.stringify(enrichedIndex, null, 2) + '\n'
);

// Emit per-CRD MDX pages for every CRD in the index.
for (const entry of index) {
  const meta = metaByKind.get(entry.kind);
  const out = path.join(pagesDir, `${meta.slug}.mdx`);
  fs.writeFileSync(out, renderPage(entry));
  console.log(`Wrote ${path.relative(repoRoot, out)}`);
}

// Emit the landing page.
const landingPath = path.join(pagesDir, 'index.mdx');
fs.writeFileSync(landingPath, renderLandingPage());
console.log(`Wrote ${path.relative(repoRoot, landingPath)}`);

// Emit the sidebar fragment consumed by sidebars.ts.
const sidebarPath = path.join(crdsDataDir, 'sidebar.json');
fs.writeFileSync(
  sidebarPath,
  JSON.stringify(renderSidebarFragment(), null, 2) + '\n'
);
console.log(`Wrote ${path.relative(repoRoot, sidebarPath)}`);

const withoutOverride = index.filter(
  (entry) => !metaByKind.get(entry.kind).hasOverride
);
console.log(
  `\nGenerated pages and sidebar for ${index.length} CRD(s)` +
    (withoutOverride.length
      ? ` (${withoutOverride.length} using schema-derived defaults: ${withoutOverride
          .map((e) => e.kind)
          .join(', ')}).`
      : '.')
);
