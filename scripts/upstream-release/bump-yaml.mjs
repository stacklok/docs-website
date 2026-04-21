#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Bumps the `version:` field for the given project id in
// .github/upstream-projects.yaml. Used by the manual-dispatch
// bootstrap path where a human kicks off the workflow with an
// explicit project_id + new_tag instead of waiting for Renovate.
//
// The auto (Renovate-driven) path does NOT use this script —
// Renovate already bumps the version itself.
//
// Usage:
//   node bump-yaml.mjs --id <project-id> --tag <new-tag>
//
// Fails if the project is not in the YAML or the tag already
// matches (no-op — caller should not open a PR).

import fs from 'node:fs';
import yaml from 'js-yaml';

const PROJECTS_FILE = '.github/upstream-projects.yaml';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--id') {
      args.id = argv[i + 1];
      i++;
    } else if (argv[i] === '--tag') {
      args.tag = argv[i + 1];
      i++;
    }
  }
  return args;
}

// Preserve comments and formatting by editing the raw text.
function bumpText(text, id, newTag) {
  const lines = text.split('\n');
  let inProject = false;
  let changed = false;
  let previous = null;
  for (let i = 0; i < lines.length; i++) {
    const idMatch = lines[i].match(/^\s*-\s*id:\s*(\S+)/);
    if (idMatch) {
      inProject = idMatch[1] === id;
      continue;
    }
    if (inProject && /^\s*version:\s*/.test(lines[i])) {
      const m = lines[i].match(/version:\s*(\S+)/);
      previous = m ? m[1] : null;
      lines[i] = lines[i].replace(/(version:\s*)\S+/, `$1${newTag}`);
      changed = true;
      break;
    }
  }
  if (!changed) {
    throw new Error(`Did not find version: line for project id ${id}`);
  }
  return { text: lines.join('\n'), previous };
}

function main() {
  const { id, tag } = parseArgs(process.argv.slice(2));
  if (!id || !tag) {
    console.error('Usage: bump-yaml.mjs --id <project-id> --tag <new-tag>');
    process.exit(1);
  }

  const raw = fs.readFileSync(PROJECTS_FILE, 'utf8');
  const parsed = yaml.load(raw);
  if (!parsed.projects.find((p) => p.id === id)) {
    console.error(`Unknown project id: ${id}`);
    process.exit(1);
  }

  const { text, previous } = bumpText(raw, id, tag);
  if (previous === tag) {
    console.error(
      `Project ${id} is already pinned at ${tag}; nothing to bump.`
    );
    process.exit(1);
  }

  fs.writeFileSync(PROJECTS_FILE, text);
  console.log(`Bumped ${id}: ${previous} -> ${tag}`);
}

main();
