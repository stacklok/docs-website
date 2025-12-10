import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "toolhive/reference/api/toolhive-api",
    },
    {
      type: "category",
      label: "system",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/get-open-api-specification",
          label: "Get OpenAPI specification",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/health-check",
          label: "Health check",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "clients",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/list-all-clients",
          label: "List all clients",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/register-a-new-client",
          label: "Register a new client",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/unregister-a-client",
          label: "Unregister a client",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/unregister-a-client-from-a-specific-group",
          label: "Unregister a client from a specific group",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/register-multiple-clients",
          label: "Register multiple clients",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/unregister-multiple-clients",
          label: "Unregister multiple clients",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "discovery",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/list-all-clients-status",
          label: "List all clients status",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "groups",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/list-all-groups",
          label: "List all groups",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/create-a-new-group",
          label: "Create a new group",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/delete-a-group",
          label: "Delete a group",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-group-details",
          label: "Get group details",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "registry",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/list-registries",
          label: "List registries",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/add-a-registry",
          label: "Add a registry",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/remove-a-registry",
          label: "Remove a registry",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-a-registry",
          label: "Get a registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/update-registry-configuration",
          label: "Update registry configuration",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/list-servers-in-a-registry",
          label: "List servers in a registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-a-server-from-a-registry",
          label: "Get a server from a registry",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "secrets",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/setup-or-reconfigure-secrets-provider",
          label: "Setup or reconfigure secrets provider",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-secrets-provider-details",
          label: "Get secrets provider details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/list-secrets",
          label: "List secrets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/create-a-new-secret",
          label: "Create a new secret",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/delete-a-secret",
          label: "Delete a secret",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/update-a-secret",
          label: "Update a secret",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "version",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/get-server-version",
          label: "Get server version",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "workloads",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/list-all-workloads",
          label: "List all workloads",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/create-a-new-workload",
          label: "Create a new workload",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/delete-a-workload",
          label: "Delete a workload",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-workload-details",
          label: "Get workload details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/update-workload",
          label: "Update workload",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/export-workload-configuration",
          label: "Export workload configuration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/restart-a-workload",
          label: "Restart a workload",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-workload-status",
          label: "Get workload status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/stop-a-workload",
          label: "Stop a workload",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/delete-workloads-in-bulk",
          label: "Delete workloads in bulk",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/restart-workloads-in-bulk",
          label: "Restart workloads in bulk",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/stop-workloads-in-bulk",
          label: "Stop workloads in bulk",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "logs",
      items: [
        {
          type: "doc",
          id: "toolhive/reference/api/get-logs-for-a-specific-workload",
          label: "Get logs for a specific workload",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/get-proxy-logs-for-a-specific-workload",
          label: "Get proxy logs for a specific workload",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
