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
          id: "toolhive/reference/api/restart-a-workload",
          label: "Restart a workload",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/api/stop-a-workload",
          label: "Stop a workload",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
