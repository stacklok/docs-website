# MCP Metadata Plugin

A custom Docusaurus plugin that automatically generates MCP (Model Context
Protocol) server metadata at build-time by executing `thv registry info <name>`
commands.

## Overview

This plugin enables you to display always-current MCP server metadata in your
documentation by simply using a `<MCPMetadata name="server-name" />` component.
The plugin automatically:

- Scans MDX files for MCP metadata components
- Executes CLI commands to fetch current registry data
- Caches results for optimal performance
- Provides live reloading during development
- Handles errors gracefully with helpful feedback

## Features

- ✅ **Build-time Generation**: Metadata fetched during build, zero runtime
  impact
- ✅ **Dynamic File Watching**: Automatically detects new components during
  development
- ✅ **Intelligent Caching**: 5-minute cache prevents redundant CLI calls
- ✅ **Error Handling**: Graceful fallbacks with helpful troubleshooting
- ✅ **TypeScript Support**: Full type safety throughout
- ✅ **Hot Reloading**: Live updates without server restarts

## Installation

The plugin is already configured in this project. For new installations:

1. Copy the `plugins/mcp-metadata-plugin/` directory to your project
2. Install dependencies:

   ```bash
   npm install glob
   ```

3. Add to `docusaurus.config.ts`:

   ```typescript
   plugins: [
     [
       './plugins/mcp-metadata-plugin',
       {
         cacheTimeout: 300000, // 5 minutes (optional)
         thvCommand: 'thv',     // Custom command path (optional)
       },
     ],
   ],
   ```

4. Register the component in `src/theme/MDXComponents.tsx`:

   ```typescript
   import MCPMetadata from '@site/src/components/MCPMetadata';

   export default {
     ...MDXComponents,
     MCPMetadata,
   };
   ```

## Usage

### Basic Usage

Replace static YAML metadata blocks with the dynamic component:

```mdx
## Metadata

<MCPMetadata name='fetch' />
```

### Component Props

| Prop        | Type      | Default      | Description                                   |
| ----------- | --------- | ------------ | --------------------------------------------- |
| `name`      | `string`  | **required** | MCP server name as it appears in the registry |
| `showTitle` | `boolean` | `true`       | Whether to display the "Metadata" heading     |
| `className` | `string`  | `undefined`  | Additional CSS classes                        |

### Advanced Usage

```mdx
<!-- Without title heading -->

<MCPMetadata name='fetch' showTitle={false} />

<!-- With custom styling -->

<MCPMetadata name='github' className='custom-metadata' />
```

## How It Works

### Build Process

1. **File Scanning**: Plugin scans all `*.mdx` files in the `docs/` directory
2. **Component Detection**: Extracts server names from
   `<MCPMetadata name="..." />` components
3. **CLI Execution**: Runs `thv registry info <name>` for each unique server
4. **Data Storage**: Stores raw YAML output in global plugin data
5. **Component Rendering**: Components access data and render syntax-highlighted
   YAML

### Development Workflow

1. **File Watching**: Plugin includes file watching capabilities (via
   `getPathsToWatch()`)
2. **Server Restart Required**: Currently requires development server restart to
   detect new components
3. **Component Detection**: New `<MCPMetadata>` components detected after
   restart
4. **Caching**: Results cached for 5 minutes to avoid redundant calls

## Configuration

### Plugin Options

Configure in `docusaurus.config.ts`:

```typescript
[
  './plugins/mcp-metadata-plugin',
  {
    // Cache timeout in milliseconds (default: 300000 = 5 minutes)
    cacheTimeout: 300000,

    // Custom thv command path (default: 'thv')
    thvCommand: '/usr/local/bin/thv',
  },
];
```

### Environment Requirements

- **thv CLI**: Must be available in the build environment
- **Network Access**: Required to reach the ToolHive registry
- **Node.js**: Compatible with Docusaurus requirements

## Error Handling

The plugin handles various error scenarios gracefully:

### Server Not Found

```text
Loading metadata for "invalid-server"...
If this persists, the server may not exist in the registry...
```

### CLI Command Failed

```text
# Error fetching data for server-name
# Command failed: thv registry info server-name
# Please check that the server exists in the registry and thv command is available
```

### Plugin Not Available

```text
Loading: MCP metadata plugin is initializing.
If this persists, make sure the plugin is properly configured.
```

## Development

### File Structure

```text
plugins/mcp-metadata-plugin/
├── README.md              # This file
├── package.json           # Plugin dependencies
└── src/
    ├── index.ts          # Main plugin implementation
    ├── types.ts          # TypeScript type definitions
    └── utils.ts          # Utility functions
```

### Key Components

- **`index.ts`**: Main plugin with `loadContent()`, `contentLoaded()`, and
  `getPathsToWatch()`
- **`utils.ts`**: File scanning, CLI execution, and caching logic
- **`types.ts`**: TypeScript interfaces for plugin options and data structures

### Debugging

Enable debug logging by checking the console output during build:

```text
MCP Metadata Plugin: Loading content...
Found MCP servers: fetch, github
Executing: thv registry info fetch
Using cached data for server: github
```

## Performance

### Build Time

- **Parallel Execution**: CLI commands run concurrently
- **Smart Caching**: Avoids redundant calls for same servers
- **Incremental Updates**: Only processes changed files during development

### Runtime

- **Zero Impact**: All data generated at build-time
- **Static Output**: Pure HTML/CSS/JS with no client-side processing
- **CDN Friendly**: Fully static and cacheable

## Troubleshooting

### Common Issues

1. **"No metadata found" warnings**
   - Check server name spelling
   - Verify server exists in ToolHive registry
   - Ensure `thv` command is available

2. **Plugin data not available**
   - Verify plugin is registered in `docusaurus.config.ts`
   - Check component is registered in `MDXComponents.tsx`
   - Restart development server

3. **Stale data during development**
   - Wait for cache timeout (5 minutes)
   - Restart development server
   - Modify `cacheTimeout` configuration

### Debug Steps

1. Check console output for plugin messages
2. Verify `thv registry info <name>` works manually
3. Ensure network connectivity to registry
4. Validate MDX component syntax

## Contributing

When modifying the plugin:

1. Update TypeScript types in `types.ts`
2. Add error handling for new scenarios
3. Update this README with new features
4. Test with both existing and new MCP servers

## License

This plugin is part of the Stacklok documentation project and follows the same
license terms.
