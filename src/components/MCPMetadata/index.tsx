import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import CodeBlock from '@theme/CodeBlock';
import { PluginContent } from '../../../plugins/mcp-metadata-plugin/src/types';

interface MCPMetadataProps {
  name: string;
  showTitle?: boolean;
  className?: string;
}

export default function MCPMetadata({
  name,
  showTitle = true,
  className,
}: MCPMetadataProps): React.ReactElement {
  const pluginData = usePluginData('mcp-metadata-plugin') as PluginContent;

  if (!pluginData || !pluginData.mcpServers) {
    return (
      <div className='alert alert--info'>
        <strong>Loading:</strong> MCP metadata plugin is initializing. If this
        persists, make sure the plugin is properly configured.
      </div>
    );
  }

  const serverData = pluginData.mcpServers[name];

  if (!serverData) {
    return (
      <div className='alert alert--warning'>
        <strong>Loading metadata for &quot;{name}&quot;...</strong>
        <p>
          If this persists, the server may not exist in the registry or the thv
          command may not be available.
        </p>
        <details>
          <summary>Troubleshooting</summary>
          <ul>
            <li>Check that the server name &quot;{name}&quot; is correct</li>
            <li>Verify the server exists in the ToolHive registry</li>
            <li>
              Ensure the <code>thv</code> command is available in your build
              environment
            </li>
            <li>Try restarting the development server</li>
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
      {showTitle && <h2>Metadata</h2>}
      <CodeBlock language='yaml' title='Server Metadata'>
        {serverData}
      </CodeBlock>
    </div>
  );
}

export type { MCPMetadataProps };
