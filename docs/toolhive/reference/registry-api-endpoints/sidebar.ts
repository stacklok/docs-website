import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "toolhive/reference/registry-api-endpoints/toolhive-registry-api",
    },
    {
      type: "category",
      label: "system",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/open-api-specification",
          label: "OpenAPI specification",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "registry",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-servers-in-specific-registry",
          label: "List servers in specific registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-all-versions-of-an-mcp-server-in-specific-registry",
          label: "List all versions of an MCP server in specific registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-specific-mcp-server-version-in-specific-registry",
          label: "Get specific MCP server version in specific registry",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "plugins",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-plugins-in-registry",
          label: "List plugins in registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-latest-plugin-version",
          label: "Get latest plugin version",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-plugin-versions",
          label: "List plugin versions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-specific-plugin-version",
          label: "Get specific plugin version",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "skills",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-skills-in-registry",
          label: "List skills in registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-latest-skill-version",
          label: "Get latest skill version",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-skill-versions",
          label: "List skill versions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-specific-skill-version",
          label: "Get specific skill version",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "v1",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/publish-entry",
          label: "Publish entry",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-entry-claims",
          label: "Get entry claims",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/update-entry-claims",
          label: "Update entry claims",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/delete-published-entry",
          label: "Delete published entry",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-current-user-info",
          label: "Get current user info",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-registries",
          label: "List registries",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/delete-registry",
          label: "Delete registry",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-registry",
          label: "Get registry",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/create-or-update-registry",
          label: "Create or update registry",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-registry-entries",
          label: "List registry entries",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-sources",
          label: "List sources",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/delete-source",
          label: "Delete source",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/get-source",
          label: "Get source",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/create-or-update-source",
          label: "Create or update source",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "toolhive/reference/registry-api-endpoints/list-source-entries",
          label: "List source entries",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
