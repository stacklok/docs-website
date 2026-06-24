// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Single source of truth for the set of CRD sets the docs site publishes.
 *
 * Every CRD set is declared once, under a project's `crds:` array in
 * .github/upstream-projects.yaml. This module flattens those declarations so
 * the generation pipeline AND the build-time consumers all read the same
 * list instead of hand-maintaining parallel copies:
 *
 *   - scripts/upstream-release/extract-crds.mjs - drives extract + generate
 *   - scripts/generate-crd-barrel.mjs           - emits the <CRDFields> barrel
 *   - docusaurus.config.ts                       - feeds schemaDirs to the
 *                                                  crd-reference-remark plugin
 *   - sidebars.ts                                - loads each set's sidebar
 *                                                  fragment for placement
 *
 * Adding a new CRD set is therefore a single YAML edit plus a regenerate;
 * none of the consumers above need editing (sidebar placement is the only
 * manual step, since where a set nests in the nav is editorial).
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import yaml from 'yaml';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '..', '..');
const PROJECTS_FILE = path.join(repoRoot, '.github', 'upstream-projects.yaml');

// Flatten every project's `crds:` entries into a normalized descriptor list.
// `key` is the basename of the output dir (e.g. "toolhive-crds"); it's the
// stable handle sidebars.ts uses to place a specific set's fragment.
export function getCrdSets() {
  const parsed = yaml.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  const sets = [];
  for (const project of parsed.projects ?? []) {
    for (const entry of project.crds ?? []) {
      sets.push({
        projectId: project.id,
        repo: project.repo,
        version: project.version,
        key: path.basename(entry.out),
        out: entry.out,
        pages: entry.pages,
        source: entry.source,
        releaseAsset: entry.release_asset,
        landingTitle: entry.landing_title,
        landingDescription: entry.landing_description,
        landingIntro: entry.landing_intro,
      });
    }
  }
  return sets;
}

// Read a set's generated sidebar.json fragment by its key. Throws loudly if
// the fragment is missing so a forgotten regenerate fails the build instead
// of silently dropping the CRD reference from the nav.
export function loadCrdSidebar(key) {
  const set = getCrdSets().find((s) => s.key === key);
  if (!set) {
    throw new Error(
      `No CRD set with key "${key}" in ${PROJECTS_FILE}. ` +
        `Known keys: ${
          getCrdSets()
            .map((s) => s.key)
            .join(', ') || '(none)'
        }.`
    );
  }
  const fragmentPath = path.resolve(repoRoot, set.out, 'sidebar.json');
  if (!fs.existsSync(fragmentPath)) {
    throw new Error(
      `CRD sidebar fragment not found at ${fragmentPath}. ` +
        `Run: node scripts/upstream-release/extract-crds.mjs --id ${set.projectId} ...`
    );
  }
  return JSON.parse(fs.readFileSync(fragmentPath, 'utf8'));
}
