#!/usr/bin/env node
// Generate MDX pages for each CRD plus the CRD reference landing page and a
// sidebar.json consumed by sidebars.ts. Everything is driven by
// static/api-specs/crds/index.json (produced by extract-crd-schemas.mjs) and
// scripts/lib/crd-intros.mjs (hand-written per-CRD metadata).
//
// To add support for a new CRD: add an entry to crd-intros.mjs. The sidebar
// and landing page update automatically from that single source.

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
const crdsDataDir = path.join(repoRoot, 'static', 'api-specs', 'crds');
const pagesDir = path.join(repoRoot, 'docs', 'toolhive', 'reference', 'crds');

fs.mkdirSync(pagesDir, { recursive: true });

const index = JSON.parse(
  fs.readFileSync(path.join(crdsDataDir, 'index.json'), 'utf8')
);

// Warn on CRDs that exist upstream but have no intros entry yet. We still
// write the extracted schema and example for those CRDs (extract-crd-schemas
// does that unconditionally), but skip the MDX page, sidebar entry, and
// DocCard until someone adds an intros entry. The release workflow detects
// this case by spotting newly-added *.schema.json files with no matching
// *.mdx and annotates the generated PR body accordingly.
const missingIntros = index
  .map((entry) => entry.kind)
  .filter((kind) => !intros[kind]);
if (missingIntros.length) {
  console.warn(
    `\nWARNING: no intros entry for ${missingIntros.join(', ')}. ` +
      `Add ${missingIntros.length === 1 ? 'an' : ''} entry ${missingIntros.length === 1 ? '' : 'for each '}` +
      `to scripts/lib/crd-intros.mjs to publish ` +
      `${missingIntros.length === 1 ? 'this CRD' : 'these CRDs'}.\n`
  );
}

function formatRelated(entry) {
  const out = [];
  if (entry.references.length) {
    out.push('**References:**\n');
    for (const ref of entry.references) {
      const meta = intros[ref.targetKind];
      const link = meta
        ? `[${ref.targetKind}](./${meta.slug}.mdx)`
        : ref.targetKind;
      const fields = ref.paths.map((p) => `\`${p}\``).join(', ');
      out.push(`- ${link} - via ${fields}`);
    }
    out.push('');
  }
  if (entry.referencedBy.length) {
    out.push('**Referenced by:**\n');
    for (const ref of entry.referencedBy) {
      const meta = intros[ref.sourceKind];
      const link = meta
        ? `[${ref.sourceKind}](./${meta.slug}.mdx)`
        : ref.sourceKind;
      const fields = ref.paths.map((p) => `\`${p}\``).join(', ');
      out.push(`- ${link} - via ${fields}`);
    }
    out.push('');
  }
  return out.join('\n').trim();
}

function renderPage(entry) {
  const meta = intros[entry.kind];

  const shortNamesLine = entry.shortNames.length
    ? ` · **Short names:** ${entry.shortNames.map((n) => `\`${n}\``).join(', ')}`
    : '';

  const examplePath = path.join(crdsDataDir, `${entry.plural}.example.yaml`);
  const example = fs.readFileSync(examplePath, 'utf8').trimEnd();
  const exampleFileLabel = `${meta.slug}.yaml`;

  const related = formatRelated(entry);
  const relatedSection = related
    ? `\n## Related resources\n\n${related}\n`
    : '';

  return `---
title: ${entry.kind}
description: >-
  ${meta.description}
displayed_sidebar: toolhiveSidebar
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
${relatedSection}`;
}

function kindsByGroup() {
  // Respect explicit groupOrder, then list Kinds in declaration order.
  const byGroup = Object.fromEntries(groupOrder.map((g) => [g, []]));
  for (const [kind, meta] of Object.entries(intros)) {
    if (!byGroup[meta.group]) {
      throw new Error(
        `intros["${kind}"].group="${meta.group}" is not one of ${groupOrder.join(', ')}`
      );
    }
    byGroup[meta.group].push({ kind, ...meta });
  }
  return byGroup;
}

function renderLandingPage() {
  const grouped = kindsByGroup();
  const sections = groupOrder.map((group) => {
    const label = groupLabels[group];
    const cards = grouped[group]
      .map(
        (item) => `<DocCard
  item={{
    type: 'link',
    href: '/toolhive/reference/crds/${item.slug}',
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
title: Kubernetes CRD reference
description:
  Reference for all ToolHive Kubernetes Operator custom resource definitions.
displayed_sidebar: toolhiveSidebar
---

import DocCard from '@theme/DocCard';

The ToolHive operator manages MCP workloads using Kubernetes custom resources.
Each page below documents one resource - its fields, defaults, validation
rules, and a minimal example manifest - and links to the other resources it
references.

${sections.join('\n\n')}
`;
}

function renderSidebarFragment() {
  const grouped = kindsByGroup();
  return {
    type: 'category',
    label: 'CRD reference',
    description:
      'Reference for the Kubernetes custom resources managed by the ToolHive operator',
    link: { type: 'doc', id: 'toolhive/reference/crds/index' },
    items: groupOrder.map((group) => ({
      type: 'category',
      label: groupLabels[group],
      collapsed: false,
      collapsible: false,
      items: grouped[group].map(
        (item) => `toolhive/reference/crds/${item.slug}`
      ),
    })),
  };
}

// Emit per-CRD MDX pages (skipping CRDs with no intros entry; those are
// recorded in missing-intros.json for the release automation to surface).
for (const entry of index) {
  const meta = intros[entry.kind];
  if (!meta) continue;
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

// Emit the schemas index consumed by <CRDFields>. This lets MDX authors
// reference a CRD by its Kind name without knowing the plural form or
// importing the JSON themselves.
const schemasPath = path.resolve(
  repoRoot,
  'src',
  'components',
  'CRDReference',
  'schemas.ts'
);
const covered = index.filter((entry) => intros[entry.kind]);
const schemasContent = `// AUTO-GENERATED by scripts/generate-crd-pages.mjs. Do not edit.
// Maps each CRD Kind to its extracted JSON Schema so <CRDFields> and the
// <CRDReference> remark plugin can resolve schemas by Kind name.

${covered
  .map(
    (entry) =>
      `import ${entry.kind} from '@site/static/api-specs/crds/${entry.plural}.schema.json';`
  )
  .join('\n')}

export const schemas = {
${covered.map((entry) => `  ${entry.kind},`).join('\n')}
} as const;

export type CRDKind = keyof typeof schemas;
`;
fs.writeFileSync(schemasPath, schemasContent);
console.log(`Wrote ${path.relative(repoRoot, schemasPath)}`);

const emitted = index.length - missingIntros.length;
console.log(
  `\nGenerated pages and sidebar for ${emitted} CRD(s)` +
    (missingIntros.length ? ` (${missingIntros.length} skipped).` : '.')
);
