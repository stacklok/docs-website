#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Applies pin_files substitutions declared for a project in
// .github/upstream-projects.yaml. Called by the upstream-release-docs
// workflow after Renovate has already bumped the `version:` field.
//
// Usage:
//   node apply-pin-files.mjs --id <project-id> --tag <new-tag>
//
// pin_files entries supported:
//   { path: '<file>', replace_latest: true }
//       Flips `<repo>@latest` (or `<repo>@vX.Y.Z`) to `<repo>@<new-tag>`
//       so unrelated `@latest` strings elsewhere in the file are safe.

import fs from 'node:fs';
import yaml from 'yaml';

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

function applyPinFiles(project, newTag) {
  for (const pin of project.pin_files ?? []) {
    const filePath = pin.path;
    if (!fs.existsSync(filePath)) {
      console.error(`pin_files: skipping missing file ${filePath}`);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    if (pin.replace_latest) {
      const repoEscaped = project.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(${repoEscaped})@(?:latest|v[\\w.\\-]+)`,
        'g'
      );
      updated = updated.replace(pattern, `$1@${newTag}`);
    }
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      console.log(`pin_files: updated ${filePath}`);
    }
  }
}

function main() {
  const { id, tag } = parseArgs(process.argv.slice(2));
  if (!id || !tag) {
    console.error(
      'Usage: apply-pin-files.mjs --id <project-id> --tag <new-tag>'
    );
    process.exit(1);
  }

  const parsed = yaml.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const project = parsed.projects.find((p) => p.id === id);
  if (!project) {
    console.error(`Unknown project id: ${id}`);
    process.exit(1);
  }

  applyPinFiles(project, tag);
}

main();
