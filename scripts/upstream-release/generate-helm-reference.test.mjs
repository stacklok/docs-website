// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import test from 'node:test';
import { compile } from '@mdx-js/mdx';
import yaml from 'yaml';
import {
  annotateValues,
  sourceDescriptions,
  renderPage,
} from './generate-helm-reference.mjs';

const chart = {
  source: 'deploy/charts/operator',
  title: 'Operator Helm values',
  description: 'Helm values for the operator.',
  intro: 'Configure the operator with these values.',
  related: [
    {
      label: 'Deploy the operator',
      href: '../../guides-k8s/deploy-operator.mdx',
    },
  ],
};
const metadata = { name: 'toolhive-operator', version: '1.0.0' };
const render = (rows) =>
  renderPage(chart, metadata, rows, 'stacklok/toolhive', 'v1.0.0');

test('upstream descriptions and large defaults compile safely as MDX', async () => {
  const page = render([
    {
      Key: 'operator.resources',
      Type: 'object',
      Default: `\`${JSON.stringify({ example: '<VALUE> {placeholder} ```', limits: { memory: '128Mi' }, note: 'x'.repeat(100) })}\``,
      AutoDescription:
        'Use <VALUE> and {placeholder}; preserve `map[string]any` and pipes a | b.',
    },
  ]);
  assert.match(page, /&#60;VALUE&#62; and &#123;placeholder&#125;/);
  assert.match(page, /`map\[string\]any`/);
  assert.match(page, /<details>/);
  assert.match(page, /limits:\n\s+memory: 128Mi/);
  await compile(page.replace(/^---\n[\s\S]*?\n---\n/, ''));
});

test('annotation overrides take precedence over inferred descriptions/defaults', () => {
  const page = render([
    {
      Key: 'image.tag',
      Type: 'string',
      Default: 'Defaults to `appVersion`.',
      AutoDefault: '`""`',
      Description: 'Explicit description.',
      AutoDescription: 'Inferred description.',
    },
  ]);
  assert.match(page, /Defaults to `appVersion`/);
  assert.match(page, /Explicit description/);
  assert.doesNotMatch(page, /Inferred description/);
  assert.match(page, /\/blob\/v1.0.0\/deploy\/charts\/operator\/values.yaml/);
});

test('incomplete chart documentation fails instead of publishing empty reference content', () => {
  assert.throws(() => render([]), /No Helm values/);
  assert.throws(
    () => render([{ Key: 'operator.image', Type: 'string', Default: '`""`' }]),
    /Missing description.*operator.image/
  );
});

test('raw continuation comments preserve paragraphs, YAML examples, and lists', async () => {
  const source = `operator:
  # -- Default Secrets for workloads.
  #
  # For example:
  #   defaultImagePullSecrets:
  #     - name: regcred
  #
  # - Names must match the Secret.
  #   Create it in the workload namespace.
  # - Use one Secret per registry.
  defaultImagePullSecrets: []
`;
  const description = sourceDescriptions(source).get(
    'operator.defaultImagePullSecrets'
  );
  assert.match(description, /workloads\.\n\nFor example:/);
  const page = render([
    {
      Key: 'operator.defaultImagePullSecrets',
      Type: 'list',
      Default: '`[]`',
      SourceDescription: description,
      AutoDescription: 'flattened description',
    },
  ]);
  const code = page.match(/```yaml\n([\s\S]*?)\n```/)[1];
  assert.deepEqual(yaml.parse(code), {
    defaultImagePullSecrets: [{ name: 'regcred' }],
  });
  assert.match(
    page,
    /- Names must match the Secret\.\n {2}Create it in the workload namespace\./
  );
  assert.doesNotMatch(page, /flattened description/);
  await compile(page.replace(/^---\n[\s\S]*?\n---\n/, ''));
});

test('curated passthrough descriptions preserve values and fail for absent fields', () => {
  const source = 'config:\n  database:\n    host: ""\n';
  const annotated = annotateValues(source, {
    config: 'Application configuration.\nSee the configuration guide.',
  });
  assert.deepEqual(yaml.parse(annotated), yaml.parse(source));
  assert.equal(
    sourceDescriptions(annotated).get('config'),
    'Application configuration.\nSee the configuration guide.'
  );
  assert.throws(
    () => annotateValues(source, { nonexistent: 'Description' }),
    /absent value/
  );
});

test('coverage language and product spelling remain accurate', () => {
  const page = render([
    {
      Key: 'operator.image',
      Type: 'string',
      Default: '`"image"`',
      AutoDescription: 'Image for Toolhive runners.',
    },
  ]);
  assert.match(page, /Image for ToolHive runners/);
  assert.match(page, /values declared in the chart's default/);
  assert.match(page, /optional settings and inherited/);
});
