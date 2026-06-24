#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Drive CRD schema extraction and MDX reference page generation for a
 * given upstream project. Reads the project's CRD sets from
 * .github/upstream-projects.yaml (via scripts/lib/crd-sets.mjs) and, for
 * each set, runs:
 *
 *   node scripts/extract-crd-schemas.mjs --src <src> --out <out>
 *   node scripts/generate-crd-pages.mjs  --data <out> --pages <pages>
 *
 * Then regenerates the consolidated <CRDFields> schema barrel across all
 * sets via scripts/generate-crd-barrel.mjs.
 *
 * CRD sources:
 *   release_asset: <filename>  - download from the GitHub release, extract
 *                                tarball to a temp dir (requires --tag)
 *   source: <repo-relative>    - directory inside the upstream clone
 *                                (requires --clone)
 *
 * Usage:
 *   node scripts/upstream-release/extract-crds.mjs \
 *         --id <project-id> [--clone <path>] [--repo <owner/repo>] [--tag <tag>]
 *
 * No-op (exits 0) if the project declares no CRD sets.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getCrdSets, repoRoot } from '../lib/crd-sets.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--id') {
      args.id = argv[++i];
    } else if (argv[i] === '--clone') {
      args.clone = argv[++i];
    } else if (argv[i] === '--repo') {
      args.repo = argv[++i];
    } else if (argv[i] === '--tag') {
      args.tag = argv[++i];
    }
  }
  return args;
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit', cwd: repoRoot });
}

function downloadAndExtract(releaseAsset, repo, tag) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-crds-'));
  run('gh', [
    'release',
    'download',
    tag,
    '--repo',
    repo,
    '--pattern',
    releaseAsset,
    '--dir',
    tmp,
  ]);
  const downloaded = path.join(tmp, releaseAsset);
  const extracted = path.join(tmp, 'crds');
  fs.mkdirSync(extracted);
  run('tar', ['-xzf', downloaded, '-C', extracted]);
  return {
    srcDir: extracted,
    cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }),
  };
}

function main() {
  const { id, clone, repo: repoArg, tag } = parseArgs(process.argv.slice(2));
  if (!id) {
    console.error(
      'Usage: extract-crds.mjs --id <project-id> [--clone <dir>] [--repo <owner/repo>] [--tag <tag>]'
    );
    process.exit(1);
  }

  const sets = getCrdSets().filter((s) => s.projectId === id);
  if (sets.length === 0) {
    console.log(`No CRD sets declared for ${id}; nothing to extract.`);
    return;
  }

  for (const set of sets) {
    const { out, pages } = set;
    const repo = repoArg || set.repo;
    const resolvedTag = tag || set.version;

    let srcDir;
    let cleanup = () => {};

    if (set.releaseAsset) {
      if (!resolvedTag) {
        console.error('crds release_asset entry requires --tag');
        process.exit(1);
      }
      ({ srcDir, cleanup } = downloadAndExtract(
        set.releaseAsset,
        repo,
        resolvedTag
      ));
    } else if (set.source) {
      if (!clone) {
        console.error('crds source entry requires --clone');
        process.exit(1);
      }
      srcDir = path.join(clone, set.source);
      if (!fs.existsSync(srcDir)) {
        console.error(`CRD source not found in clone: ${srcDir}`);
        process.exit(1);
      }
    } else {
      console.error(
        `CRD set "${set.key}" has neither release_asset nor source.`
      );
      process.exit(1);
    }

    try {
      run('node', [
        'scripts/extract-crd-schemas.mjs',
        '--src',
        srcDir,
        '--out',
        out,
      ]);

      const generateArgs = [
        'scripts/generate-crd-pages.mjs',
        '--data',
        out,
        '--pages',
        pages,
      ];
      if (set.landingTitle)
        generateArgs.push('--landing-title', set.landingTitle);
      if (set.landingDescription)
        generateArgs.push('--landing-description', set.landingDescription);
      if (set.landingIntro)
        generateArgs.push('--landing-intro', set.landingIntro);
      run('node', generateArgs);
    } finally {
      cleanup();
    }

    console.log(
      `crds: processed ${set.releaseAsset ?? set.source} -> ${out}, ${pages}`
    );
  }

  // Regenerate the consolidated <CRDFields> schema barrel across all sets.
  // Reads every set's freshly-written index.json, so it reflects this run's
  // changes plus the other sets as committed.
  run('node', ['scripts/generate-crd-barrel.mjs']);
}

main();
