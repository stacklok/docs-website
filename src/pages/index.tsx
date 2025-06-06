import React from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ProductGrid from '@site/src/components/ProductGrid';
import ProductCard from '@site/src/components/ProductCard';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          {siteConfig.title}
        </Heading>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description='Stacklok project documentation and resources'
    >
      <HomepageHeader />
      <main className='container'>
        <ProductGrid>
          <ProductCard
            contentType='logo'
            href='/toolhive'
            logo='/img/toolhive-wordmark-black.svg'
            logoDark='/img/toolhive-wordmark-white.svg'
            logoAlt='ToolHive logo'
            logoTitle='ToolHive logo'
            linkText='Read documentation'
          >
            <img
              src='/img/toolhive-mascot.png'
              alt='ToolHive mascot'
              style={{
                width: '120px',
                height: 'auto',
                float: 'right',
                marginRight: '1.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            ToolHive simplifies the deployment and management of Model Context
            Protocol (MCP) servers, ensuring ease of use, consistency, and
            security. It&apos;s available as a standalone tool or as a
            Kubernetes operator, making it versatile for various environments.
          </ProductCard>
        </ProductGrid>

        <h1 className='text--center'>Our MCP Servers</h1>

        <ProductGrid>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/mkp'
            title='MKP (Model Kontext Protocol)'
            linkText='Go to project'
          >
            MKP (Model Kontext Protocol) is an MCP server that allows
            LLM-powered applications to interact with Kubernetes clusters.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/osv-mcp'
            title='OSV MCP'
            linkText='Go to project'
          >
            The OSV MCP server provides access to the OSV (Open Source
            Vulnerabilities) database.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/ocireg-mcp'
            title='OCI Registry MCP'
            linkText='Go to project'
          >
            The OCI Registry MCP server provides tools for querying OCI
            registries and image references.
          </ProductCard>
        </ProductGrid>
      </main>
    </Layout>
  );
}
