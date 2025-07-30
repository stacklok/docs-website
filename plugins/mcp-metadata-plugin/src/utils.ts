// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Pattern to ignore MDX files starting with underscore
 */
export const MDX_IGNORE_PATTERN = '**/_*.mdx';

/**
 * Get glob patterns for MDX files, excluding files starting with underscore
 */
export function getMDXGlobPatterns(docsPath: string): string[] {
  return [`${docsPath}/**/*.mdx`, `!${docsPath}/${MDX_IGNORE_PATTERN}`];
}

/**
 * Scans MDX files for MCPMetadata components and extracts server names
 */
export async function scanForMCPComponents(
  docsPath: string
): Promise<Set<string>> {
  const serverNames = new Set<string>();

  try {
    // Find all MDX files in the docs directory
    const mdxFiles = await glob('**/*.mdx', {
      cwd: docsPath,
      ignore: [MDX_IGNORE_PATTERN],
    });

    // Regex to match <MCPMetadata name="serverName" /> components
    const mcpComponentRegex = /<MCPMetadata\s+name=["']([^"']+)["'][^>]*\/?>/g;

    for (const file of mdxFiles) {
      try {
        const content = readFileSync(`${docsPath}/${file}`, 'utf-8');
        let match;

        while ((match = mcpComponentRegex.exec(content)) !== null) {
          const serverName = match[1];
          if (serverName) {
            serverNames.add(serverName);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}:`, error);
      }
    }
  } catch (error) {
    console.warn('Warning: Could not scan for MCP components:', error);
  }

  return serverNames;
}

/**
 * Executes thv registry info command and returns raw output
 */
export async function fetchServerData(
  serverName: string,
  thvCommand: string = 'thv'
): Promise<string> {
  try {
    const command = `${thvCommand} registry info ${serverName}`;
    // console.log(`Executing: ${command}`);

    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30 second timeout
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return output.trim();
  } catch (error) {
    console.error(
      `Failed to fetch data for MCP server "${serverName}":`,
      error
    );
    throw new Error(`Failed to fetch MCP server data: ${error.message}`);
  }
}
