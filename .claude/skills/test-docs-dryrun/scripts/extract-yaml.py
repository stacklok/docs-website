#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
# SPDX-License-Identifier: Apache-2.0

"""Extract ToolHive CRD YAML blocks from Docusaurus .mdx files.

Usage:
    python3 extract-yaml.py <mdx-file> <output-dir> [--prefix <section>]

Finds all ```yaml/```yml fenced code blocks, splits multi-document
blocks on ---, and writes each document containing
toolhive.stacklok.dev as a separate .yaml file.

The --prefix option adds a section prefix to output filenames to avoid
collisions when multiple sections have files with the same basename
(e.g., both guides-k8s/ and guides-vmcp/ have telemetry-and-metrics.mdx).

Examples:
    python3 extract-yaml.py docs/toolhive/guides-k8s/auth-k8s.mdx /tmp/yaml --prefix k8s
    # Output: k8s-auth-k8s_0.yaml, k8s-auth-k8s_1.yaml, ...

    python3 extract-yaml.py docs/toolhive/guides-vmcp/optimizer.mdx /tmp/yaml --prefix vmcp
    # Output: vmcp-optimizer_0.yaml, vmcp-optimizer_1.yaml, ...
"""

import os
import re
import sys


def extract_yaml_blocks(filepath):
    """Extract YAML blocks containing toolhive apiVersion from an mdx file."""
    with open(filepath, encoding="utf-8") as f:
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
    # Parse args: <file> <output-dir> [--prefix <section>]
    args = sys.argv[1:]
    prefix = ""
    if "--prefix" in args:
        idx = args.index("--prefix")
        prefix = args[idx + 1] + "-"
        args = args[:idx] + args[idx + 2 :]

    if len(args) != 2:
        print(
            f"Usage: {sys.argv[0]} <mdx-file> <output-dir> [--prefix <section>]",
            file=sys.stderr,
        )
        sys.exit(1)

    filepath = args[0]
    output_dir = args[1]
    basename, _ = os.path.splitext(os.path.basename(filepath))

    blocks = extract_yaml_blocks(filepath)

    for i, block in enumerate(blocks):
        outfile = os.path.join(output_dir, f"{prefix}{basename}_{i}.yaml")
        with open(outfile, "w", encoding="utf-8") as f:
            f.write(block + "\n")

    print(f"  {prefix}{basename}: {len(blocks)} blocks")


if __name__ == "__main__":
    main()
