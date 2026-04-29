// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

export interface PluginOptions {
  thvCommand?: string; // Custom thv command path
  failOnError?: boolean; // Whether to fail the build on thv command errors
}

export interface PluginContent {
  mcpServers: Record<string, string>; // serverName -> raw text output
}
