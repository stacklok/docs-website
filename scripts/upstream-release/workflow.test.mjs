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

const ownerStep = job.steps.find((step) => step.id === 'release_meta');

function resolveOwner(
  t,
  {
    message = 'Release v0.60.0 (#7013)\n\nRelease-Triggered-By: jhrozek\n\nCo-authored-by: release bot <bot@example.com>',
    annotated = true,
    releaseAuthor = 'app/toolhive-release-app',
    merger = 'ChrisJBurns',
    commitAuthor = 'toolhive-release-app[bot]',
    commitUnavailable = false,
    tagUnavailable = false,
  } = {}
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-owner-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, 'gh'),
    `#!/bin/sh
case "$1 $2" in
  'api repos/stacklok/toolhive/compare/v0.59.0...v0.60.0')
    printf '%s\\n' '{"commits":[],"total_commits":0}' ;;
  'api repos/stacklok/toolhive/git/ref/tags/v0.60.0')
    [ "$TAG_UNAVAILABLE" = false ] || exit 1
    printf '%s\\n' "$TAG_JSON" ;;
  'api repos/stacklok/toolhive/git/tags/tag-object')
    printf '%s\\n' 'release-commit' ;;
  'api repos/stacklok/toolhive/commits/release-commit')
    [ "$COMMIT_UNAVAILABLE" = false ] || exit 1
    printf '%s\\n' "$FIXTURE_COMMIT_JSON" ;;
  'api repos/stacklok/toolhive/commits/release-commit/pulls')
    printf '%s\\n' '7013' ;;
  'release view') printf '%s\\n' "$RELEASE_AUTHOR" ;;
  'pr view') printf '%s\\n' "$MERGER" ;;
  *) echo "Unexpected gh call: $*" >&2; exit 1 ;;
esac
`,
    { mode: 0o755 }
  );
  const outputFile = path.join(root, 'output');
  const result = spawnSync('bash', ['-eo', 'pipefail', '-c', ownerStep.run], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      GITHUB_OUTPUT: outputFile,
      REPO: 'stacklok/toolhive',
      PREV: 'v0.59.0',
      NEW: 'v0.60.0',
      TAG_JSON: JSON.stringify({
        object: {
          type: annotated ? 'tag' : 'commit',
          sha: annotated ? 'tag-object' : 'release-commit',
        },
      }),
      FIXTURE_COMMIT_JSON: JSON.stringify({
        commit: { message },
        author: { login: commitAuthor },
      }),
      RELEASE_AUTHOR: releaseAuthor,
      MERGER: merger,
      COMMIT_UNAVAILABLE: String(commitUnavailable),
      TAG_UNAVAILABLE: String(tagUnavailable),
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /Unexpected gh call/);
  const meta = JSON.parse(
    fs.readFileSync(path.join(root, '.release-meta.json'), 'utf8')
  );
  const output = fs.readFileSync(outputFile, 'utf8');
  assert.ok(output.includes(`owner=${meta.owner || ''}\n`));
  assert.ok(output.includes(`owner_source=${meta.owner_source || ''}\n`));
  return meta;
}

for (const annotated of [true, false]) {
  test(`prefers the release initiator for ${annotated ? 'annotated' : 'lightweight'} tags`, (t) => {
    const meta = resolveOwner(t, { annotated, releaseAuthor: 'publisher' });
    assert.equal(meta.owner, 'jhrozek');
    assert.equal(
      meta.owner_source,
      'Release-Triggered-By trailer on the tagged commit'
    );
  });
}

for (const message of [
  'Release v0.60.0',
  'Release v0.60.0\n\nRelease-Triggered-By: renovate',
  'Release v0.60.0\n\nRelease-Triggered-By: Renovate',
  'Release v0.60.0\n\nRelease-Triggered-By: StacklokBot',
  'Release v0.60.0\n\nRelease-Triggered-By: toolhive-release-app[bot]',
  'Release v0.60.0\n\nRelease-Triggered-By: app/toolhive-release-app',
  'Release v0.60.0\n\nRelease-Triggered-By: invalid login',
  'Release v0.60.0\n\nRelease-Triggered-By: alice\nRelease-Triggered-By: bob',
  'Release v0.60.0\n\nRelease-Triggered-By: alice\nRelease-Triggered-By:',
  'Release v0.60.0\n\nRelease-Triggered-By:\nRelease-Triggered-By: alice',
  'Release v0.60.0\n\nRelease-Triggered-By: alice\nRelease-Triggered-By: \t',
  'Release v0.60.0\n\nDocumentation mentions Release-Triggered-By: alice',
]) {
  test(`falls back to the release PR merger for unusable metadata: ${JSON.stringify(message)}`, (t) => {
    const meta = resolveOwner(t, { message });
    assert.equal(meta.owner, 'ChrisJBurns');
    assert.equal(meta.owner_source, 'merged release PR stacklok/toolhive#7013');
  });
}

test('retains human release author fallback when initiator is absent', (t) => {
  const meta = resolveOwner(t, { message: '', releaseAuthor: 'publisher' });
  assert.equal(meta.owner, 'publisher');
  assert.equal(meta.owner_source, 'release author');
});

test('falls back to the merger when tagged commit metadata is unavailable', (t) => {
  const meta = resolveOwner(t, { commitUnavailable: true });
  assert.equal(meta.owner, 'ChrisJBurns');
});

test('retains human release author fallback when tag lookup fails', (t) => {
  const meta = resolveOwner(t, {
    tagUnavailable: true,
    releaseAuthor: 'publisher',
  });
  assert.equal(meta.owner, 'publisher');
});

test('retains human tagged commit author fallback when the merger is a bot', (t) => {
  const meta = resolveOwner(t, {
    message: '',
    merger: 'app/release-bot',
    commitAuthor: 'commit-author',
  });
  assert.equal(meta.owner, 'commit-author');
  assert.equal(meta.owner_source, 'author of the tagged commit');
});

test('leaves the owner unresolved when all sources are bots', (t) => {
  const meta = resolveOwner(t, { message: '', merger: 'app/release-bot' });
  assert.equal(meta.owner, null);
  assert.equal(meta.owner_source, null);
});

for (const source of ['releaseAuthor', 'merger', 'commitAuthor']) {
  test(`rejects mixed-case bots in the ${source} fallback`, (t) => {
    const meta = resolveOwner(t, {
      message: '',
      releaseAuthor: 'app/release-bot',
      merger: 'app/release-bot',
      commitAuthor: 'app/release-bot',
      [source]: 'Renovate',
    });
    assert.equal(meta.owner, null);
  });
}

test('preserves the case of a human initiator login', (t) => {
  const meta = resolveOwner(t, {
    message: 'Release v0.60.0\n\nRelease-Triggered-By: ChrisJBurns',
  });
  assert.equal(meta.owner, 'ChrisJBurns');
});
