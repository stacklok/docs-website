// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { renderSessionReport } from './post-session-report.mjs';

const env = {
  SESSION: 'generation',
  SESSION_OUTCOME: 'success',
  RUN_URL: 'https://github.com/stacklok/docs-website/actions/runs/123',
};

// Synthetic values only; construct them to avoid storing credential-shaped
// strings in the repository while exercising the real publication boundary.
const credentials = [
  ...['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_'].map(
    (prefix) => prefix + 'A'.repeat(36)
  ),
  'github_pat_' + 'B'.repeat(30),
  'sk-ant-' + 'C'.repeat(30),
  ...['AKIA', 'ASIA'].map((prefix) => prefix + 'D'.repeat(16)),
  ...['xoxb-', 'xoxp-', 'xoxa-', 'xoxs-', 'xoxr-'].map(
    (prefix) => prefix + 'E'.repeat(20)
  ),
  ['eyJ' + 'F'.repeat(20), 'eyJ' + 'G'.repeat(20), 'H'.repeat(20)].join('.'),
];
const secretResponse = `**Validation passed.**\n\n${credentials.join('\n')}\n\nNormal prose remains.`;

function assertRedacted(body) {
  for (const credential of credentials) assert.ok(!body.includes(credential));
  for (const kind of [
    'GITHUB_TOKEN',
    'ANTHROPIC_KEY',
    'AWS_KEY_ID',
    'SLACK_TOKEN',
    'JWT',
  ]) {
    assert.ok(body.includes(`[REDACTED_${kind}]`));
  }
  assert.ok(body.includes('**Validation passed.**'));
  assert.ok(body.includes('Normal prose remains.'));
}

test('redacts the pinned action credential formats while preserving the report', () => {
  assertRedacted(
    renderSessionReport([{ type: 'result', result: secretResponse }], env)
  );
});

test('redacts credentials before truncation can leave a partial token', () => {
  const headerLength =
    renderSessionReport([{ type: 'result', result: 'x' }], env).length - 2;
  const suffix =
    '\n\n> Report truncated. See the workflow run for the full response.';
  const cutoff = 60000 - headerLength - suffix.length;
  const response =
    'x'.repeat(cutoff - 10) + credentials[0] + ' ' + 'z'.repeat(1000);
  const body = renderSessionReport([{ type: 'result', result: response }], env);
  assert.match(body, /Report truncated/);
  assert.doesNotMatch(body, /ghp_/);
});

test('publishes only the final result, excluding instructions and tools', () => {
  const body = renderSessionReport(
    [
      { type: 'system', message: 'SYSTEM INSTRUCTIONS' },
      { type: 'user', message: { content: 'SKILL INSTRUCTIONS' } },
      { type: 'assistant', message: { content: 'INTERMEDIATE NARRATION' } },
      { type: 'user', tool_result: 'RAW TOOL OUTPUT' },
      { type: 'result', result: 'Earlier result' },
      { type: 'result', result: '**Finished.**\n\n- Verified source.' },
    ],
    env
  );
  assert.match(body, /Claude generation report/);
  assert.match(body, /\*\*Finished\.\*\*\n\n- Verified source\./);
  assert.ok(body.includes(env.RUN_URL));
  assert.doesNotMatch(
    body,
    /INSTRUCTIONS|NARRATION|TOOL OUTPUT|Earlier result/
  );
});

test('never substitutes assistant narration or nested results for missing output', () => {
  for (const messages of [
    [],
    null,
    { type: 'assistant', message: { content: 'DO NOT POST' } },
    [{ type: 'user', tool_result: { type: 'result', result: 'DO NOT POST' } }],
    [{ type: 'result', result: '' }],
    [{ type: 'result', result: { text: 'DO NOT POST' } }],
  ]) {
    const body = renderSessionReport(messages, env);
    assert.match(body, /Final response unavailable/);
    assert.doesNotMatch(body, /DO NOT POST/);
  }
});

test('labels failed editorial sessions and preserves their final explanation', () => {
  const body = renderSessionReport(
    { type: 'result', is_error: true, result: 'Could not verify the claims.' },
    { ...env, SESSION: 'editorial', SESSION_OUTCOME: 'failure' }
  );
  assert.match(body, /Claude editorial review report/);
  assert.match(body, /Session status:\*\* failure/);
  assert.match(body, /Could not verify the claims\./);
});

test('bounds long reports and links to the complete run', () => {
  const body = renderSessionReport(
    [{ type: 'result', result: 'Long response. 😀\n'.repeat(10000) }],
    env
  );
  assert.ok(body.length <= 60001);
  assert.match(body, /Report truncated/);
  assert.ok(body.includes(env.RUN_URL));
});

const workflow = parse(
  fs.readFileSync(
    new URL(
      '../../.github/workflows/upstream-release-docs.yml',
      import.meta.url
    ),
    'utf8'
  )
);
const steps = workflow.jobs.augment.steps;

test('workflow reports each session before output is cleared or overwritten', () => {
  const position = (name) => steps.findIndex((step) => step.name === name);
  const generation = steps.findIndex((step) => step.id === 'skill_gen');
  const editorial = steps.findIndex((step) => step.id === 'skill_review');
  const generationReport = position('Post generation report');
  const clear = position('Clear previous session output');
  const editorialReport = position('Post editorial report');
  const stats = steps.findIndex((step) => step.id === 'skill_gen_stats');
  assert.ok(generation < generationReport);
  assert.ok(generationReport < clear && stats < clear);
  assert.ok(clear < editorial && editorial < editorialReport);
  assert.match(steps[clear].run, /rm -f -- "\$EXECUTION_FILE"/);
  assert.equal(
    steps[clear].env.EXECUTION_FILE,
    '${{ steps.skill_gen.outputs.execution_file }}'
  );
  for (const [position, id] of [
    [generationReport, 'skill_gen'],
    [editorialReport, 'skill_review'],
  ]) {
    const step = steps[position];
    assert.equal(
      step.env.EXECUTION_FILE,
      `\${{ steps.${id}.outputs.execution_file }}`
    );
    assert.equal(step['continue-on-error'], true);
    assert.ok(step.if.includes(`steps.${id}.outcome == 'failure'`));
    assert.ok(step.if.includes(`steps.${id}.outcome == 'success'`));
    assert.equal(step.env.GH_TOKEN, undefined);
    assert.equal(step.run, 'node "$REPORTER"');
  }
  const prepare = steps.find((step) => step.id === 'session_reporter');
  assert.equal(prepare.env.WORKFLOW_SHA, '${{ github.workflow_sha }}');
  assert.match(
    prepare.run,
    /git show "\$WORKFLOW_SHA:scripts\/upstream-release\/post-session-report.mjs"/
  );
  assert.ok(steps.indexOf(prepare) < generation);
});

test('posts literal response text through JSON and handles unreadable output', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-report-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  const captured = path.join(root, 'request.json');
  fs.writeFileSync(
    path.join(bin, 'gh'),
    `#!${process.execPath}\nconst fs = require('node:fs');\nfs.writeFileSync(process.env.CAPTURED, JSON.stringify({args:process.argv.slice(2), request:JSON.parse(fs.readFileSync(0,'utf8'))}));\n`,
    { mode: 0o755 }
  );
  const execution = path.join(root, 'execution.json');
  const literal = 'Kept `code`, $(shell), "quotes", and\nnewlines.';
  for (const contents of [
    JSON.stringify([{ type: 'result', result: literal }]),
    JSON.stringify([{ type: 'result', result: secretResponse }]),
    'BROKEN JSON',
    null,
  ]) {
    if (contents === null) {
      fs.rmSync(execution);
    } else {
      fs.writeFileSync(execution, contents);
    }
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(new URL('./post-session-report.mjs', import.meta.url))],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          ...env,
          PR_NUMBER: '1313',
          GITHUB_REPOSITORY: 'stacklok/docs-website',
          EXECUTION_FILE: execution,
          CAPTURED: captured,
          PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        },
      }
    );
    assert.equal(result.status, 0, result.stderr);
    const posted = JSON.parse(fs.readFileSync(captured, 'utf8'));
    assert.deepEqual(posted.args, [
      'api',
      '--method',
      'POST',
      'repos/stacklok/docs-website/issues/1313/comments',
      '--input',
      '-',
    ]);
    if (contents === 'BROKEN JSON' || contents === null) {
      assert.match(posted.request.body, /Final response unavailable/);
      assert.doesNotMatch(posted.request.body, /BROKEN JSON/);
    } else if (contents.includes('Validation passed.')) {
      assertRedacted(posted.request.body);
    } else {
      assert.ok(posted.request.body.includes(literal));
    }
  }
});
