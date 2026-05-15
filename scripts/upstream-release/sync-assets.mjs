#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Copies declared upstream assets into the docs repo for the given
 * project. Assets are declared per-project in
 * .github/upstream-projects.yaml under `assets:`. Three source kinds:
 *
 *   - source: <repo-relative path>            # file in the shallow clone
 *     destination: <repo-relative path>
 *
 *   - release_asset: <asset filename>         # GitHub release asset
 *     destination: <repo-relative path>
 *
 *   - release_asset: <asset filename>
 *     destination: <repo-relative directory>
 *     extract: tar-gz                         # extract tarball into dir
 *
 * Usage:
 *   node sync-assets.mjs --id <project-id> --clone <path> [--repo <owner/repo>]
 *
 * `--clone` is required for `source:` entries (copies from the clone).
 * `--repo` defaults to the project's repo from the YAML and is used
 * for `release_asset:` downloads.
 *
 * No-op if the project declares no assets.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
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
    } else if (argv[i] === '--repo') {
      args.repo = argv[i + 1];
      i++;
    } else if (argv[i] === '--tag') {
      args.tag = argv[i + 1];
      i++;
    }
  }
  return args;
}

function syncFromClone(asset, cloneDir) {
  const { source, destination } = asset;
  const srcPath = path.join(cloneDir, source);
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

function syncFromReleaseAsset(asset, repo, tag) {
  const { release_asset: assetName, destination, extract } = asset;
  if (!tag) {
    console.error(
      `release_asset entries require --tag; got: ${JSON.stringify(asset)}`
    );
    process.exit(1);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-assets-'));
  try {
    // gh release download writes the asset verbatim into --dir.
    execFileSync(
      'gh',
      [
        'release',
        'download',
        tag,
        '--repo',
        repo,
        '--pattern',
        assetName,
        '--dir',
        tmp,
      ],
      { stdio: 'inherit' }
    );
    const downloadedPath = path.join(tmp, assetName);
    if (!fs.existsSync(downloadedPath)) {
      console.error(
        `Download did not produce expected file: ${downloadedPath}`
      );
      process.exit(1);
    }
    if (extract === 'tar-gz') {
      fs.mkdirSync(destination, { recursive: true });
      // Strip pre-existing contents so removed upstream files are reflected.
      for (const entry of fs.readdirSync(destination)) {
        if (entry.startsWith('thv_') || entry.endsWith('.md')) {
          fs.rmSync(path.join(destination, entry), {
            recursive: true,
            force: true,
          });
        }
      }
      execFileSync('tar', ['-xzf', downloadedPath, '-C', destination], {
        stdio: 'inherit',
      });
      console.log(
        `assets: extracted release_asset ${assetName} -> ${destination}/`
      );
    } else if (extract) {
      console.error(`Unsupported extract directive: ${extract}`);
      process.exit(1);
    } else {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(downloadedPath, destination);
      console.log(
        `assets: downloaded release_asset ${assetName} -> ${destination}`
      );
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function main() {
  const { id, clone, repo: repoArg, tag } = parseArgs(process.argv.slice(2));
  if (!id) {
    console.error(
      'Usage: sync-assets.mjs --id <project-id> --clone <dir> [--tag <tag>] [--repo <owner/repo>]'
    );
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

  const repo = repoArg || project.repo;
  const resolvedTag = tag || project.version;

  for (const asset of assets) {
    if (!asset.destination) {
      console.error(
        `Asset entry missing destination: ${JSON.stringify(asset)}`
      );
      process.exit(1);
    }
    if (asset.source) {
      if (!clone) {
        console.error(
          `Asset with source: needs --clone. Entry: ${JSON.stringify(asset)}`
        );
        process.exit(1);
      }
      syncFromClone(asset, clone);
    } else if (asset.release_asset) {
      syncFromReleaseAsset(asset, repo, resolvedTag);
    } else {
      console.error(
        `Asset entry has neither source nor release_asset: ${JSON.stringify(asset)}`
      );
      process.exit(1);
    }
  }
}

main();
