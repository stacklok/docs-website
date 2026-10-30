// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';

const workflow = parse(
  fs.readFileSync(
    new URL('../.github/workflows/pr-screenshot-summary.yaml', import.meta.url),
    'utf8'
  )
);
const resolveStep = workflow.jobs['update-description'].steps.find(
  (step) => step.id === 'visual'
);

function resolveArtifacts(t, artifacts, { unavailable = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-job-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(root, 'jobs.json.fixture'),
    JSON.stringify({
      jobs: [
        {
          name: 'Static checks / Lint and format checks',
          conclusion: 'success',
        },
        {
          name: 'Visual regression / Playwright visual snapshots',
          conclusion: 'failure',
          html_url: 'https://github.com/example/docs/actions/runs/1/job/2',
        },
      ],
    })
  );
  fs.writeFileSync(
    path.join(root, 'artifacts.json.fixture'),
    typeof artifacts === 'string' ? artifacts : JSON.stringify({ artifacts })
  );
  fs.writeFileSync(
    path.join(bin, 'gh'),
    `#!/bin/sh
case "$2" in
  */jobs?*) cat "$RUNNER_TEMP/jobs.json.fixture" ;;
  */artifacts?*)
    if [ "$ARTIFACTS_UNAVAILABLE" = true ]; then exit 1; fi
    cat "$RUNNER_TEMP/artifacts.json.fixture" ;;
  *) exit 1 ;;
esac
`,
    { mode: 0o755 }
  );
  const outputFile = path.join(root, 'outputs');
  const result = spawnSync('bash', ['-eo', 'pipefail', '-c', resolveStep.run], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      RUNNER_TEMP: root,
      GITHUB_OUTPUT: outputFile,
      REPO: 'example/docs',
      RUN_ID: '1',
      ARTIFACTS_UNAVAILABLE: String(unavailable),
    },
  });
  const outputs = Object.fromEntries(
    fs
      .readFileSync(outputFile, 'utf8')
      .trim()
      .split('\n')
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
  assert.equal(outputs.conclusion, 'failure');
  assert.equal(
    outputs.job_url,
    'https://github.com/example/docs/actions/runs/1/job/2'
  );
  return { result, outputs };
}

const fullReport = {
  name: 'playwright-report',
  expired: false,
  id: 10,
  size_in_bytes: 55_544_517,
};
const compactReport = {
  name: 'visual-failure-details',
  expired: false,
  id: 20,
  size_in_bytes: 21_006,
};

test('selects compact details ahead of a large full report', (t) => {
  const { result, outputs } = resolveArtifacts(t, [fullReport, compactReport]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(outputs.artifact_id, '20');
  assert.equal(outputs.artifact_size, '21006');
});

test('falls back to the full report when compact details are expired', (t) => {
  const { result, outputs } = resolveArtifacts(t, [
    { ...compactReport, expired: true },
    fullReport,
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(outputs.artifact_id, '10');
});

test('preserves the failure conclusion when no artifact is available', (t) => {
  const { result, outputs } = resolveArtifacts(t, []);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(outputs.artifact_id, '');
  assert.equal(outputs.artifact_size, '0');
});

test('preserves the failure conclusion when artifact discovery fails', (t) => {
  const { result, outputs } = resolveArtifacts(t, [], { unavailable: true });
  assert.notEqual(result.status, 0);
  assert.equal(outputs.artifact_id, undefined);
});

test('preserves the failure conclusion when artifact parsing fails', (t) => {
  const { result, outputs } = resolveArtifacts(t, '{malformed');
  assert.notEqual(result.status, 0);
  assert.equal(outputs.artifact_id, undefined);
});
