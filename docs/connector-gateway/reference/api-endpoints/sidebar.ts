import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "connector-gateway/reference/api-endpoints/connector-gateway-api",
    },
    {
      type: "category",
      label: "UNTAGGED",
      collapsed: true,
      items: [
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/get-my-gateway",
          label: "Get the caller's gateway view",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/list-my-connector-statuses",
          label: "List every connector's upstream connection status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/connect-my-connector",
          label: "Start a connector's upstream connect flow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/get-my-connector-status",
          label: "Get one connector's upstream connection status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/list-connector-tools",
          label: "List a Connector's Tools",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "connector-gateway/reference/api-endpoints/get-my-served-tool-catalogue",
          label: "Get the caller's served tool catalogue",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
