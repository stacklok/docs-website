// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

export interface PluginOptions {
  thvCommand?: string; // Custom thv command path
}

export interface PluginContent {
  mcpServers: Record<string, string>; // serverName -> raw text output
}
