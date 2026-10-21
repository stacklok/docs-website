// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import yaml from 'yaml';
import {
  annotateValues,
  sourceDescriptions,
  renderPage,
  renderDescription,
  validateDescriptions,
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

test('coverage validation reports every missing value across charts', () => {
  assert.throws(
    () =>
      validateDescriptions([
        { chart, rows: [{ Key: 'first' }, { Key: 'second' }] },
        { chart: { source: 'another/chart' }, rows: [{ Key: 'third' }] },
      ]),
    (error) => {
      assert.match(error.message, /operator\/values.yaml: first/);
      assert.match(error.message, /operator\/values.yaml: second/);
      assert.match(error.message, /another\/chart\/values.yaml: third/);
      return true;
    }
  );
});

test('check mode validates all charts without writing pages or formatting', () => {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'helm-reference-check-'))
  );
  try {
    const scripts = path.join(root, 'scripts/upstream-release');
    fs.mkdirSync(scripts, { recursive: true });
    for (const file of ['generate-helm-reference.mjs', 'helm-values.gotmpl']) {
      fs.copyFileSync(new URL(file, import.meta.url), path.join(scripts, file));
    }
    fs.symlinkSync(
      fileURLToPath(new URL('../../node_modules', import.meta.url)),
      path.join(root, 'node_modules'),
      'dir'
    );
    fs.mkdirSync(path.join(root, '.github'));
    const charts = ['first', 'second'].map((name) => ({
      source: name,
      page: `pages/${name}.mdx`,
    }));
    fs.writeFileSync(
      path.join(root, '.github/upstream-projects.yaml'),
      yaml.stringify({
        projects: [{ id: 'fixture', helm: charts }],
      })
    );
    for (const { source } of charts) {
      fs.mkdirSync(path.join(root, source));
      fs.writeFileSync(
        path.join(root, source, 'Chart.yaml'),
        `name: ${source}\nversion: 1.0.0\n`
      );
      fs.writeFileSync(path.join(root, source, 'values.yaml'), 'port: 9090\n');
    }
    const bin = path.join(root, 'bin');
    fs.mkdirSync(bin);
    fs.writeFileSync(
      path.join(bin, 'helm-docs'),
      `#!${process.execPath}
process.stdout.write(JSON.stringify([{ Key: 'port', AutoDescription: process.env.FIXTURE_DESCRIPTION }]));
`,
      { mode: 0o755 }
    );
    const run = (description) =>
      spawnSync(
        process.execPath,
        [
          path.join(scripts, 'generate-helm-reference.mjs'),
          '--id',
          'fixture',
          '--clone',
          root,
          '--check',
        ],
        {
          encoding: 'utf8',
          env: { ...process.env, PATH: bin, FIXTURE_DESCRIPTION: description },
        }
      );
    const failed = run('');
    assert.equal(failed.status, 1, failed.stderr);
    assert.match(failed.stderr, /first\/values.yaml: port/);
    assert.match(failed.stderr, /second\/values.yaml: port/);
    const passed = run('Metrics listener port.');
    assert.equal(passed.status, 0, passed.stderr);
    assert.match(passed.stdout, /validated for 2 chart/);
    assert.equal(fs.existsSync(path.join(root, 'pages')), false);
    assert.equal(
      fs.readFileSync(path.join(root, 'first/values.yaml'), 'utf8'),
      'port: 9090\n'
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
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

test('private sources retain provenance without inaccessible repository links', async () => {
  const page = renderPage(
    chart,
    metadata,
    [
      {
        Key: 'replicas',
        Type: 'int',
        Default: '`1`',
        AutoDescription: 'Pod replicas.',
      },
    ],
    'stacklok/stacklok-enterprise-platform',
    '0123456789abcdef',
    false
  );
  assert.match(
    page,
    /Generated from the platform source at `0123456789abcdef`/
  );
  assert.doesNotMatch(
    page,
    /github\.com\/stacklok\/stacklok-enterprise-platform/
  );
  await compile(page.replace(/^---\n[\s\S]*?\n---\n/, ''));
});

test('YAML examples retain unindented parents and leading comments', async () => {
  for (const parent of ['appConfig', 'enterpriseConfig']) {
    const rendered = renderDescription(
      `Override configuration:\n\n# Example configuration\n${parent}:\n  logLevel: debug\n  settings:\n    enabled: true\n\nContinue with the deployment.`
    );
    const code = rendered.match(/```yaml\n([\s\S]*?)\n```/)[1];
    assert.match(code, /^# Example configuration/);
    assert.deepEqual(yaml.parse(code), {
      [parent]: { logLevel: 'debug', settings: { enabled: true } },
    });
    assert.match(rendered, /Continue with the deployment\./);
    await compile(rendered);
  }
});

test('indented prose and heading-like phrases remain prose', () => {
  for (const description of [
    'TLS is configured\n   below: ResolveSecretRef refuses a non-TLS peer regardless of who the\n   caller is.',
    'See the settings\n  below:\n    They apply to this workload.',
  ]) {
    assert.doesNotMatch(renderDescription(description), /```yaml/);
    assert.equal(renderDescription(description), description);
  }
});
