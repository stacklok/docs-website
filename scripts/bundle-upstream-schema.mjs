#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * This script dereferences the upstream registry schema, resolving all $ref
 * references (including remote ones) into a single bundled schema file.
 *
 * This is necessary because the upstream schema references the official MCP
 * server schema, which contains internal $ref references that the JSON Schema
 * Viewer plugin cannot resolve at runtime.
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import $RefParser from '@apidevtools/json-schema-ref-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = join(__dirname, '..', 'static', 'api-specs');

const INPUT_FILE = join(STATIC_DIR, 'upstream-registry.schema.json');
const OUTPUT_FILE = join(STATIC_DIR, 'upstream-registry-bundled.schema.json');

async function bundleSchema() {
  console.log('Bundling upstream registry schema...');
  console.log(`  Input: ${INPUT_FILE}`);
  console.log(`  Output: ${OUTPUT_FILE}`);

  try {
    const schema = await $RefParser.dereference(INPUT_FILE);
    writeFileSync(OUTPUT_FILE, JSON.stringify(schema, null, 2));
    console.log('Schema bundled successfully');
  } catch (error) {
    console.error('Failed to bundle schema:', error.message);
    process.exit(1);
  }
}

bundleSchema();
