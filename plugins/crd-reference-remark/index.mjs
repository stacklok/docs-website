// Remark plugin that expands <CRDReference kind="..." /> MDX elements into
// an ordered sequence of markdown headings + <CRDFields> calls, one per
// object scope in the referenced CRD schema. The headings are injected
// into the AST so Docusaurus's downstream TOC extractor picks them up;
// this is why we do it as a remark plugin rather than purely at render
// time in a React component.
//
// <CRDFields kind="..." path="..." /> is left alone - it's the per-scope
// renderer that guides can inline without triggering heading injection.

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

export default function crdReferenceRemark(options = {}) {
  const schemaDir =
    options.schemaDir ??
    path.resolve(process.cwd(), 'static', 'api-specs', 'crds');

  const indexPath = path.join(schemaDir, 'index.json');
  const registry = new Map();
  if (fs.existsSync(indexPath)) {
    const entries = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    for (const entry of entries) registry.set(entry.kind, entry);
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
          `<CRDReference kind="${kind}"> has no matching CRD in ${path.relative(process.cwd(), indexPath)}; skipping.`,
          node
        );
        return;
      }

      const schemaPath = path.join(schemaDir, `${entry.plural}.schema.json`);
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
      replacements.push({ parent, index, blocks });
    });

    // Apply in reverse so earlier indices remain valid while we splice.
    replacements.sort((a, b) => b.index - a.index);
    for (const { parent, index, blocks } of replacements) {
      parent.children.splice(index, 1, ...blocks);
    }
  };
}
