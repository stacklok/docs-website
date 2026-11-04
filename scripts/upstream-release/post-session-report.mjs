#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function renderSessionReport(messages, env) {
  // Only the SDK's final result is suitable for a PR comment. Assistant
  // messages can contain intermediate narration; never fall back to them.
  const results = Array.isArray(messages) ? messages : [messages];
  const result = results.findLast((message) => message?.type === 'result');
  const response =
    typeof result?.result === 'string' ? result.result.trim() : '';
  const label = { generation: 'generation', editorial: 'editorial review' }[
    env.SESSION
  ];
  if (!label) throw new Error('Unknown session');
  const header = `## Claude ${label} report\n\n**Session status:** ${env.SESSION_OUTCOME} · [Workflow run](${env.RUN_URL})\n\n`;
  if (!response) {
    return `${header}> Final response unavailable. See the workflow run for session details.\n`;
  }

  // Leave room below GitHub's comment limit, including for Unicode text.
  const limit = 60000 - header.length;
  const suffix =
    '\n\n> Report truncated. See the workflow run for the full response.';
  const body =
    response.length > limit
      ? response.slice(0, limit - suffix.length) + suffix
      : response;
  return header + body + '\n';
}

export function postSessionReport(env) {
  if (!/^[1-9][0-9]*$/.test(env.PR_NUMBER ?? ''))
    throw new Error('PR_NUMBER must be a positive integer');
  if (!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY ?? ''))
    throw new Error('GITHUB_REPOSITORY must be owner/repo');
  let messages;
  try {
    messages = JSON.parse(readFileSync(env.EXECUTION_FILE, 'utf8'));
  } catch {
    // Missing or malformed output must never cause a transcript dump.
    messages = [];
  }
  const body = renderSessionReport(messages, env);
  execFileSync(
    'gh',
    [
      'api',
      '--method',
      'POST',
      `repos/${env.GITHUB_REPOSITORY}/issues/${env.PR_NUMBER}/comments`,
      '--input',
      '-',
    ],
    { input: JSON.stringify({ body }), encoding: 'utf8' }
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  postSessionReport(process.env);
}
