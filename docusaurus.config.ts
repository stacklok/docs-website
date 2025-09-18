import path from 'path';
//import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import PrismLight from './src/utils/prismLight';
import PrismDark from './src/utils/prismDark';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Stacklok Docs',
  tagline: 'Simple and secure AI tools',
  favicon: 'img/favicon.ico',
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
  onBrokenMarkdownLinks: 'warn',

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
        blog: false,
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
        ],
        theme: {
          primaryColor: '#2809a5',
          primaryColorDark: '#7ab7ff',
        },
      },
    ],
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
    navbar: {
      // title: 'Stacklok Docs',
      logo: {
        alt: 'Stacklok logo',
        src: 'img/stacklok-wordmark-black.svg',
        srcDark: 'img/stacklok-wordmark-white.svg',
        href: '/',
      },
      items: [
        {
          type: 'dropdown',
          label: 'ToolHive Docs',
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
              label: 'ToolHive registry schema',
              to: 'toolhive/reference/registry-schema',
            },
            {
              label: 'ToolHive Operator CRD',
              to: 'toolhive/reference/crd-spec',
            },
          ],
        },
        {
          href: 'https://github.com/stacklok',
          className: 'fa-brands fa-github fa-lg',
          position: 'right',
          'aria-label': 'GitHub',
        },
        {
          href: 'https://discord.gg/stacklok',
          className: 'fa-brands fa-discord fa-lg',
          position: 'right',
          'aria-label': 'Discord',
        },
        {
          href: 'https://youtube.com/@stacklok',
          className: 'fa-brands fa-youtube fa-lg',
          position: 'right',
          'aria-label': 'YouTube',
        },
      ],
    },
    footer: {
      links: [
        {
          items: [
            {
              html: `<a href="https://stacklok.com/"><img src="/img/stacklok-wordmark-gradient.svg" alt="Stacklok Logo" width="150px" /></a>`,
            },
          ],
        },
        {
          items: [
            {
              html: `<div style="display: flex;">
                       <a href="https://github.com/stacklok" target="_blank" class="footer__icon--custom navbar__link"><i class="fa-brands fa-github fa-xl"></i></a>
                       <a href="https://discord.gg/stacklok" target="_blank" class="footer__icon--custom navbar__link"><i class="fa-brands fa-discord fa-xl"></i></a>
                       <a href="https://youtube.com/@stacklok" target="_blank" class="footer__icon--custom navbar__link"><i class="fa-brands fa-youtube fa-xl"></i></a>
                       <a href="https://linkedin.com/company/stacklok" target="_blank" class="footer__icon--custom navbar__link"><i class="fa-brands fa-linkedin fa-xl"></i></a>
                       <a href="https://x.com/stacklokHQ" target="_blank" class="footer__icon--custom navbar__link"><i class="fa-brands fa-x-twitter fa-xl"></i></a>
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
          primaryColor: '#5750FF',
          primaryBorderColor: '#5750FF',
          primaryTextColor: '#FFFFFF',
          lineColor: '#5750FF',
          secondaryColor: '#F3E6EE',

          // Base styling
          mainBkg: '#5750FF',
          noteBkgColor: '#444444',
          noteTextColor: '#FFFFFF',

          // BEGIN flowchart styles
          nodeTextColor: '#FFFFFF',

          // BEGIN sequenceDiagram styles
          actorBorder: '#5750FF',
          actorLineColor: '#5750FF',
          actorTextColor: '#FFFFFF',
          activationBkgColor: '#5750FF',
          activationBorderColor: '#5750FF',
          labelBoxBkgColor: '#444444',
          labelTextColor: '#FFFFFF',
        },
      },
    },
    algolia: {
      appId: '5VBG92C77M',
      apiKey: 'd47061076173b8f8974c70dd94efb676',
      indexName: 'stacklok',
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
