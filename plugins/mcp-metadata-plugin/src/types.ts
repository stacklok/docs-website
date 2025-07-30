export interface PluginOptions {
  thvCommand?: string; // Custom thv command path
}

export interface PluginContent {
  mcpServers: Record<string, string>; // serverName -> raw YAML output
}
