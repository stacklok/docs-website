---
title: Hide sensitive files with .thvignore
description:
  Use .thvignore to prevent secrets from leaking into MCP containers while
  keeping fast bind mounts for development.
---

Some MCP servers need access to your project files, but you don't want to expose
secrets like `.env`, SSH keys, or cloud credentials. ToolHive supports a
`.thvignore` mechanism that masks selected paths from the container while
keeping all other files available through a live bind mount for a smooth
developer experience.

## How it works

When you mount a directory and a `.thvignore` file is present at the mount
source, ToolHive resolves the ignore patterns and overlays those paths inside
the container:

- Directories (for example, `.ssh/`, `node_modules/`): overlaid using a tmpfs
  mount at the container path
- Files (for example, `.env`, `secrets.json`): overlaid using a bind mount of a
  shared, empty host file at the container path

The rest of the files remain bind-mounted from your host, so edits are visible
in the container immediately.

## Requirements

- ToolHive CLI
- A mount source directory that contains a `.thvignore` file with patterns to
  exclude

## Create a .thvignore

Create a `.thvignore` file at the root of the directory you intend to mount. Use
simple, gitignore-like patterns:

```text
# secrets
.env
.env.*
*.key
*.pem

# cloud credentials
.aws/
.gcp/

# SSH keys
.ssh/

# OS junk
.DS_Store
```

Guidelines:

- `dir/` matches a directory directly under the mount source
- `file.ext` matches a file directly under the mount source
- `*.ext` matches any file with that extension directly under the mount source
- Lines starting with `#` are comments; blank lines are ignored

## Run a server with .thvignore

Mount your project directory as usual. ToolHive automatically reads `.thvignore`
if present:

```bash
thv run --volume ./my-project:/app fetch
```

To print resolved overlay targets for debugging:

```bash
thv run --volume ./my-project:/app \
  --print-resolved-overlays \
  fetch
```

The resolved overlays are logged to the workload's log file. For a complete list
of options, see the [`thv run` command reference](../reference/cli/thv_run.md).

## Global ignore patterns

You can define global ignore patterns at:

```text
~/.config/toolhive/thvignore
```

These patterns are loaded in addition to your project's local `.thvignore`.

- Enabled by default
- Disable for a single run:

```bash
thv run --ignore-globally=false --volume ./my-project:/app fetch
```

Recommendation: Store machine-wide patterns (for example, `.aws/`, `.gcp/`,
`.ssh/`, `*.pem`, `.docker/config.json`) in the global file, and keep
app-specific patterns (for example, `.env*`, build artifacts) in your project's
local `.thvignore`.

## Troubleshooting

- Overlays didn't apply
  - Ensure `.thvignore` exists in the mount source directory (not elsewhere)
  - Confirm patterns match actual names relative to the mount source
  - Run with `--print-resolved-overlays` and check the workload's log file path
    displayed by `thv run`

- Can’t list a parent directory
  - On SELinux systems, listing a parent directory may fail even though specific
    files are accessible. Probe individual paths instead (for example, `stat` or
    `cat`).

## Related information

- [File system access](./filesystem-access.md)
- [Run MCP servers](./run-mcp-servers.mdx)
- [Network isolation](./network-isolation.mdx)
- [`thv run` command reference](../reference/cli/thv_run.md)
