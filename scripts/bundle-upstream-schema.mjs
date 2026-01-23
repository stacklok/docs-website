#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * This script dereferences the upstream registry schema, resolving all $ref
 * references (including remote ones) into a single bundled schema file.
 *
 * It also fetches and dereferences the official MCP server schema separately
 * for improved rendering on the documentation page. The MCP server schema URL
 * is extracted from the $ref in the upstream registry schema.
 *
 * This is necessary because the upstream schema references the official MCP
 * server schema, which contains internal $ref references that the JSON Schema
 * Viewer plugin cannot resolve at runtime.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import $RefParser from '@apidevtools/json-schema-ref-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = join(__dirname, '..', 'static', 'api-specs');

const REGISTRY_SCHEMA = join(STATIC_DIR, 'upstream-registry.schema.json');
const MCP_SERVER_SCHEMA = join(STATIC_DIR, 'mcp-server.schema.json');

/**
 * Extract the MCP server schema URL from the upstream registry schema.
 * Looks for $ref in data.properties.servers.items.
 */
function extractMcpServerUrl(registrySchemaPath) {
  const schema = JSON.parse(readFileSync(registrySchemaPath, 'utf-8'));
  const ref = schema?.properties?.data?.properties?.servers?.items?.$ref;

  if (!ref || !ref.startsWith('http')) {
    throw new Error(
      'Could not find MCP server schema $ref in upstream registry schema'
    );
  }

  return ref;
}

/**
 * Replace the MCP server $ref in the registry with a placeholder that directs
 * readers to the separate MCP server schema section.
 */
function simplifyRegistrySchema(schema, mcpServerUrl) {
  const serverPlaceholder = {
    type: 'object',
    description: `MCP server object (see MCP server object schema section below). Source: ${mcpServerUrl}`,
  };

  // Replace servers.items $ref
  if (schema?.properties?.data?.properties?.servers?.items) {
    schema.properties.data.properties.servers.items = serverPlaceholder;
  }

  // Replace groups.items.properties.servers.items $ref if present
  if (
    schema?.properties?.data?.properties?.groups?.items?.properties?.servers
      ?.items
  ) {
    schema.properties.data.properties.groups.items.properties.servers.items =
      serverPlaceholder;
  }

  return schema;
}

async function main() {
  try {
    const mcpServerUrl = extractMcpServerUrl(REGISTRY_SCHEMA);

    // Simplify registry schema by replacing $refs with placeholders
    const registrySchema = JSON.parse(readFileSync(REGISTRY_SCHEMA, 'utf-8'));
    const simplifiedSchema = simplifyRegistrySchema(
      registrySchema,
      mcpServerUrl
    );
    writeFileSync(REGISTRY_SCHEMA, JSON.stringify(simplifiedSchema, null, 2));
    console.log('Upstream registry schema processed successfully');

    // Fetch and dereference the MCP server schema
    const mcpServerSchema = await $RefParser.dereference(mcpServerUrl);
    writeFileSync(MCP_SERVER_SCHEMA, JSON.stringify(mcpServerSchema, null, 2));
    console.log('MCP server schema fetched successfully');
  } catch (error) {
    console.error('Failed to process schemas:', error.message);
    process.exit(1);
  }
}

main();
