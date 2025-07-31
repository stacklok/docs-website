---
title: File system access
description:
  How to enable MCP server access to your host's file system in ToolHive.
---

Since ToolHive runs MCP servers in isolated containers, they don't have access
to your host's file system by default. However, some servers need to read or
write files on the host system to function properly or persist data.

There are two ways to enable file system access for MCP servers in ToolHive:

1. **The `--volume` flag**: Mount files using Docker volume syntax.

2. **Permission profiles**: Create a custom permission profile that defines
   which host paths the MCP server can read or write.

## Choose a method

When deciding how to enable file system access for an MCP server, consider the
differences between permission profiles and the `volume` flag:

- If you use a permission profile, ToolHive mounts the paths you specify in the
  `read` and `write` properties to the same location inside the container. The
  MCP server will see files at the same path as on your host. If your server
  expects files in a different location, it might not work properly.

- With the `--volume` flag, you use Docker's syntax to set both the source path
  on your host and the destination path inside the container. This gives you
  more control over where files appear in the MCP server's environment. Use this
  when your server needs files in a specific location.

Choose the method that matches your server's requirements. Use permission
profiles for simple, direct mappings. Use the `--volume` flag when you need to
customize the destination path inside the container.

## The `--volume` flag

To enable file system access using the `--volume` flag, you specify the host
path and the container path in the `thv run` command. The syntax is the same as
Docker's volume syntax for bind mounts:

```bash
thv run --volume <HOST_PATH>:<CONTAINER_PATH>[:ro] <SERVER>
```

You can add the `--volume` flag multiple times to mount multiple paths.

The optional `:ro` suffix makes the volume read-only in the container. This is
useful for sharing files without letting the MCP server modify them. For
example, to mount a host directory `/home/user/data` as read-only in the
container at `/data`, run:

```bash
thv run --volume /home/user/data:/data:ro <SERVER>
```

To mount a host file `/home/user/config.json` as read-write in the container at
`/app/config.json`, run:

```bash
thv run --volume /home/user/config.json:/app/config.json <SERVER>
```

### Use with built-in network profiles

You can also use the `--volume` flag with built-in network profiles for a
flexible approach that doesn't require creating a custom profile file.

For example, the AWS Diagram MCP server doesn't need any network connectivity,
but generates diagrams locally. You can use the built-in `none` profile to block
all network access and mount a directory for the generated diagrams:

```bash
thv run --isolate-network --permission-profile none --volume /home/user/aws-diagrams:/tmp/generated-diagrams aws-diagram
```

This approach is useful when you need simple file system access alongside
standard network restrictions.

## Permission profiles

To enable file system access using a permission profile, create a custom profile
that specifies which host paths the MCP server can read or write. You can
include file system permissions alone or pair them with network permissions in
the same profile.

:::note

Paths in permission profiles must be absolute paths on your host system.
Relative paths and expanded paths (like `~/`) are not supported. Always use full
paths starting from the root directory (e.g., `/home/user/documents`).

:::

### File system-only profile

Create a JSON file with your desired file system permissions:

```json title="file-permissions.json"
{
  "read": ["/home/user/documents", "/var/log/app"],
  "write": ["/home/user/output"]
}
```

This profile:

- Mounts `/home/user/documents` and `/var/log/app` as read-only paths
- Mounts `/home/user/output` as a read-write path (note that `write` also
  implies read access)

### Paired with network permissions

You can also pair file system permissions with network access in the same
profile:

```json title="combined-permissions.json"
{
  "read": ["/home/user/config"],
  "write": ["/home/user/data"],
  "network": {
    "outbound": {
      "allow_host": ["api.example.com"],
      "allow_port": [443]
    }
  }
}
```

### Apply the profile

To run an MCP server with your profile:

```bash
thv run --permission-profile ./file-permissions.json <SERVER>
```

For more details on permission profiles and network permissions, see
[custom permissions](./custom-permissions.mdx).

## Examples

Below are some examples of how to use file system access with some common MCP
servers in the ToolHive registry.

:::tip

The example MCP servers below don't require network access, and they have
restricted permission profiles in the ToolHive registry. To further secure these
examples, add the `--isolate-network` flag to block network access entirely.
This ensures the MCP server can only access the file system as specified in your
profile or volume mounts.

:::

### Filesystem MCP server

The
[Filesystem MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
lets you read and write files on your host system. By default, it expects paths
to be mounted under `/projects` inside the container.

Here's how to mount two directories using the `--volume` flag, with one as
read-only:

```bash
thv run --volume ~/documents:/projects/docs:ro --volume ~/code:/projects/code filesystem
```

You can achieve the same result using a permission profile. Create a file called
`filesystem-profile.json`:

```json title="filesystem-profile.json"
{
  "read": ["/home/user/documents"],
  "write": ["/home/user/code"]
}
```

Since permission profiles mount paths at the same location inside the container
as they exist on your host, you need to tell the filesystem server which base
directory to allow. Pass `/home/user` as an argument:

```bash
thv run --permission-profile ./filesystem-profile.json filesystem -- /home/user
```

### Memory MCP server

The
[Memory MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)
uses a local knowledge graph to persist information across chats.

To preserve data between runs, you need to mount a file. First, create an empty
JSON file, then mount it to the expected location inside the container:

```bash
touch ./memory.json
thv run --volume ./memory.json:/app/dist/memory.json memory
```

### SQLite MCP server

The [SQLite MCP server](https://github.com/StacklokLabs/sqlite-mcp) works with
database files on your host system. By default, it expects to find a database
file at `/database.db` inside the container:

```bash
thv run --volume ~/my-database.db:/database.db sqlite
```

If you want to place the database file in a different location inside the
container, use the server's `--db` flag to specify the new path:

```bash
thv run --volume ~/my-database.db:/data/my-database.db sqlite -- --db /data/my-database.db
```

## Related information

- [`thv run` command reference](../reference/cli/thv_run.md)
- [Run MCP servers](./run-mcp-servers.mdx)
- [Custom permissions](./custom-permissions.mdx)
- [Network isolation](./network-isolation.mdx)

## Troubleshooting

<details>
<summary>File system access issues</summary>

If your MCP server can't access the file system as expected:

1. Verify that the paths in your profile or volume flag are correct
2. Ensure the host paths exist and have the correct permissions
   - The MCP server runs as a specific user inside the container, so the host
     paths must be accessible to that user
3. Check that the permissions are set correctly (read/write)
4. Inspect the container's mounted paths to ensure they match your expectations:

   ```bash
   docker inspect <SERVER_NAME>
   ```

   Look for the `Mounts` section to see how paths are mapped.

5. Restart the server with the updated profile or corrected volume mount

</details>
