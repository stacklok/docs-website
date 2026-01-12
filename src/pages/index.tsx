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
import ThemedImage from '@theme/ThemedImage';

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
            logo='/img/logos/toolhive-default-black.svg'
            logoDark='/img/logos/toolhive-default-white.svg'
            logoAlt='ToolHive logo'
            logoTitle='ToolHive logo'
            linkText='Read documentation'
          >
            <ThemedImage
              sources={{
                light: '/img/logos/toolhive-symbol-black.svg',
                dark: '/img/logos/toolhive-symbol-white.svg',
              }}
              alt='ToolHive symbol'
              style={{
                width: '120px',
                height: 'auto',
                float: 'right',
                marginLeft: '1.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            {/* TODO: update description */}
            ToolHive simplifies the deployment and management of Model Context
            Protocol (MCP) servers, ensuring ease of use, consistency, and
            security. It&apos;s available as a standalone tool or as a
            Kubernetes operator, making it versatile for various environments.
          </ProductCard>
        </ProductGrid>

        <h1 className='text--center'>Open source MCP servers</h1>

        <ProductGrid layout='fixed-3' spacing='spacious'>
          <ProductCard
            contentType='text'
            href='/toolhive/support#toolhive-documentation-mcp-server'
            title='Stacklok Documentation Search'
            linkText='Read the docs'
          >
            <ThemedImage
              sources={{
                light: '/img/logos/stacklok-symbol-dark-green.svg',
                dark: '/img/logos/stacklok-symbol-light-green.svg',
              }}
              alt='Stacklok symbol'
              style={{
                width: '60px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            Access the ToolHive user and contributor documentation directly from
            your LLM-powered applications. Available as a local or remote MCP
            server.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/gofetch'
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
            content and converts it to Markdown for easier consumption by LLMs.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='/toolhive/guides-mcp/k8s'
            title='MKP - Model Kontext Protocol'
            linkText='Read the guide'
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
            href='https://github.com/StacklokLabs/osv-mcp'
            title='OSV MCP server'
            linkText='Go to project'
          >
            The OSV MCP server provides access to the OSV (Open Source
            Vulnerabilities) database.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/ocireg-mcp'
            title='OCI Registry MCP server'
            linkText='Go to project'
          >
            The OCI Registry MCP server provides tools for querying OCI
            registries and image references.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/plotting-mcp'
            title='Plotting MCP server'
            linkText='Go to project'
          >
            The Plotting MCP server transforms CSV data into beautiful
            visualizations.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/sqlite-mcp'
            title='SQLite MCP server'
            linkText='Go to project'
          >
            The SQLite MCP server provides tools and resources that allow you to
            interact with SQLite databases.
          </ProductCard>
        </ProductGrid>

        <h1 className='text--center'>Other MCP Projects</h1>

        <ProductGrid layout='fixed-2' spacing='spacious'>
          <ProductCard
            contentType='text'
            href='/toolhive/tutorials/mcp-optimizer'
            title='MCP Optimizer'
            linkText='Read the docs'
          >
            <ThemedImage
              sources={{
                light:
                  '/img/mcp-servers/stacklok-website-icons-efficiency-dark-green.svg',
                dark: '/img/mcp-servers/stacklok-website-icons-efficiency-light-green.svg',
              }}
              alt='Stacklok efficiency icon'
              style={{
                width: '80px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            MCP Optimizer discovers the tools from your MCP servers in ToolHive
            and optimizes token usage by intelligently filtering based on the
            task at hand.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/yardstick'
            title='Yardstick'
            linkText='Go to project'
          >
            <img
              src='/img/mcp-servers/yardstick-logo.webp'
              alt='Yardstick logo'
              style={{
                width: '60px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                marginBottom: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            Yardstick is an MCP server and client reference implementation for
            deterministic testing.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/toolhive-actions'
            title='ToolHive GitHub Actions'
            linkText='Go to project'
          >
            <img
              src='/img/mcp-servers/github-actions-logo.png'
              alt='Buildkite logo'
              style={{
                width: '60px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            A collection of GitHub Actions to install ToolHive and run MCP
            servers in your CI/CD workflows.
          </ProductCard>
          <ProductCard
            contentType='text'
            href='https://github.com/StacklokLabs/toolhive-buildkite-plugin'
            title='ToolHive Buildkite Plugin'
            linkText='Go to project'
          >
            <img
              src='/img/mcp-servers/buildkite-logo.svg'
              alt='Buildkite logo'
              style={{
                width: '60px',
                height: 'auto',
                float: 'right',
                marginLeft: '0.5rem',
                display: 'block',
                maxWidth: '40%',
              }}
            />
            A Buildkite plugin to run MCP servers in your CI/CD pipelines using
            ToolHive.
          </ProductCard>
        </ProductGrid>
      </main>
    </Layout>
  );
}
