#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Detects which project's version: changed between the PR branch and
 * origin/main in .github/upstream-projects.yaml. Emits GITHUB_OUTPUT:
 *
 *   id=<project-id>
 *   repo=<owner/repo>
 *   prev_tag=<version on main>
 *   new_tag=<version on PR branch>
 *
 * Fails if:
 *   - zero projects changed
 *   - more than one project changed (Renovate is configured not to batch,
 *     but we fail loudly if that ever slips)
 *   - the `repo:` field for the changed project was also modified (a PR
 *     that edits both `repo:` and `version:` could point the workflow at
 *     a hostile clone URL; only Renovate version bumps should reach this)
 *
 * Set BASE_REF to override origin/main for local testing.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import yaml from 'yaml';

const PROJECTS_FILE = '.github/upstream-projects.yaml';
const REPO_SHAPE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

function emit(key, value) {
  const out = process.env.GITHUB_OUTPUT;
  const line = `${key}=${value}\n`;
  if (out) {
    fs.appendFileSync(out, line);
  } else {
    process.stdout.write(line);
  }
}

function loadFromRef(ref) {
  const text = execFileSync('git', ['show', `${ref}:${PROJECTS_FILE}`], {
    encoding: 'utf8',
  });
  return yaml.parse(text).projects;
}

function main() {
  const ref = process.env.BASE_REF || 'origin/main';
  const mainProjects = loadFromRef(ref);
  const headProjects = yaml.parse(
    fs.readFileSync(PROJECTS_FILE, 'utf8')
  ).projects;

  const changed = [];
  for (const pr of headProjects) {
    const base = mainProjects.find((m) => m.id === pr.id);
    if (!base) continue; // new project added in this PR; not a version bump
    if (base.version !== pr.version) {
      if (base.repo !== pr.repo) {
        console.error(
          `Project ${pr.id} changed repo: ${base.repo} -> ${pr.repo}. ` +
            `This workflow only handles version bumps; repo changes must be ` +
            `reviewed and merged by a human before version updates proceed.`
        );
        process.exit(1);
      }
      if (!REPO_SHAPE.test(pr.repo)) {
        console.error(`Project ${pr.id} has malformed repo value: ${pr.repo}`);
        process.exit(1);
      }
      changed.push({
        id: pr.id,
        repo: pr.repo,
        prev_tag: base.version,
        new_tag: pr.version,
      });
    }
  }

  if (changed.length === 0) {
    console.error(
      'No version changes detected in .github/upstream-projects.yaml'
    );
    process.exit(1);
  }
  if (changed.length > 1) {
    console.error(
      `Multiple projects changed in one PR: ${changed
        .map((c) => c.id)
        .join(', ')}. Split the PR or dispatch the workflow per project.`
    );
    process.exit(1);
  }

  const c = changed[0];
  emit('id', c.id);
  emit('repo', c.repo);
  emit('prev_tag', c.prev_tag);
  emit('new_tag', c.new_tag);
  console.log(`Detected: ${c.id} ${c.prev_tag} -> ${c.new_tag}`);
}

main();
