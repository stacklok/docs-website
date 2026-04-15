#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

"""Extract ToolHive CRD YAML blocks from Docusaurus .mdx files.

Usage:
    python3 extract-yaml.py <mdx-file> <output-dir>

Finds all ```yaml/```yml fenced code blocks, splits multi-document
blocks on ---, and writes each document containing
toolhive.stacklok.dev as a separate .yaml file.
"""

import os
import re
import sys


def extract_yaml_blocks(filepath):
    """Extract YAML blocks containing toolhive apiVersion from an mdx file."""
    with open(filepath) as f:
        content = f.read()

    # Match ```yaml or ```yml code blocks (with optional metadata after yaml/yml)
    pattern = r"```ya?ml[^\n]*\n(.*?)```"
    blocks = re.findall(pattern, content, re.DOTALL)

    results = []
    for block in blocks:
        # Split multi-document blocks
        docs = re.split(r"^---\s*$", block, flags=re.MULTILINE)
        for doc in docs:
            doc = doc.strip()
            if not doc:
                continue
            # Strip highlight comments that Docusaurus uses
            doc = re.sub(
                r"^\s*#\s*highlight-(start|end|next-line)\s*$",
                "",
                doc,
                flags=re.MULTILINE,
            )
            doc = doc.strip()
            if "toolhive.stacklok.dev" in doc:
                results.append(doc)

    return results


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <mdx-file> <output-dir>", file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    output_dir = sys.argv[2]
    basename = os.path.basename(filepath).replace(".mdx", "")

    blocks = extract_yaml_blocks(filepath)

    for i, block in enumerate(blocks):
        outfile = os.path.join(output_dir, f"{basename}_{i}.yaml")
        with open(outfile, "w") as f:
            f.write(block + "\n")

    print(f"  {basename}: {len(blocks)} blocks")


if __name__ == "__main__":
    main()
