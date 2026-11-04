#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Match the credential formats redacted by the pinned claude-code-action's
// src/github/utils/sanitizer.ts (374f254f5efaf968abfe15d399fd90972e8138b9).
// Actions log masking does not apply to the GitHub API request body.
function redactSecrets(content) {
  return content
    .replace(/gh[pousr]_[A-Za-z0-9]{36}\b/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/github_pat_[A-Za-z0-9_]{11,221}\b/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/sk-ant-[A-Za-z0-9_-]{20,}/g, '[REDACTED_ANTHROPIC_KEY]')
    .replace(
      /(?:\b|(?<=\\(?:[nrtbf"\\/]|u[0-9a-fA-F]{4}))|(?<=\[[0-9;]*m))(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
      '[REDACTED_AWS_KEY_ID]'
    )
    .replace(/xox[abpsr]-[A-Za-z0-9-]{10,}/g, '[REDACTED_SLACK_TOKEN]')
    .replace(
      /eyJ[A-Za-z0-9_-]{10,2000}\.eyJ[A-Za-z0-9_-]{10,4000}\.[A-Za-z0-9_-]{10,2000}\b/g,
      '[REDACTED_JWT]'
    );
}

export function renderSessionReport(messages, env) {
  // Only the SDK's final result is suitable for a PR comment. Assistant
  // messages can contain intermediate narration; never fall back to them.
  const results = Array.isArray(messages) ? messages : [messages];
  const result = results.findLast((message) => message?.type === 'result');
  const response =
    typeof result?.result === 'string'
      ? redactSecrets(result.result.trim())
      : '';
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
