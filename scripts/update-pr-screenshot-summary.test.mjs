import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scripts = path.dirname(fileURLToPath(import.meta.url));

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'screenshot-summary-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.com');
  git('remote', 'add', 'origin', 'https://github.com/example/docs.git');
  fs.mkdirSync(path.join(root, 'scripts'));
  for (const name of [
    'update-pr-screenshot-summary.mjs',
    'pr-screenshot-summary.mjs',
  ]) {
    fs.copyFileSync(path.join(scripts, name), path.join(root, 'scripts', name));
  }
  const snapshot =
    'tests/visual/pages.spec.ts-snapshots/home-light-desktop-linux';
  fs.mkdirSync(path.dirname(path.join(root, snapshot)), { recursive: true });
  fs.writeFileSync(path.join(root, `${snapshot}.png`), 'before');
  fs.writeFileSync(
    path.join(root, `${snapshot}.json`),
    JSON.stringify({
      url: { path: '/' },
      testFile: 'tests/visual/pages.spec.ts',
    })
  );
  git('add', '.');
  git('commit', '--quiet', '-m', 'Base');
  const base = git('rev-parse', 'HEAD');
  fs.writeFileSync(path.join(root, `${snapshot}.png`), 'after');
  git('commit', '--quiet', '-am', 'Updated baseline');
  const head = git('rev-parse', 'HEAD');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, 'gh'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args[1] === 'view') {
  console.log(process.env.MOCK_PR);
} else if (args[1] === 'edit') {
  fs.copyFileSync(args[args.indexOf('--body-file') + 1], process.env.SAVED_BODY);
} else {
  throw new Error('Unexpected gh command');
}
`,
    { mode: 0o755 }
  );
  const savedBody = path.join(root, 'saved-body.md');
  return {
    savedBody,
    head,
    run(overrides = {}) {
      return execFileSync(
        'node',
        ['scripts/update-pr-screenshot-summary.mjs'],
        {
          cwd: root,
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${bin}${path.delimiter}${process.env.PATH}`,
            PR_NUMBER: '123',
            BASE_SHA: base,
            HEAD_SHA: head,
            SAVED_BODY: savedBody,
            MOCK_PR: JSON.stringify({
              body: 'Author description',
              headRefOid: head,
              state: 'OPEN',
              ...overrides,
            }),
          },
        }
      );
    },
  };
}

test('appends baseline images and replaces the existing summary once', (t) => {
  const f = fixture(t);
  f.run();
  const body = fs.readFileSync(f.savedBody, 'utf8');
  assert.ok(body.startsWith('Author description\n\n'));
  assert.match(body, /Before/);
  assert.match(body, /After/);
  assert.ok(body.includes(`/raw/${f.head}/tests/visual/`));
  assert.match(f.run({ body }), /summary unchanged/);
  f.run({
    body: body.replace('## Visual regression screenshots', 'Stale summary'),
  });
  const refreshed = fs.readFileSync(f.savedBody, 'utf8');
  assert.equal(refreshed, body);
});

test('skips an advanced PR head', (t) => {
  const f = fixture(t);
  assert.match(f.run({ headRefOid: 'newer-head' }), /skipping stale/);
  assert.equal(fs.existsSync(f.savedBody), false);
});

test('skips a closed PR', (t) => {
  const f = fixture(t);
  assert.match(f.run({ state: 'CLOSED' }), /skipping stale/);
  assert.equal(fs.existsSync(f.savedBody), false);
});
