---
title: Cedar policies
description:
  Writing and configuring Cedar policies for MCP server authorization.
sidebar_position: 51
---

This document provides detailed guidance on writing and configuring Cedar
policies for MCP server authorization. You'll learn how to create effective
policies, configure authorization settings, and troubleshoot common issues.

:::info

For the conceptual overview of authentication and authorization, see
[Authentication and authorization framework](./auth-framework.md).

:::

## Cedar policy language

Cedar policies express authorization rules in a clear, declarative syntax:

```text
permit|forbid(principal, action, resource) when { conditions };
```

- `permit` or `forbid`: Whether to allow or deny the operation
- `principal`: The entity making the request (the client)
- `action`: The operation being performed
- `resource`: The object being accessed
- `conditions`: Optional conditions that must be satisfied

## MCP-specific entities

In the context of MCP servers, Cedar policies use the following entities:

### Principal

The client making the request, identified by the `sub` claim in the JWT token:

- Format: `Client::<client_id>`
- Example: `Client::user123`

### Action

The operation being performed on an MCP feature:

- Format: `Action::<operation>`
- Examples:
  - `Action::"call_tool"`: Call a tool
  - `Action::"get_prompt"`: Get a prompt
  - `Action::"read_resource"`: Read a resource
  - `Action::"list_tools"`: List available tools

### Resource

The object being accessed:

- Format: `<type>::<id>`
- Examples:
  - `Tool::"weather"`: The weather tool
  - `Prompt::"greeting"`: The greeting prompt
  - `Resource::"data"`: The data resource

## Configuration formats

You can configure Cedar authorization using either JSON or YAML format:

### JSON configuration

```json
{
  "version": "1.0",
  "type": "cedarv1",
  "cedar": {
    "policies": [
      "permit(principal, action == Action::\"call_tool\", resource == Tool::\"weather\");",
      "permit(principal, action == Action::\"get_prompt\", resource == Prompt::\"greeting\");",
      "permit(principal, action == Action::\"read_resource\", resource == Resource::\"data\");"
    ],
    "entities_json": "[]"
  }
}
```

### YAML configuration

```yaml
version: '1.0'
type: cedarv1
cedar:
  policies:
    - 'permit(principal, action == Action::"call_tool", resource ==
      Tool::"weather");'
    - 'permit(principal, action == Action::"get_prompt", resource ==
      Prompt::"greeting");'
    - 'permit(principal, action == Action::"read_resource", resource ==
      Resource::"data");'
  entities_json: '[]'
```

### Configuration fields

- `version`: The version of the configuration format
- `type`: The type of authorization configuration (currently only `cedarv1` is
  supported)
- `cedar`: The Cedar-specific configuration
  - `policies`: An array of Cedar policy strings
  - `entities_json`: A JSON string representing Cedar entities

## Writing effective policies

Understanding how to write Cedar policies is crucial for securing your MCP
servers effectively. This section provides practical guidance for creating
policies that match your security requirements.

### Basic policy patterns

Start with simple policies and build complexity as needed:

#### Allow specific tool access

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather");
```

This policy allows any authenticated client to call the weather tool. It's
useful when you want to provide broad access to specific functionality.

#### Allow specific user access

```text
permit(principal == Client::"user123", action == Action::"call_tool", resource);
```

This policy allows a specific user to call any tool. Use this pattern when you
need to grant broad permissions to trusted users.

### Role-based access control (RBAC)

RBAC policies use roles from JWT claims to determine access:

```text
permit(principal, action == Action::"call_tool", resource) when {
  principal.claim_roles.contains("admin")
};
```

This policy allows clients with the "admin" role to call any tool. RBAC is
effective when you have well-defined roles in your organization.

### Attribute-based access control (ABAC)

ABAC policies use multiple attributes to make fine-grained decisions:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"sensitive_data") when {
  principal.claim_roles.contains("data_analyst") &&
  resource.arg_data_level <= principal.claim_clearance_level
};
```

This policy allows data analysts to access sensitive data, but only if their
clearance level is sufficient. ABAC provides the most flexibility for complex
security requirements.

## Working with JWT claims

JWT claims from your identity provider become available in policies with a
`claim_` prefix. You can use these claims in two ways:

**On the principal entity:**

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather") when {
  principal.claim_name == "John Doe"
};
```

**In the context:**

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather") when {
  context.claim_name == "John Doe"
};
```

Both approaches work identically. Choose the one that makes your policies more
readable.

## Working with tool arguments

Tool arguments become available in policies with an `arg_` prefix. This lets you
create policies based on the specific parameters of requests:

**On the resource entity:**

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather") when {
  resource.arg_location == "New York" || resource.arg_location == "London"
};
```

**In the context:**

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather") when {
  context.arg_location == "New York" || context.arg_location == "London"
};
```

This policy allows weather tool calls only for specific locations, demonstrating
how you can control access based on request parameters.

## List operations and filtering

List operations (`tools/list`, `prompts/list`, `resources/list`) work
differently from other operations. They're always allowed, but the response is
automatically filtered based on what the user can actually access:

- `tools/list` shows only tools the user can call (based on `call_tool`
  policies)
- `prompts/list` shows only prompts the user can get (based on `get_prompt`
  policies)
- `resources/list` shows only resources the user can read (based on
  `read_resource` policies)

You don't need to write explicit policies for list operations. Instead, focus on
the underlying access policies, and the lists will be filtered automatically.

For example, if you have this policy:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"weather");
```

Then `tools/list` will only show the "weather" tool for that user.

## Policy evaluation and secure defaults

Understanding how Cedar evaluates policies helps you write more effective and
secure authorization rules.

### Evaluation order

ToolHive's policy evaluation follows a secure-by-default, least-privilege model:

1. **Deny precedence:** If any `forbid` policy matches, the request is denied
2. **Permit evaluation:** If any `permit` policy matches, the request is
   authorized
3. **Default deny:** If no policy matches, the request is denied

This means that `forbid` policies always override `permit` policies, and any
request not explicitly permitted is denied. This approach minimizes risk and
ensures that only authorized actions are allowed.

### Designing secure policies

When writing policies, follow these principles:

**Start with least privilege:** Begin by denying everything, then add specific
permissions as needed. This approach is more secure than starting with broad
permissions and trying to restrict them.

**Use explicit deny sparingly:** While `forbid` policies can be useful, they can
also make your policy set harder to understand. In most cases, the default deny
behavior is sufficient.

**Test your policies:** Always test policies with real requests to ensure they
work as expected. Pay special attention to edge cases and error conditions.

## Advanced policy examples

### Combining JWT claims and tool arguments

You can combine JWT claims and tool arguments in your policies to create more
sophisticated authorization rules:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"sensitive_data") when {
  principal.claim_roles.contains("data_analyst") &&
  resource.arg_data_level <= principal.claim_clearance_level
};
```

This policy allows clients with the "data_analyst" role to access the
sensitive_data tool, but only if their clearance level (from JWT claims) is
sufficient for the requested data level (from tool arguments).

### Multi-tenant environments

In multi-tenant environments, you can use policies to isolate tenants:

```text
permit(principal, action, resource) when {
  principal.claim_tenant_id == resource.tenant_id
};
```

This ensures that clients can only access resources belonging to their tenant.

### Data sensitivity levels

For data with different sensitivity levels:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"data_access") when {
  principal.claim_clearance_level >= resource.arg_data_sensitivity
};
```

This ensures that clients can only access data within their clearance level.

### Geographic restrictions

For geographically restricted resources:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"geo_restricted") when {
  principal.claim_location in ["US", "Canada", "Mexico"]
};
```

This restricts access based on the client's location.

### Time-based access

For resources that should only be accessible during certain hours:

```text
permit(principal, action == Action::"call_tool", resource == Tool::"business_hours") when {
  context.current_hour >= 9 && context.current_hour <= 17
};
```

This restricts access to business hours only.

## Entity attributes

Cedar entities can have attributes that can be used in policy conditions. The
authorization middleware automatically adds JWT claims and tool arguments as
attributes to the principal entity.

You can also define custom entities with attributes in the `entities_json` field
of the configuration file:

```json
{
  "version": "1.0",
  "type": "cedarv1",
  "cedar": {
    "policies": [
      "permit(principal, action == Action::\"call_tool\", resource) when { resource.owner == principal.claim_sub };"
    ],
    "entities_json": "[
      {
        \"uid\": \"Tool::weather\",
        \"attrs\": {
          \"owner\": \"user123\"
        }
      }
    ]"
  }
}
```

This configuration defines a custom entity for the weather tool with an `owner`
attribute set to `user123`. The policy allows clients to call tools only if they
own them.

## Troubleshooting policies

When policies don't work as expected, follow this systematic approach:

### Request is denied unexpectedly

1. **Check policy syntax:** Ensure your policies are correctly formatted and use
   valid Cedar syntax.
2. **Verify entity matching:** Confirm that the principal, action, and resource
   in your policies match the actual values in the request.
3. **Test conditions:** Check that any conditions in your policies are satisfied
   by the request context.
4. **Remember default deny:** If no policy explicitly permits the request, it
   will be denied.

### JWT claims are not available

1. **Verify JWT middleware:** Ensure that JWT authentication is configured
   correctly and running before authorization.
2. **Check token claims:** Verify that the JWT token contains the expected
   claims.
3. **Use correct prefix:** Remember that JWT claims are available with a
   `claim_` prefix.

### Tool arguments are not available

1. **Check request format:** Ensure that tool arguments are correctly specified
   in the request.
2. **Use correct prefix:** Remember that tool arguments are available with an
   `arg_` prefix.
3. **Verify argument names:** Confirm that the argument names in your policies
   match those in the actual requests.

## Related information

- For the conceptual overview, see
  [Authentication and authorization framework](./auth-framework.md)
- For detailed Cedar policy syntax, see
  [Cedar documentation](https://docs.cedarpolicy.com/)
