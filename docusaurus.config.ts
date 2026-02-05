import path from 'path';
//import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import PrismLight from './src/utils/prismLight';
import PrismDark from './src/utils/prismDark';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Stacklok Docs',
  tagline: 'Put MCP into production',
  favicon: 'img/stacklok-favicon.svg',
  plugins: [
    [
      'vercel-analytics',
      {
        debug: false,
      },
    ],
    [
      './plugins/mcp-metadata-plugin',
      {
        thvCommand: 'thv', // Can be customized if thv is in a different path
        failOnError:
          process.env.NODE_ENV === 'production' || process.env.CI === 'true',
      },
    ],
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        depth: 2,
        content: {
          includeBlog: false,
          includePages: true,
          includeDocs: true,
          includeGeneratedIndex: false,
          enableLlmsFullTxt: false,
          enableMarkdownFiles: true,
          excludeRoutes: [
            '/search',
            '/theme-preview',
            '/toolhive/reference/*api',
            '/toolhive/reference/registry-schema-*',
          ],
          routeRules: [
            {
              route: '/toolhive/*',
              depth: 1,
            },
          ],
        },
        includeOrder: [
          '/toolhive/tutorials/**',
          '/toolhive/concepts/**',
          '/toolhive/reference/client-compatibility',
          '/toolhive/guides-*',
          '/toolhive/reference/**',
        ],
        optionalLinks: [
          {
            title: 'Stacklok website',
            url: 'https://stacklok.com',
            description:
              'Official website of Stacklok, the creators of ToolHive.',
          },
          {
            title: 'Community Discord',
            url: 'https://discord.gg/stacklok',
          },
        ],
      },
    ],
  ],

  // Set the production url of your site here
  url: 'https://docs.stacklok.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'stacklok', // Usually your GitHub org/user name.
  projectName: 'docs-website', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    mdx1Compat: {
      comments: false,
      admonitions: false,
      headingIds: true,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid', 'docusaurus-json-schema-plugin'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/stacklok/docs-website/tree/main/',
        },
        blog: {
          blogTitle: 'ToolHive Updates and Announcements',
          blogDescription:
            'Stay up to date with the latest ToolHive news, project updates, and announcements.',
          path: 'blog/toolhive-updates',
          routeBasePath: 'toolhive/updates',
          blogSidebarCount: 10,
          showReadingTime: false,
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.css')],
        },
        googleTagManager: {
          containerId: 'GTM-KKJFZX3J',
        },
      } satisfies Preset.Options,
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'toolhive-api',
            spec: 'static/api-specs/toolhive-api.yaml',
            url: '/api-specs/toolhive-api.yaml',
            normalizeUrl: false,
            config: path.join(__dirname, 'src/redocly/redocly-toolhive.yaml'),
          },
          {
            id: 'toolhive-registry-api',
            spec: 'https://cdn.jsdelivr.net/gh/stacklok/toolhive-registry-server@latest/docs/thv-registry-api/swagger.yaml',
            config: path.join(__dirname, 'src/redocly/redocly-toolhive.yaml'),
          },
        ],
        theme: {
          primaryColor: '#2d684b',
          primaryColorDark: '#bddfc2',
          options: {
            sortTagsAlphabetically: true,
            sortOperationsAlphabetically: true,
          },
        },
      },
    ],
  ],

  scripts: [
    {
      id: 'hs-script-loader',
      type: 'text/javascript',
      src: '//js-na2.hs-scripts.com/42544743.js',
      async: true,
      defer: true,
    },
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
    announcementBar: {
      id: 'optimizer',
      content:
        'NEW: Improve performance and cut token costs with the ToolHive MCP Optimizer! <a href="/toolhive/tutorials/mcp-optimizer">Try it →</a>',
      backgroundColor: '#6e6080',
      textColor: '#f9faf9',
      isCloseable: true,
    },
    navbar: {
      logo: {
        alt: 'Stacklok logo',
        src: 'img/logos/stacklok-default-light-green.svg',
        href: '/',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Docs',
          position: 'left',
          items: [
            {
              label: 'Home',
              href: '/toolhive',
            },
            {
              label: 'Tutorials',
              to: 'toolhive/tutorials',
            },
            {
              label: 'ToolHive UI',
              to: 'toolhive/guides-ui',
            },
            {
              label: 'ToolHive CLI',
              to: 'toolhive/guides-cli',
            },
            {
              label: 'Kubernetes Operator',
              to: 'toolhive/guides-k8s',
            },
            {
              label: 'Virtual MCP Server',
              to: 'toolhive/guides-vmcp',
            },
            {
              label: 'ToolHive Registry',
              to: 'toolhive/guides-registry',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'References',
          position: 'left',
          items: [
            {
              label: 'ToolHive CLI commands',
              to: 'toolhive/reference/cli/thv',
            },
            {
              label: 'ToolHive API',
              to: 'toolhive/reference/api',
            },
            {
              label: 'ToolHive Operator CRD',
              to: 'toolhive/reference/crd-spec',
            },
            {
              label: 'ToolHive Registry schema',
              to: 'toolhive/reference/registry-schema-toolhive',
            },
            {
              label: 'Upstream Registry schema',
              to: 'toolhive/reference/registry-schema-upstream',
            },
            {
              label: 'ToolHive Registry API',
              to: 'toolhive/reference/registry-api',
            },
          ],
        },
        {
          to: '/toolhive/updates',
          label: 'Updates',
          position: 'left',
        },
        {
          href: 'https://stacklok.com/platform/',
          label: 'Enterprise',
          position: 'left',
        },
        {
          href: 'https://github.com/stacklok',
          className: 'fa-brands fa-github fa-lg',
          position: 'right',
          'aria-label': 'Stacklok on GitHub',
        },
        {
          href: 'https://discord.gg/stacklok',
          className: 'fa-brands fa-discord fa-lg',
          position: 'right',
          'aria-label': 'Join Stacklok on Discord',
        },
        {
          href: 'https://youtube.com/@stacklok',
          className: 'fa-brands fa-youtube fa-lg',
          position: 'right',
          'aria-label': 'Stacklok on YouTube',
        },
      ],
    },
    footer: {
      links: [
        {
          items: [
            {
              html: `<a href="https://stacklok.com/"><img src="/img/logos/stacklok-default-light-green.svg" alt="Stacklok Logo" width="150px" /></a>`,
            },
          ],
        },
        {
          items: [
            {
              html: `<div style="display: flex;">
                       <a href="https://github.com/stacklok" target="_blank" class="footer__icon--custom" aria-label="Stacklok on GitHub"><i class="fa-brands fa-github fa-xl"></i></a>
                       <a href="https://discord.gg/stacklok" target="_blank" class="footer__icon--custom" aria-label="Join Stacklok on Discord"><i class="fa-brands fa-discord fa-xl"></i></a>
                       <a href="https://youtube.com/@stacklok" target="_blank" class="footer__icon--custom" aria-label="Stacklok on YouTube"><i class="fa-brands fa-youtube fa-xl"></i></a>
                       <a href="https://linkedin.com/company/stacklok" target="_blank" class="footer__icon--custom" aria-label="Stacklok on LinkedIn"><i class="fa-brands fa-linkedin fa-xl"></i></a>
                       <a href="https://x.com/stacklokHQ" target="_blank" class="footer__icon--custom" aria-label="Stacklok on X (Twitter)"><i class="fa-brands fa-x-twitter fa-xl"></i></a>
                     </div>`,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Stacklok, Inc.`,
    },
    prism: {
      theme: PrismLight,
      darkTheme: PrismDark,
      additionalLanguages: ['bash', 'json', 'powershell', 'docker', 'promql'],
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
      options: {
        themeVariables: {
          fontFamily: 'Figtree, system-ui, sans-serif',
          primaryColor: '#2d684b',
          primaryBorderColor: '#2d684b',
          primaryTextColor: '#f9faf9',
          lineColor: '#2d684b',
          secondaryColor: '#f3e6ee',

          // Base styling
          mainBkg: '#2d684b',
          noteBkgColor: '#444444',
          noteTextColor: '#f9faf9',

          // BEGIN flowchart styles
          nodeTextColor: '#f9faf9',

          // BEGIN sequenceDiagram styles
          actorBorder: '#2d684b',
          actorLineColor: '#2d684b',
          actorTextColor: '#f9faf9',
          activationBkgColor: '#2d684b',
          activationBorderColor: '#2d684b',
          labelBoxBkgColor: '#444444',
          labelTextColor: '#f9faf9',
        },
      },
    },
    algolia: {
      appId: '5VBG92C77M',
      apiKey: 'd47061076173b8f8974c70dd94efb676',
      indexName: 'stacklok',
      askAi: {
        indexName: 'stacklok-markdown',
        apiKey: 'd47061076173b8f8974c70dd94efb676',
        appId: '5VBG92C77M',
        assistantId: '7acHoXQLOA6U',
      },
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
