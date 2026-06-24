// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Remark plugin that expands <CRDReference kind="..." /> MDX elements into
 * an ordered sequence of markdown headings + <CRDFields> calls, one per
 * object scope in the referenced CRD schema. The headings are injected
 * into the AST so Docusaurus's downstream TOC extractor picks them up;
 * this is why we do it as a remark plugin rather than purely at render
 * time in a React component.
 *
 * <CRDFields kind="..." path="..." /> is left alone - it's the per-scope
 * renderer that guides can inline without triggering heading injection.
 */

import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

function isObjectScope(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.properties && Object.keys(node.properties).length) return true;
  if (node.items?.properties) return true;
  if (
    typeof node.additionalProperties === 'object' &&
    node.additionalProperties?.properties
  ) {
    return true;
  }
  return false;
}

function childrenOf(node) {
  if (node.properties && Object.keys(node.properties).length)
    return node.properties;
  if (node.items?.properties) return node.items.properties;
  if (
    typeof node.additionalProperties === 'object' &&
    node.additionalProperties?.properties
  ) {
    return node.additionalProperties.properties;
  }
  return null;
}

// Walk the schema depth-first, yielding every object scope along with its
// dotted path and depth (0 for top-level spec/status).
function* walkScopes(schema) {
  function* visitNode(dottedPath, node, depth) {
    if (!isObjectScope(node)) return;
    yield { path: dottedPath, node, depth };
    const kids = childrenOf(node);
    if (!kids) return;
    for (const [key, child] of Object.entries(kids)) {
      yield* visitNode(`${dottedPath}.${key}`, child, depth + 1);
    }
  }
  if (!schema.properties) return;
  for (const [key, child] of Object.entries(schema.properties)) {
    yield* visitNode(key, child, 0);
  }
}

function attrValue(attributes, name) {
  const match = attributes?.find((a) => a.name === name);
  if (!match) return undefined;
  const v = match.value;
  // Simple string attribute.
  if (typeof v === 'string') return v;
  // Expression attribute (e.g. {"MCPServer"}); we only look at literal
  // strings in expressions for simplicity.
  if (
    v &&
    typeof v === 'object' &&
    v.type === 'mdxJsxAttributeValueExpression'
  ) {
    const expr = v.value?.trim() ?? '';
    const stringMatch = expr.match(/^['"`](.*)['"`]$/);
    if (stringMatch) return stringMatch[1];
  }
  return undefined;
}

function mdxAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

function mdxElement(name, attrs) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: Object.entries(attrs).map(([k, v]) => mdxAttr(k, v)),
    children: [],
  };
}

// Turn a scope's description into AST nodes suitable for paragraph content.
// The description text is put in a single text node; remark-mdx escapes JSX
// metacharacters (`{`, `<`) when they appear in text nodes, so we don't
// need to HTML-entity-encode them.
function descriptionNodes(description) {
  if (!description) return [];
  const collapsed = description.replace(/\s*\n\s*/g, ' ').trim();
  if (!collapsed) return [];
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', value: collapsed }],
    },
  ];
}

function scopeLabel(scope) {
  return scope.node.type === 'array' ? `${scope.path}[]` : scope.path;
}

function buildScopeBlock(kind, scope) {
  // Top-level scope (spec/status) = h3; each further level = h4, h5, ...
  // Capped at h6.
  const depth = Math.min(6, 3 + scope.depth);
  const label = scopeLabel(scope);
  const blocks = [
    {
      type: 'heading',
      depth,
      children: [{ type: 'inlineCode', value: label }],
    },
    ...descriptionNodes(scope.node.description),
    mdxElement('CRDFields', { kind, path: scope.path }),
  ];
  // Nested scopes get a back-link to their enclosing scope. Top-level
  // scopes (spec, status) have no parent on the page and skip it.
  const lastDot = scope.path.lastIndexOf('.');
  if (lastDot > 0) {
    const parentPath = scope.path.slice(0, lastDot);
    blocks.push(mdxElement('CRDBackLink', { to: parentPath }));
  }
  return blocks;
}

function relatedListItem(sibling, paths) {
  // Build: `- [<Kind>](./<slug>.mdx) - via \`<path>\`, \`<path>\`...` as
  // explicit mdast so remark doesn't have to re-parse anything.
  const linkTarget = sibling ? `./${sibling.slug}.mdx` : null;
  const kindChildren = [{ type: 'text', value: sibling.kind }];
  const kindNode = linkTarget
    ? { type: 'link', url: linkTarget, children: kindChildren }
    : kindChildren[0];
  const pathNodes = [];
  paths.forEach((p, i) => {
    if (i > 0) pathNodes.push({ type: 'text', value: ', ' });
    pathNodes.push({ type: 'inlineCode', value: p });
  });
  return {
    type: 'listItem',
    spread: false,
    children: [
      {
        type: 'paragraph',
        children: [kindNode, { type: 'text', value: ' - via ' }, ...pathNodes],
      },
    ],
  };
}

function relatedSubsection(label, items, registry) {
  if (!items.length) return [];
  const listItems = items.map((ref) => {
    const siblingKind = ref.targetKind ?? ref.sourceKind;
    const sibling = registry.get(siblingKind) ?? { kind: siblingKind };
    return relatedListItem(sibling, ref.paths);
  });
  return [
    {
      type: 'paragraph',
      children: [
        { type: 'strong', children: [{ type: 'text', value: label }] },
      ],
    },
    { type: 'list', ordered: false, spread: false, children: listItems },
  ];
}

function buildRelatedBlocks(entry, registry) {
  const hasAny = entry.references.length || entry.referencedBy.length;
  if (!hasAny) return [];
  return [
    {
      type: 'heading',
      depth: 2,
      children: [{ type: 'text', value: 'Related resources' }],
    },
    ...relatedSubsection('References:', entry.references, registry),
    ...relatedSubsection('Referenced by:', entry.referencedBy, registry),
  ];
}

export default function crdReferenceRemark(options = {}) {
  // Accept either a single schemaDir (legacy) or a list of schemaDirs. The
  // registries are merged into one Kind -> entry map. CRD Kinds must be
  // globally unique across dirs because we resolve schemas by Kind name;
  // throw on a collision rather than letting one set silently shadow another.
  const dirs =
    options.schemaDirs ??
    (options.schemaDir
      ? [options.schemaDir]
      : [path.resolve(process.cwd(), 'static', 'api-specs', 'toolhive-crds')]);

  const registry = new Map();
  for (const schemaDir of dirs) {
    const indexPath = path.join(schemaDir, 'index.json');
    if (!fs.existsSync(indexPath)) continue;
    const entries = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    for (const entry of entries) {
      const existing = registry.get(entry.kind);
      if (existing) {
        throw new Error(
          `crd-reference-remark: duplicate CRD Kind "${entry.kind}" in ` +
            `${existing.schemaDir} and ${schemaDir}. CRD Kinds must be unique ` +
            `across schema dirs because <CRDReference> resolves by Kind name.`
        );
      }
      registry.set(entry.kind, { ...entry, schemaDir });
    }
  }

  return function transformer(tree, file) {
    const replacements = [];

    visit(tree, (node, index, parent) => {
      if (
        node.type !== 'mdxJsxFlowElement' &&
        node.type !== 'mdxJsxTextElement'
      ) {
        return;
      }
      if (node.name !== 'CRDReference') return;

      const kind = attrValue(node.attributes, 'kind');
      if (!kind) {
        file.message(
          '<CRDReference> is missing the kind="..." attribute; skipping.',
          node
        );
        return;
      }
      const entry = registry.get(kind);
      if (!entry) {
        file.message(
          `<CRDReference kind="${kind}"> has no matching CRD in any registered schema dir (${dirs.map((d) => path.relative(process.cwd(), d)).join(', ')}); skipping.`,
          node
        );
        return;
      }

      const schemaPath = path.join(
        entry.schemaDir,
        `${entry.plural}.schema.json`
      );
      let schema;
      try {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      } catch (err) {
        file.message(
          `Failed to read schema for ${kind} at ${schemaPath}: ${err.message}`,
          node
        );
        return;
      }

      const blocks = [];
      for (const scope of walkScopes(schema)) {
        blocks.push(...buildScopeBlock(kind, scope));
      }
      blocks.push(...buildRelatedBlocks(entry, registry));
      replacements.push({ parent, index, blocks });
    });

    // Apply in reverse so earlier indices remain valid while we splice.
    replacements.sort((a, b) => b.index - a.index);
    for (const { parent, index, blocks } of replacements) {
      parent.children.splice(index, 1, ...blocks);
    }
  };
}
