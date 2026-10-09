// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderBody, renderSection } from './render-pr-body.mjs';

// Captured from run 36681404229 and the actual body of release PR #1181.
const env = JSON.parse(
  readFileSync(
    new URL('./fixtures/release-1181-env.json', import.meta.url),
    'utf8'
  )
);
const expected = readFileSync(
  new URL('./fixtures/release-1181-section.txt', import.meta.url),
  'utf8'
);

test('matches the historical release PR section byte-for-byte', () => {
  assert.equal(renderSection(env), expected);
});

test('preserves surrounding content and replaces the section idempotently', () => {
  const body = `Intro\n\n${expected}\nOutro\n`;
  assert.equal(renderBody(body, env), body);
  assert.equal(renderBody(renderBody(body, env), env), body);
  assert.equal(renderBody('Intro\n', env), `Intro\n\n---\n\n${expected}`);
});
