import path from 'path';
import type { Plugin, LoadContext } from '@docusaurus/types';
import { PluginOptions, PluginContent } from './types';
import { scanForMCPComponents, fetchServerData } from './utils';

export default function mcpMetadataPlugin(
  context: LoadContext,
  options: PluginOptions = {}
): Plugin<PluginContent> {
  const { thvCommand = 'thv' } = options;

  return {
    name: 'mcp-metadata-plugin',

    getPathsToWatch() {
      // Watch all MDX files in the docs directory for changes
      const docsPath = path.join(context.siteDir, 'docs');
      return [`${docsPath}/**/*.mdx`];
    },

    async loadContent(): Promise<PluginContent> {
      console.log('MCP Metadata Plugin: Loading content...');

      // Get the docs directory path
      const docsPath = path.join(context.siteDir, 'docs');

      // Scan all MDX files for MCPMetadata components
      const mcpServers = await scanForMCPComponents(docsPath);
      console.log(`Found MCP servers: ${Array.from(mcpServers).join(', ')}`);

      const serverData: Record<string, string> = {};

      // Fetch data for each server (no caching - always fresh)
      for (const serverName of mcpServers) {
        try {
          console.log(`Fetching fresh data for server: ${serverName}`);
          const data = await fetchServerData(serverName, thvCommand);
          console.log(
            `Successfully fetched data for ${serverName}, length: ${data.length} chars`
          );
          serverData[serverName] = data;
        } catch (error) {
          console.error(
            `Failed to fetch data for MCP server: ${serverName}`,
            error
          );
          // Store error message as fallback
          serverData[serverName] = `# Error fetching data for ${serverName}
# ${error.message}
# Please check that the server exists in the registry and thv command is available`;
        }
      }

      console.log('Final serverData keys:', Object.keys(serverData));
      console.log('Final serverData:', serverData);

      return { mcpServers: serverData };
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;

      console.log('MCP Metadata Plugin: Setting global data...');

      // Make MCP server data available globally to components
      setGlobalData(content);
    },
  };
}

// Export the plugin function as default and named export for flexibility
export { mcpMetadataPlugin };
