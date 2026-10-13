// Generate only the two APIs included in the rendering spike.
// Source specifications remain release artifacts; normalize copies for rendering.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

fs.mkdirSync('.openapi-inputs', { recursive: true });
for (const [source, destination] of [
  ['static/api-specs/toolhive-api.yaml', '.openapi-inputs/toolhive.yaml'],
  [
    'static/api-specs/enterprise-manager-api.json',
    '.openapi-inputs/enterprise-manager.yaml',
  ],
]) {
  const spec = YAML.parse(fs.readFileSync(source, 'utf8'));
  spec.servers = [{ url: 'http://localhost:8080' }];
  fs.writeFileSync(destination, YAML.stringify(spec));
}
const cli = 'node_modules/@docusaurus/core/bin/docusaurus.mjs';
for (const command of ['clean-api-docs', 'gen-api-docs']) {
  execFileSync(process.execPath, [cli, command, 'all'], { stdio: 'inherit' });
}

// The upstream templates emit whitespace-only lines and trailing blank lines.
for (const directory of [
  'docs/toolhive/reference/api-endpoints',
  'docs/platform/reference/enterprise-manager-api',
]) {
  for (const name of fs.readdirSync(directory)) {
    if (!name.endsWith('.mdx')) continue;
    const file = `${directory}/${name}`;
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, `${content.replace(/[ \t]+$/gm, '').trimEnd()}\n`);
  }
}
