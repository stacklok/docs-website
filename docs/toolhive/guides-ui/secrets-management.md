---
title: Secrets management
description:
  How to securely manage API tokens and other sensitive data in the ToolHive UI.
---

Many MCP servers need secrets like API tokens, connection strings, and other
sensitive parameters. ToolHive provides built-in secrets management so you can
manage these values securely without exposing them in plaintext configuration
files.

ToolHive encrypts secrets using a randomly generated password that is stored in
your operating system's secure keyring.

You can add new secrets on the **Secrets** page or during MCP server
installation.

:::note

The ToolHive UI does not currently support the 1Password secrets provider. If
you have configured the 1Password secrets provider using the ToolHive CLI, the
UI will automatically update your configuration to use the built-in encrypted
provider instead.

:::

## Enter secrets during MCP installation

When you install an MCP server from the registry, any required secrets are
listed on the configuration form with their corresponding environment variable.

When you add a custom MCP server, add secrets by entering the environment
variable name that the MCP server expects.

To set the secret value, you can:

- Select an existing secret to populate its value in the configuration form.
- Enter a value in the input box. ToolHive creates a new secret with a name
  matching the environment variable.

## Manage secrets

Your ToolHive secrets are managed on the **Secrets** page. Here you can:

- Click the **Add secret** button to create a new secret. Enter a friendly name
  for the secret and its value.
- Expand the menu (︙) next to an existing secret to:
  - Update the secret value
  - Delete the secret

:::important

If you delete a secret that is in use by an MCP server, the server will continue
running but you will not be able to restart it if stopped. You'll need to remove
the server and reinstall it with the required secrets, or add the secret back
using the same name.

:::

## Related information

- [Run MCP servers](./run-mcp-servers.md)
- [Client configuration](./client-configuration.mdx)
