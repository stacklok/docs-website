import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "ai-gateway/reference/api-endpoints/ai-gateway-management-api",
    },
    {
      type: "category",
      label: "Catalog",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "ai-gateway/reference/api-endpoints/get-info",
          label: "Return the owning gateway's identity.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "ai-gateway/reference/api-endpoints/list-mcp-servers",
          label: "List all MCP servers visible to the gateway.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "ai-gateway/reference/api-endpoints/list-models",
          label: "List the models the calling user may use.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Introspection",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "ai-gateway/reference/api-endpoints/get-me",
          label: "Return the caller's identity and resolved management roles.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
