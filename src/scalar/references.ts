import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { ScalarOptions } from '@scalar/docusaurus';

const references = [
  {
    id: 'toolhive',
    title: 'ToolHive API',
    page: '/toolhive/reference/api',
    spec: 'toolhive-api.yaml',
  },
  {
    id: 'registry',
    title: 'Registry Server API',
    page: '/toolhive/reference/registry-api',
    spec: 'toolhive-registry-api.yaml',
  },
  {
    id: 'enterprise-manager',
    title: 'Enterprise Manager API',
    page: '/platform/enterprise-platform/enterprise-manager-api',
    spec: 'enterprise-manager-api.json',
  },
  {
    id: 'connector-gateway',
    title: 'Connector Gateway API',
    page: '/connector-gateway/api-reference',
    spec: 'connector-gateway-api.json',
  },
  {
    id: 'ai-gateway',
    title: 'AI Gateway management API (legacy gateway)',
    page: '/ai-gateway/legacy/api-reference',
    spec: 'ai-gateway-management-api.yaml',
  },
];

export default references.map(({ id, title, page, spec }) => {
  const options: ScalarOptions & { id: string } = {
    id,
    label: title,
    route: `${page}/explorer`,
    showNavLink: false,
    // The plugin otherwise loads the latest renderer on every page visit.
    cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.76.2/dist/browser/standalone.js',
    configuration: {
      // Normalize a copy at build time; release artifacts remain untouched.
      content: () => {
        const document = YAML.parse(
          fs.readFileSync(
            path.resolve(__dirname, '../../static/api-specs', spec),
            'utf8'
          )
        );
        document.info.title = title;
        document.info.description = `${document.info.description ?? ''}\n\n[Connection and authentication guidance](${page}).`;
        return document;
      },
      servers: [
        { url: 'http://localhost:8080', description: 'Local port-forward' },
        {
          url: '{baseUrl}',
          description: 'Your deployment',
          variables: {
            baseUrl: { default: `https://${id}.example.com` },
          },
        },
      ],
      // Direct browser requests require the API's CORS policy to allow this site.
      proxyUrl: '',
      telemetry: false,
      persistAuth: false,
      defaultOpenAllTags: false,
      showDeveloperTools: 'never',
      withDefaultFonts: false,
      customCss:
        '.scalar-api-reference { --scalar-color-accent: var(--ifm-color-primary); }',
    },
  };
  return ['@scalar/docusaurus', options] as [string, typeof options];
});
