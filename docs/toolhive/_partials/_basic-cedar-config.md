Create a JSON or YAML file with Cedar policies. Here's an example in JSON
format:

```json
{
  "version": "1.0",
  "type": "cedarv1",
  "cedar": {
    "policies": [
      // Allow everyone to use the weather tool
      "permit(principal, action == Action::\"call_tool\", resource == Tool::\"weather\");",
      // Restrict admin_tool to a specific user
      "permit(principal == Client::\"alice123\", action == Action::\"call_tool\", resource == Tool::\"admin_tool\");",
      // Role-based access: only users with the 'premium' role can call any tool
      "permit(principal, action == Action::\"call_tool\", resource) when { principal.claim_roles.contains(\"premium\") };",
      // Attribute-based: allow calculator tool only for add/subtract operations
      "permit(principal, action == Action::\"call_tool\", resource == Tool::\"calculator\") when { resource.arg_operation == \"add\" || resource.arg_operation == \"subtract\" };"
    ],
    "entities_json": "[]"
  }
}
```

You can also define custom resource attributes in `entities_json` for per-tool
ownership or sensitivity labels.

:::tip

For more policy examples and advanced usage, see
[Cedar policies](../concepts/cedar-policies.md).

:::
