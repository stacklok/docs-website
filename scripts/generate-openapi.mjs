// Generate API references from release-synchronized specifications.
// Source specifications remain release artifacts; normalize copies for rendering.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { openapiSets } from './lib/openapi-sets.mjs';

fs.mkdirSync('.openapi-inputs', { recursive: true });
for (const {
  id,
  name,
  source,
  localPort,
  urlVariable = 'baseUrl',
} of openapiSets) {
  const spec = YAML.parse(fs.readFileSync(source, 'utf8'));
  if (id === 'ai-gateway') spec.info.title = name;
  spec.servers = localPort
    ? [
        {
          url: `{${urlVariable}}`,
          description: `Your ${name} deployment URL`,
          variables: {
            [urlVariable]: {
              default: `https://${id}.example.com`,
              description: 'Include any ingress path prefix.',
            },
          },
        },
        {
          url: 'http://localhost:8080',
          description: `Local port-forward (8080:${localPort})`,
        },
      ]
    : [{ url: 'http://localhost:8080' }];
  fs.writeFileSync(`.openapi-inputs/${id}.yaml`, YAML.stringify(spec));
}
const cli = 'node_modules/@docusaurus/core/bin/docusaurus.mjs';
for (const command of ['clean-api-docs', 'gen-api-docs']) {
  execFileSync(process.execPath, [cli, command, 'all'], { stdio: 'inherit' });
}

// The upstream templates emit whitespace-only lines and trailing blank lines.
for (const { outputDir: directory } of openapiSets) {
  for (const name of fs.readdirSync(directory)) {
    if (!name.endsWith('.mdx')) continue;
    const file = `${directory}/${name}`;
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, `${content.replace(/[ \t]+$/gm, '').trimEnd()}\n`);
  }
}
