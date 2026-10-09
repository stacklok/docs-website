// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import test from 'node:test';
import { compile } from '@mdx-js/mdx';
import { renderPage } from './generate-helm-reference.mjs';

const chart = {
  source: 'deploy/charts/operator',
  title: 'Operator Helm values',
  description: 'Helm values for the operator.',
  intro: 'Configure the operator with these values.',
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
