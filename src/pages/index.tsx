// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

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
              src='/img/toolhive-icon-honey.svg'
              alt='ToolHive mascot'
              style={{
                width: '150px',
                height: 'auto',
                float: 'right',
                marginLeft: '1.5rem',
                display: 'block',
                maxWidth: '40%',
                borderRadius: '25px',
              }}
            />
            ToolHive simplifies the deployment and management of Model Context
            Protocol (MCP) servers, ensuring ease of use, consistency, and
            security. It&apos;s available as a standalone tool or as a
            Kubernetes operator, making it versatile for various environments.
          </ProductCard>
        </ProductGrid>

        <h1 className='text--center'>Our MCP Servers</h1>

        <ProductGrid layout='fixed-3' spacing='spacious'>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/gofetch'
            title='GoFetch MCP server'
            linkText='Go to project'
          >
            <img
              src='/img/mcp-servers/gofetch-mascot.webp'
              alt='GoFetch mascot'
              style={{
                width: '80px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            A Go implementation of the Fetch MCP server that retrieves web
            content and converts it to markdown for easier consumption by LLMs.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/mkp'
            title='MKP - Model Kontext Protocol'
            linkText='Go to project'
          >
            <img
              src='/img/mcp-servers/mkp-logo.webp'
              alt='MKP logo'
              style={{
                width: '60px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            MKP is an MCP server that allows LLM-powered applications to
            interact with Kubernetes clusters.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/osv-mcp'
            title='OSV MCP server'
            linkText='Go to project'
          >
            The OSV MCP server provides access to the OSV (Open Source
            Vulnerabilities) database.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/ocireg-mcp'
            title='OCI Registry MCP server'
            linkText='Go to project'
          >
            The OCI Registry MCP server provides tools for querying OCI
            registries and image references.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='http://github.com/StacklokLabs/sqlite-mcp'
            title='SQLite MCP server'
            linkText='Go to project'
          >
            The SQLite MCP server provides tools and resources that allow you to
            interact with SQLite databases.
          </ProductCard>
        </ProductGrid>
      </main>
    </Layout>
  );
}
