import path from 'path';
import type { Plugin, LoadContext } from '@docusaurus/types';
import { PluginOptions, PluginContent } from './types';
import { MCPDataCache, scanForMCPComponents, fetchServerData } from './utils';

export default function mcpMetadataPlugin(
  context: LoadContext,
  options: PluginOptions = {}
): Plugin<PluginContent> {
  const { cacheTimeout = 300000, thvCommand = 'thv' } = options;
  const cache = new MCPDataCache(cacheTimeout);

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

      // Fetch data for each server (with caching)
      for (const serverName of mcpServers) {
        try {
          // Check cache first
          let data = cache.get(serverName);

          if (!data) {
            // Fetch fresh data
            data = await fetchServerData(serverName, thvCommand);
            cache.set(serverName, data);
          } else {
            console.log(`Using cached data for server: ${serverName}`);
          }

          serverData[serverName] = data;
        } catch (error) {
          console.warn(
            `Failed to fetch data for MCP server: ${serverName}`,
            error
          );
          // Store error message as fallback
          serverData[serverName] = `# Error fetching data for ${serverName}
# ${error.message}
# Please check that the server exists in the registry and thv command is available`;
        }
      }

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
