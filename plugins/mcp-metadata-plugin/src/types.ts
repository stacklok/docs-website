export interface PluginOptions {
  cacheTimeout?: number; // Cache timeout in milliseconds
  thvCommand?: string; // Custom thv command path
}

export interface CacheEntry {
  data: string; // Raw YAML output from thv command
  timestamp: number;
}

export interface PluginContent {
  mcpServers: Record<string, string>; // serverName -> raw YAML output
}
