// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import CodeBlock from '@theme/CodeBlock';
import Details from '@theme/Details';
import { PluginContent } from '../../../plugins/mcp-metadata-plugin/src/types';

interface MCPMetadataProps {
  name: string;
  className?: string;
}

export default function MCPMetadata({
  name,
  className,
}: MCPMetadataProps): React.ReactElement {
  const pluginData = usePluginData('mcp-metadata-plugin') as PluginContent;

  if (!pluginData || !pluginData.mcpServers) {
    return (
      <div className='alert alert--info'>
        <strong>Loading MCP metadata...</strong>
        <p>
          The MCP metadata plugin is initializing. If this persists, make sure
          the plugin is properly configured in <code>docusaurus.config.ts</code>
          .
        </p>
      </div>
    );
  }

  const serverData = pluginData.mcpServers[name];

  if (!serverData) {
    return (
      <div className='alert alert--warning'>
        <strong>No metadata found for MCP server &quot;{name}&quot;</strong>
        <p>
          This usually means the server wasn&apos;t found when the plugin
          scanned for MCP components.
        </p>
        <details>
          <summary>How to fix this</summary>
          <ul>
            <li>
              <strong>If you just added this component:</strong> Restart the
              development server (<code>npm run start</code>) to detect new MCP
              components
            </li>
            <li>
              <strong>Check the server name:</strong> Ensure &quot;{name}&quot;
              is spelled correctly
            </li>
            <li>
              <strong>Verify server exists:</strong> Run{' '}
              <code>thv registry info {name}</code> manually to confirm the
              server exists in the ToolHive registry
            </li>
            <li>
              <strong>Check thv command:</strong> Ensure the <code>thv</code>{' '}
              command is available in your build environment
            </li>
          </ul>
        </details>
      </div>
    );
  }

  // Check if the data is an error message
  if (serverData.startsWith('# Error fetching data')) {
    return (
      <div className='alert alert--danger'>
        <strong>Error:</strong> Failed to fetch metadata for MCP server &quot;
        {name}&quot;.
        <details>
          <summary>Error details</summary>
          <CodeBlock language='yaml'>{serverData}</CodeBlock>
        </details>
      </div>
    );
  }

  return (
    <div className={className}>
      <Details summary={"Expand to view the MCP server's metadata"}>
        <CodeBlock language='yaml' title='Server metadata'>
          {serverData}
        </CodeBlock>
      </Details>
    </div>
  );
}

export type { MCPMetadataProps };
