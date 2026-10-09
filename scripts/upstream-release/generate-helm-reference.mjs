#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

// Run against the release checkout, never the moving upstream default branch:
// node scripts/upstream-release/generate-helm-reference.mjs --id toolhive --clone <dir> --tag <tag>
// Requires helm-docs 1.14.2 on PATH. Other projects without `helm` entries are a no-op.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

// Preserve inline code while escaping MDX expressions and JSX in upstream prose.
export function mdxText(value) {
  return String(value).replace(
    /(`+)[\s\S]*?\1|\bToolhive\b|[<>{}]/g,
    (match) =>
      match.startsWith('`')
        ? match
        : match === 'Toolhive'
          ? 'ToolHive'
          : `&#${match.charCodeAt(0)};`
  );
}

// Read multiline annotations directly: helm-docs joins continuation lines.
// Keys are arrays internally so literal dots in a YAML key remain unambiguous.
export function sourceDescriptions(source) {
  const descriptions = new Map();
  function visit(node, keys = []) {
    if (!yaml.isMap(node)) return;
    for (const pair of node.items) {
      const childKeys = [...keys, String(pair.key.value)];
      // yaml attaches a first child's leading comments to its containing map.
      const comment =
        pair.key.commentBefore ??
        (pair === node.items[0] ? node.commentBefore : '');
      const lines = (comment || '').split('\n');
      const start = lines.findLastIndex((line) => /^\s*--\s/.test(line));
      if (start >= 0) {
        const content = lines.slice(start);
        content[0] = content[0].replace(/^\s*--\s/, '');
        const metadata = content.findIndex((line) => /^\s*@/.test(line));
        descriptions.set(
          childKeys.join('.'),
          (metadata < 0 ? content : content.slice(0, metadata))
            .map((line, i) => (i === 0 ? line : line.replace(/^ /, '')))
            .join('\n')
            .trimEnd()
        );
      }
      visit(pair.value, childKeys);
    }
  }
  visit(yaml.parseDocument(source).contents);
  return descriptions;
}

// Turn indented source examples into fenced YAML while retaining paragraphs
// and Markdown lists. Escaping applies to prose, never to example contents.
export function renderDescription(description) {
  const lines = description.split('\n');
  const output = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^ {2,}[\w.-]+:/.test(lines[i])) {
      const block = [];
      while (i < lines.length && (/^ {2,}/.test(lines[i]) || !lines[i].trim()))
        block.push(lines[i++]);
      i--;
      const nonempty = block.filter((line) => line.trim());
      const indent = Math.min(
        ...nonempty.map((line) => line.match(/^ */)[0].length)
      );
      const content = block
        .map((line) => line.slice(indent))
        .join('\n')
        .trimEnd();
      const fence = '`'.repeat(
        Math.max(3, ...[...content.matchAll(/`+/g)].map((m) => m[0].length + 1))
      );
      output.push('', `${fence}yaml`, content, fence, '');
    } else {
      output.push(mdxText(lines[i]));
    }
  }
  return output.join('\n').trim();
}

// Curated descriptions for passthrough blocks can live beside page intros.
// Add annotations to the temporary documentation copy, preserving all values.
export function annotateValues(source, overrides = {}) {
  const document = yaml.parseDocument(source);
  const edits = [];
  for (const [key, description] of Object.entries(overrides)) {
    const keys = key.split('.');
    let node = document.contents;
    let pair;
    for (const part of keys) {
      pair =
        yaml.isMap(node) &&
        node.items.find((p) => String(p.key.value) === part);
      if (!pair)
        throw new Error(`Description override names an absent value: ${key}`);
      node = pair.value;
    }
    const start = source.lastIndexOf('\n', pair.key.range[0] - 1) + 1;
    const indent = source.slice(start, pair.key.range[0]);
    edits.push({
      start,
      text:
        description
          .split('\n')
          .map((line, i) => `${indent}# ${i === 0 ? '-- ' : ''}${line}`)
          .join('\n') + '\n',
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.start);
  return source;
}

function renderDefault(value) {
  if (value.length < 100) return `**Default:** ${mdxText(value)}`;
  // helm-docs wraps literal JSON defaults in inline-code delimiters.
  let content;
  try {
    content = yaml.stringify(JSON.parse(value.replace(/^`|`$/g, ''))).trimEnd();
  } catch {
    return `**Default:** ${mdxText(value)}`;
  }
  const fence = '`'.repeat(
    Math.max(3, ...[...content.matchAll(/`+/g)].map((m) => m[0].length + 1))
  );
  return `<details>\n<summary>Default value</summary>\n\n${fence}yaml\n${content}\n${fence}\n\n</details>`;
}

export function renderPage(chart, metadata, rows, repo, tag) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`No Helm values found for ${chart.source}`);
  }
  const fields = rows.map((row) => {
    const description =
      row.Description || row.SourceDescription || row.AutoDescription;
    if (!description?.trim()) {
      throw new Error(`Missing description for ${chart.source}: ${row.Key}`);
    }
    return `### \`${row.Key}\`\n\n**Type:** \`${row.Type}\`\n\n${renderDefault(row.Default || row.AutoDefault)}\n\n${renderDescription(description)}`;
  });
  const source = `https://github.com/${repo}/blob/${encodeURIComponent(tag)}/${chart.source}/values.yaml`;
  return `---
${yaml.stringify({ title: chart.title, description: chart.description }).trimEnd()}
---

{/* Generated by scripts/upstream-release/generate-helm-reference.mjs. Edit upstream values or the helm entries in .github/upstream-projects.yaml. */}

${chart.intro}

This reference lists values declared in the chart's default \`values.yaml\`.
Templates can also accept optional settings and inherited \`global\` values.

Chart: \`${metadata.name}\`. Chart version: \`${metadata.version}\`.
Source: [\`values.yaml\`](${source}) at \`${tag}\`.

## Values

${fields.join('\n\n')}

## Related information

${chart.related.map(({ label, href }) => `- [${label}](${href})`).join('\n')}
`;
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--id', '--clone', '--tag'].includes(argv[i]) || !argv[i + 1]) {
      throw new Error(
        'Usage: generate-helm-reference.mjs --id <project> --clone <dir> --tag <tag>'
      );
    }
    args[argv[i].slice(2)] = argv[i + 1];
  }
  const { projects } = yaml.parse(
    fs.readFileSync(
      path.join(repoRoot, '.github/upstream-projects.yaml'),
      'utf8'
    )
  );
  const project = projects.find((p) => p.id === args.id);
  if (!project) throw new Error(`Unknown project: ${args.id}`);
  if (!project.helm?.length) return;
  const tag = args.tag || project.version;
  if (!args.clone || !tag)
    throw new Error('Helm generation requires --clone and a release tag');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'helm-reference-'));
  try {
    // Copy only documentation inputs: helm-docs must never overwrite upstream READMEs.
    // Prepare every page before replacing outputs, so incomplete annotations fail early.
    const pages = project.helm.map((chart, index) => {
      const dir = path.join(tmp, String(index));
      fs.mkdirSync(dir);
      for (const file of ['Chart.yaml', 'values.yaml']) {
        fs.copyFileSync(
          path.join(args.clone, chart.source, file),
          path.join(dir, file)
        );
      }
      const valuesPath = path.join(dir, 'values.yaml');
      const values = annotateValues(
        fs.readFileSync(valuesPath, 'utf8'),
        chart.description_overrides
      );
      fs.writeFileSync(valuesPath, values);
      const descriptions = sourceDescriptions(values);
      fs.copyFileSync(
        new URL('./helm-values.gotmpl', import.meta.url),
        path.join(dir, 'values.gotmpl')
      );
      const output = execFileSync(
        'helm-docs',
        [
          '--chart-search-root',
          dir,
          '--template-files',
          'values.gotmpl',
          '--sort-values-order',
          'file',
          '--dry-run',
          '--log-level',
          'error',
        ],
        { encoding: 'utf8' }
      );
      const metadata = yaml.parse(
        fs.readFileSync(path.join(dir, 'Chart.yaml'), 'utf8')
      );
      return {
        page: chart.page,
        content: renderPage(
          chart,
          metadata,
          JSON.parse(output).map((row) => ({
            ...row,
            SourceDescription: descriptions.get(row.Key),
          })),
          project.repo,
          tag
        ),
      };
    });
    for (const { page, content } of pages) {
      const destination = path.join(repoRoot, page);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, content);
    }
    execFileSync(
      'npx',
      ['--no-install', 'prettier', '--write', ...pages.map((p) => p.page)],
      { cwd: repoRoot, stdio: 'inherit' }
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2));
}
