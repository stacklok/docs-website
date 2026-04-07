import React, { type ReactNode } from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type Props = WrapperProps<typeof LayoutType>;

function useStructuredData() {
  const { metadata, frontMatter } = useDoc();
  const { siteConfig } = useDocusaurusContext();

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: metadata.title,
    description: metadata.description,
    url: new URL(metadata.permalink, siteConfig.url).toString(),
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://stacklok.com/#organization',
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://stacklok.com/#website',
    },
  };

  if (metadata.lastUpdatedAt) {
    schema.dateModified = new Date(metadata.lastUpdatedAt).toISOString();
  }

  // Allow frontmatter to signal tutorial content
  if ((frontMatter as Record<string, unknown>).schema_type === 'tutorial') {
    schema.learningResourceType = 'tutorial';
  }

  return schema;
}

export default function LayoutWrapper(props: Props): ReactNode {
  const schema = useStructuredData();

  return (
    <>
      <Head>
        <script type='application/ld+json' id='techarticle-schema'>
          {JSON.stringify(schema)}
        </script>
      </Head>
      <Layout {...props} />
    </>
  );
}
