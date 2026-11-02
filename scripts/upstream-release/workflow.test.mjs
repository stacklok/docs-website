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
    new URL(
      '../../.github/workflows/upstream-release-docs.yml',
      import.meta.url
    ),
    'utf8'
  )
);
const job = workflow.jobs.augment;
const draftStep = job.steps.find((step) => step.name === 'Convert PR to draft');

function convertToDraft(t, { isDraft = false, rejectMutation = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-draft-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, 'gh'),
    `#!/bin/sh
if [ "$1 $2" = "pr view" ]; then
  printf '%s\\n' "$IS_DRAFT"
elif [ "$1 $2" = "pr ready" ]; then
  if [ "$GH_TOKEN" != "fixture-app-token" ] || [ "$REJECT_MUTATION" = true ]; then
    echo 'Resource not accessible by integration (convertPullRequestToDraft)' >&2
    exit 1
  fi
  printf '%s\\n' "$*" > "$MUTATION_LOG"
else
  exit 1
fi
`,
    { mode: 0o755 }
  );

  // Resolve the credential from the actual workflow. The default job token
  // can read PR metadata but cannot perform the draft mutation in the failed run.
  const expression = draftStep.env.GH_TOKEN || job.env.GH_TOKEN;
  const tokenMatch = expression.match(
    /^\$\{\{ steps\.(\w+)\.outputs\.token \}\}$/
  );
  let token = 'fixture-github-token';
  if (tokenMatch) {
    const exchange = job.steps.find((step) => step.id === tokenMatch[1]);
    assert.match(exchange.uses, /^octo-sts\/action@/);
    assert.equal(exchange.with.scope, 'stacklok/docs-website');
    assert.equal(exchange.with.identity, 'upstream-release-docs');
    assert.equal(exchange.with.domain, 'octo-sts.stacklok.dev');
    assert.equal(exchange.if, draftStep.if);
    assert.ok(job.steps.indexOf(exchange) < job.steps.indexOf(draftStep));
    token = 'fixture-app-token';
  }

  const mutationLog = path.join(root, 'mutation');
  const result = spawnSync('bash', ['-eo', 'pipefail', '-c', draftStep.run], {
    encoding: 'utf8',
    cwd: root,
    env: {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      GH_TOKEN: token,
      GITHUB_REPOSITORY: 'stacklok/docs-website',
      PR_NUMBER: '1307',
      IS_DRAFT: String(isDraft),
      REJECT_MUTATION: String(rejectMutation),
      MUTATION_LOG: mutationLog,
    },
  });
  return {
    result,
    mutation: fs.existsSync(mutationLog)
      ? fs.readFileSync(mutationLog, 'utf8').trim()
      : null,
  };
}

test('converts an existing release PR using an app token before checkout', (t) => {
  const { result, mutation } = convertToDraft(t);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(mutation, 'pr ready 1307 --repo stacklok/docs-website --undo');
});

test('leaves an already-draft release PR unchanged', (t) => {
  const { result, mutation } = convertToDraft(t, { isDraft: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(mutation, null);
});

test('stops augmentation when draft conversion fails', (t) => {
  const { result, mutation } = convertToDraft(t, { rejectMutation: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /convertPullRequestToDraft/);
  assert.equal(mutation, null);
});
