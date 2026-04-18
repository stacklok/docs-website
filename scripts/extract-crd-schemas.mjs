#!/usr/bin/env node
// Extract each CRD's openAPIV3Schema from the upstream ToolHive CRD YAMLs.
// For each CRD this writes three files under static/api-specs/crds/:
//   <plural>.schema.json  - JSON Schema (apiVersion/kind/metadata stripped)
//   <plural>.example.yaml - Minimal YAML skeleton covering required fields
// Plus a shared index.json with metadata and a reference graph.
//
// Usage:
//   node scripts/extract-crd-schemas.mjs [--src <dir>]
//
// Default src is ../toolhive/deploy/charts/operator-crds/files/crds relative
// to this repo. Set TOOLHIVE_CRD_DIR to override.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import yaml from 'yaml';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'static', 'api-specs', 'crds');

const defaultSrc = path.resolve(
  repoRoot,
  '..',
  'toolhive',
  'deploy',
  'charts',
  'operator-crds',
  'files',
  'crds'
);

const args = process.argv.slice(2);
const srcArgIdx = args.indexOf('--src');
const srcDir =
  srcArgIdx >= 0
    ? args[srcArgIdx + 1]
    : process.env.TOOLHIVE_CRD_DIR || defaultSrc;

if (!fs.existsSync(srcDir)) {
  console.error(`CRD source directory not found: ${srcDir}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

// Placeholder values for leaf types with no default/enum.
function placeholder(schema) {
  const t = schema.type;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (t === 'string') return '<string>';
  if (t === 'integer' || t === 'number') return 0;
  if (t === 'boolean') return false;
  if (t === 'array') return [];
  if (t === 'object') return {};
  return '<value>';
}

function buildRequiredExample(schema) {
  if (schema.type !== 'object' || !schema.properties)
    return placeholder(schema);
  const required = Array.isArray(schema.required) ? schema.required : [];
  const out = {};
  for (const key of required) {
    const child = schema.properties[key];
    if (!child) continue;
    if (child.type === 'object' && child.properties) {
      out[key] = buildRequiredExample(child);
    } else if (child.type === 'array') {
      out[key] = [];
    } else {
      out[key] = placeholder(child);
    }
  }
  return out;
}

function buildYamlSkeleton({ group, version, kind, scope, schema }) {
  const example = {
    apiVersion: `${group}/${version}`,
    kind,
    metadata: {
      name: `my-${kind.toLowerCase()}`,
      ...(scope === 'Namespaced' ? { namespace: 'default' } : {}),
    },
  };
  if (schema.properties?.spec) {
    example.spec = buildRequiredExample(schema.properties.spec);
    if (example.spec === undefined) example.spec = {};
  }
  return yaml.stringify(example, { indent: 2, lineWidth: 0 });
}

// Walk a schema and collect outgoing references to other CRDs.
// A field is treated as a reference when:
//   - Its name ends in "Ref" or "Refs", AND
//   - The field's description or its nested name subfield's description
//     mentions a known CRD kind.
// Returns an array of { path, targetKind } entries. Multiple paths per target
// are preserved so callers can list every field that points at a given Kind.
function findReferences(schema, knownKinds, ownKind) {
  const results = [];
  const seen = new Set();

  function check(name, node) {
    if (!/Refs?$/.test(name)) return null;
    const textParts = [];
    if (node?.description) textParts.push(node.description);
    if (node?.items?.description) textParts.push(node.items.description);
    if (node?.properties?.name?.description) {
      textParts.push(node.properties.name.description);
    }
    if (node?.items?.properties?.name?.description) {
      textParts.push(node.items.properties.name.description);
    }
    const text = textParts.join(' ');
    for (const kind of knownKinds) {
      if (kind === ownKind) continue;
      if (new RegExp(`\\b${kind}\\b`).test(text)) return kind;
    }
    return null;
  }

  function walk(node, jsonPtr) {
    if (!node || typeof node !== 'object') return;
    if (node.properties) {
      for (const [key, child] of Object.entries(node.properties)) {
        const target = check(key, child);
        if (target) {
          const dedupeKey = `${target}@${jsonPtr}.${key}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            results.push({ path: `${jsonPtr}.${key}`, targetKind: target });
          }
        }
        walk(child, `${jsonPtr}.${key}`);
      }
    }
    if (node.items) walk(node.items, `${jsonPtr}[]`);
  }

  walk(schema, '');
  return results;
}

// Pass 1: parse all CRDs and collect metadata.
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.yaml'));
const crds = [];

for (const file of files) {
  const full = path.join(srcDir, file);
  const doc = yaml.parse(fs.readFileSync(full, 'utf8'));

  if (doc?.kind !== 'CustomResourceDefinition') {
    console.warn(`Skipping ${file}: not a CRD`);
    continue;
  }

  const kind = doc.spec?.names?.kind;
  const plural = doc.spec?.names?.plural;
  const group = doc.spec?.group;
  const shortNames = doc.spec?.names?.shortNames || [];
  const scope = doc.spec?.scope;

  const versions = doc.spec?.versions || [];
  const served = versions.find((v) => v.storage) || versions[0];
  if (!served?.schema?.openAPIV3Schema) {
    console.warn(`Skipping ${file}: no openAPIV3Schema`);
    continue;
  }

  const schema = { ...served.schema.openAPIV3Schema };

  // Strip Kubernetes boilerplate; these fields are identical on every CRD.
  if (schema.properties) {
    const stripped = { ...schema.properties };
    for (const key of ['apiVersion', 'kind', 'metadata']) delete stripped[key];
    schema.properties = stripped;
  }

  crds.push({
    file,
    kind,
    plural,
    group,
    version: served.name,
    shortNames,
    scope,
    schema,
  });
}

const knownKinds = crds.map((c) => c.kind);
const outgoingByKind = new Map();
for (const crd of crds) {
  outgoingByKind.set(
    crd.kind,
    findReferences(crd.schema, knownKinds, crd.kind)
  );
}

// Build inverse: for each kind, which other kinds reference it.
const incomingByKind = new Map();
for (const kind of knownKinds) incomingByKind.set(kind, []);
for (const [src, refs] of outgoingByKind) {
  for (const ref of refs) {
    incomingByKind
      .get(ref.targetKind)
      .push({ sourceKind: src, path: ref.path });
  }
}

// Pass 2: write output files.
const index = [];
for (const crd of crds) {
  const { kind, plural, group, version, shortNames, scope, schema } = crd;

  const wrapped = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: kind,
    description: schema.description || `${kind} custom resource`,
    'x-kubernetes-group': group,
    'x-kubernetes-kind': kind,
    'x-kubernetes-version': version,
    'x-kubernetes-plural': plural,
    'x-kubernetes-short-names': shortNames,
    'x-kubernetes-scope': scope,
    ...schema,
  };

  const schemaFile = path.join(outDir, `${plural}.schema.json`);
  fs.writeFileSync(schemaFile, JSON.stringify(wrapped, null, 2) + '\n');

  const exampleFile = path.join(outDir, `${plural}.example.yaml`);
  fs.writeFileSync(
    exampleFile,
    buildYamlSkeleton({ group, version, kind, scope, schema })
  );

  const outgoing = outgoingByKind.get(kind) || [];
  const incoming = incomingByKind.get(kind) || [];

  // Group outgoing references by target kind so a target with multiple field
  // paths (e.g. MCPServer -> MCPExternalAuthConfig via authServerRef AND
  // externalAuthConfigRef) renders as one bullet with two fields listed.
  const refByTarget = new Map();
  for (const r of outgoing) {
    if (!refByTarget.has(r.targetKind)) refByTarget.set(r.targetKind, []);
    refByTarget.get(r.targetKind).push(r.path.replace(/^\./, ''));
  }
  const incomingByKindSrc = new Map();
  for (const r of incoming) {
    if (!incomingByKindSrc.has(r.sourceKind))
      incomingByKindSrc.set(r.sourceKind, []);
    incomingByKindSrc.get(r.sourceKind).push(r.path.replace(/^\./, ''));
  }

  index.push({
    kind,
    plural,
    group,
    version,
    shortNames,
    scope,
    references: [...refByTarget.entries()]
      .map(([targetKind, paths]) => ({
        targetKind,
        paths: [...new Set(paths)].sort(),
      }))
      .sort((a, b) => a.targetKind.localeCompare(b.targetKind)),
    referencedBy: [...incomingByKindSrc.entries()]
      .map(([sourceKind, paths]) => ({
        sourceKind,
        paths: [...new Set(paths)].sort(),
      }))
      .sort((a, b) => a.sourceKind.localeCompare(b.sourceKind)),
  });
  console.log(`Wrote ${path.relative(repoRoot, schemaFile)}`);
  console.log(`Wrote ${path.relative(repoRoot, exampleFile)}`);
}

fs.writeFileSync(
  path.join(outDir, 'index.json'),
  JSON.stringify(index, null, 2) + '\n'
);
console.log(`\nExtracted ${index.length} CRD schema(s).`);
