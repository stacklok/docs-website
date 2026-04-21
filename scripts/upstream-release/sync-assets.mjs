#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Copies declared upstream assets from the shallow-clone directory into
// the docs repo for the given project. Declared per-project in
// .github/upstream-projects.yaml under `assets:`:
//
//   assets:
//     - source: <path in upstream repo>
//       destination: <path in this repo>
//
// Usage:
//   node sync-assets.mjs --id <project-id> --clone <path>
//
// No-op if the project declares no assets.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const PROJECTS_FILE = '.github/upstream-projects.yaml';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--id') {
      args.id = argv[i + 1];
      i++;
    } else if (argv[i] === '--clone') {
      args.clone = argv[i + 1];
      i++;
    }
  }
  return args;
}

function main() {
  const { id, clone } = parseArgs(process.argv.slice(2));
  if (!id || !clone) {
    console.error(
      'Usage: sync-assets.mjs --id <project-id> --clone <upstream-clone-dir>'
    );
    process.exit(1);
  }
  if (!fs.existsSync(clone) || !fs.statSync(clone).isDirectory()) {
    console.error(`Clone directory not found: ${clone}`);
    process.exit(1);
  }

  const parsed = yaml.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const project = parsed.projects.find((p) => p.id === id);
  if (!project) {
    console.error(`Unknown project id: ${id}`);
    process.exit(1);
  }

  const assets = project.assets ?? [];
  if (assets.length === 0) {
    console.log(`No assets declared for ${id}; nothing to sync.`);
    return;
  }

  for (const asset of assets) {
    const { source, destination } = asset;
    if (!source || !destination) {
      console.error(
        `Asset entry missing source or destination: ${JSON.stringify(asset)}`
      );
      process.exit(1);
    }
    const srcPath = path.join(clone, source);
    if (!fs.existsSync(srcPath)) {
      console.error(
        `Source not found in clone: ${source} (resolved to ${srcPath})`
      );
      process.exit(1);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(srcPath, destination);
    console.log(`assets: synced ${source} -> ${destination}`);
  }
}

main();
