// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { schemas, type CRDKind } from './schemas';
import styles from './styles.module.css';

// Minimal subset of JSON Schema we care about for CRD rendering.
interface Schema {
  type?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  required?: string[];
  properties?: Record<string, Schema>;
  items?: Schema;
  additionalProperties?: Schema | boolean;
}

// Match Docusaurus's default heading slugger: lowercase, strip every
// non-alphanumeric character. Otherwise a heading like
// `spec.openTelemetry.caBundleRef` gets id "specopentelemetrycabundleref"
// while we'd try to link to "#spec-opentelemetry-cabundleref" and the
// anchor would miss.
function slugify(path: string): string {
  return path.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveNode(root: Schema, dottedPath: string): Schema | null {
  const parts = dottedPath.split('.');
  let node: Schema | undefined = root.properties?.[parts[0]];
  for (let i = 1; i < parts.length && node; i++) {
    if (node.items?.properties) node = node.items;
    node = node.properties?.[parts[i]];
  }
  return node ?? null;
}

function childrenOfObject(node: Schema): Record<string, Schema> | null {
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

function requiredOf(node: Schema): Set<string> {
  const carrier = node.properties
    ? node
    : node.items?.properties
      ? node.items
      : null;
  return new Set(carrier?.required ?? []);
}

function isObjectScope(node: Schema | undefined | null): boolean {
  if (!node) return false;
  return childrenOfObject(node) !== null;
}

// Collect every object-scope path in the schema. Used so table cells can
// decide whether a type like "object" should link to its own anchor on the
// same page. Includes both the subtree rooted at startPath and all
// top-level siblings (spec, status, ...) so cross-references like
// status.x.foo -> spec.y link correctly.
function collectAllScopes(root: Schema): Set<string> {
  const out = new Set<string>();
  function walk(p: string, node: Schema) {
    if (!isObjectScope(node)) return;
    out.add(p);
    const children = childrenOfObject(node);
    if (!children) return;
    for (const [key, child] of Object.entries(children)) {
      walk(`${p}.${key}`, child);
    }
  }
  if (!root.properties) return out;
  for (const [key, child] of Object.entries(root.properties)) {
    walk(key, child);
  }
  return out;
}

function typeLabel(schema: Schema): string {
  if (!schema) return '';
  if (schema.type === 'array') {
    const inner = schema.items;
    if (inner?.properties || inner?.type === 'object') return 'object[]';
    if (inner?.type) return `${inner.type}[]`;
    return 'array';
  }
  if (
    schema.type === 'object' &&
    !schema.properties &&
    !schema.additionalProperties
  ) {
    return 'object';
  }
  if (
    typeof schema.additionalProperties === 'object' &&
    schema.additionalProperties?.type
  ) {
    return `map<string, ${schema.additionalProperties.type}>`;
  }
  return schema.type ?? '';
}

function formatDefault(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  return JSON.stringify(value);
}

function Modifiers({ schema }: { schema: Schema }) {
  const parts: React.ReactNode[] = [];
  if (schema.default !== undefined) {
    parts.push(
      <span key='d' className={styles.modifier}>
        default <code>{formatDefault(schema.default)}</code>
      </span>
    );
  }
  if (schema.enum && schema.enum.length) {
    parts.push(
      <span key='e' className={styles.modifier}>
        enum:{' '}
        {schema.enum.map((v, i) => (
          <React.Fragment key={i}>
            {i > 0 && ' | '}
            <code>{String(v)}</code>
          </React.Fragment>
        ))}
      </span>
    );
  }
  if (schema.format) {
    parts.push(
      <span key='f' className={styles.modifier}>
        format <code>{schema.format}</code>
      </span>
    );
  }
  if (schema.pattern) {
    parts.push(
      <span key='p' className={styles.modifier}>
        pattern <code>{schema.pattern}</code>
      </span>
    );
  }
  if (schema.minimum !== undefined) {
    parts.push(
      <span key='min' className={styles.modifier}>
        min <code>{schema.minimum}</code>
      </span>
    );
  }
  if (schema.maximum !== undefined) {
    parts.push(
      <span key='max' className={styles.modifier}>
        max <code>{schema.maximum}</code>
      </span>
    );
  }
  if (schema.minLength !== undefined) {
    parts.push(
      <span key='ml' className={styles.modifier}>
        minLength <code>{schema.minLength}</code>
      </span>
    );
  }
  if (schema.maxLength !== undefined) {
    parts.push(
      <span key='mxl' className={styles.modifier}>
        maxLength <code>{schema.maxLength}</code>
      </span>
    );
  }
  if (!parts.length) return null;
  const interleaved: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) interleaved.push(<span key={`sep-${i}`}> · </span>);
    interleaved.push(p);
  });
  return (
    <>
      <br />
      <div className={styles.modifierList}>{interleaved}</div>
    </>
  );
}

function FieldRow({
  name,
  schema,
  isRequired,
  scopePath,
  scopeAnchors,
}: {
  name: string;
  schema: Schema;
  isRequired: boolean;
  scopePath: string;
  scopeAnchors: Set<string>;
}) {
  const fieldPath = scopePath ? `${scopePath}.${name}` : name;
  const hasOwnScope = scopeAnchors.has(fieldPath);
  const type = typeLabel(schema);
  // Same-page anchor link. On the CRD reference page the remark plugin has
  // injected headings with matching ids, so clicks jump to the scope.
  // In a guide embedding, no nested-scope anchors exist on the current
  // page - guide authors should add a plain markdown link to the reference
  // page if they want cross-page navigation, since markdown link syntax
  // is what Docusaurus resolves version-aware.
  return (
    <tr>
      <td className={styles.fieldCell}>
        <code className={styles.fieldName}>{name}</code>
        {isRequired && <span className={styles.required}>required</span>}
      </td>
      <td className={styles.typeCell}>
        {hasOwnScope ? (
          <a href={`#${slugify(fieldPath)}`}>
            <code>{type}</code>
          </a>
        ) : (
          <code>{type}</code>
        )}
      </td>
      <td className={styles.descCell}>
        {schema.description && <p>{schema.description}</p>}
        <Modifiers schema={schema} />
      </td>
    </tr>
  );
}

export interface CRDFieldsProps {
  // Kind to look up in the schemas registry (e.g. "MCPServer").
  kind: CRDKind | string;
  // Dot-path to the object scope whose direct children this renders.
  path: string;
  // If set, render only these field names (in the order given). Use this
  // when inlining a focused subset of fields in a guide. Unknown names
  // surface as an error in the rendered output.
  include?: string[];
  // If set, render every field except these. Ignored if `include` is set.
  exclude?: string[];
}

// Renders a single scope's field table. Used both directly in guides (to
// inline a focused field list for a sub-object of a CRD) and by the
// <CRDReference> remark plugin, which expands into one <CRDFields> call
// per object scope in the CRD.
export function CRDFields({
  kind,
  path,
  include,
  exclude,
}: CRDFieldsProps): React.ReactNode {
  const schema = schemas[kind as CRDKind] as unknown as Schema;
  if (!schema) {
    return (
      <div className={styles.error}>
        <code>&lt;CRDFields&gt;</code>: unknown kind &quot;{kind}&quot;.
      </div>
    );
  }
  const node = resolveNode(schema, path);
  if (!node) {
    return (
      <div className={styles.error}>
        <code>&lt;CRDFields&gt;</code>: no object at path &quot;{path}&quot; in{' '}
        {kind}.
      </div>
    );
  }
  const children = childrenOfObject(node);
  if (!children) {
    return (
      <div className={styles.error}>
        <code>&lt;CRDFields&gt;</code>: &quot;{path}&quot; in {kind} has no
        child fields to list.
      </div>
    );
  }

  // Apply include/exclude filters. Flag names that don't exist in the
  // schema so drift between doc and CRD is visible instead of silent.
  let entries = Object.entries(children);
  const missing: string[] = [];
  if (include) {
    const keep = new Map(entries);
    entries = [];
    for (const name of include) {
      if (!keep.has(name)) {
        missing.push(name);
        continue;
      }
      entries.push([name, keep.get(name) as Schema]);
    }
  } else if (exclude) {
    const drop = new Set(exclude);
    for (const name of exclude) {
      if (!(name in children)) missing.push(name);
    }
    entries = entries.filter(([name]) => !drop.has(name));
  }

  if (missing.length) {
    return (
      <div className={styles.error}>
        <code>&lt;CRDFields&gt;</code>: unknown field(s) at {path} in {kind}:{' '}
        {missing.map((m) => `"${m}"`).join(', ')}.
      </div>
    );
  }

  const required = requiredOf(node);
  const scopeAnchors = collectAllScopes(schema);

  // The heading injected by the crd-reference-remark plugin already owns
  // the #slugify(path) anchor on reference pages. Giving the table the
  // same id would create duplicates that confuse anchor navigation; cross-
  // scope links in FieldRow below still resolve to the heading.
  return (
    <table className={styles.fieldTable}>
      {/*
        table-layout: fixed takes column widths from the first row. Set
        them explicitly via colgroup so thead doesn't need width classes.
      */}
      <colgroup>
        <col className={styles.fieldCol} />
        <col className={styles.typeCol} />
        <col className={styles.descCol} />
      </colgroup>
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([name, child]) => (
          <FieldRow
            key={name}
            name={name}
            schema={child}
            isRequired={required.has(name)}
            scopePath={path}
            scopeAnchors={scopeAnchors}
          />
        ))}
      </tbody>
    </table>
  );
}

export interface CRDBackLinkProps {
  // Dot-path of the scope to jump back to, e.g. "spec" or "spec.audit".
  to: string;
}

// Small "↑ Back to <parent>" link emitted by the remark plugin below every
// nested scope table. Not useful in a standalone guide embedding (where
// the parent scope isn't on the page), which is why it's a separate
// component rather than baked into <CRDFields>.
export function CRDBackLink({ to }: CRDBackLinkProps): React.ReactNode {
  return (
    <div className={styles.parentLink}>
      <a href={`#${slugify(to)}`}>
        ↑ Back to <code>{to}</code>
      </a>
    </div>
  );
}

export default CRDFields;
