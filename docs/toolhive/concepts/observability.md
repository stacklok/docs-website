---
title: Observability
description:
  Understanding ToolHive's observability features for MCP server monitoring
---

ToolHive provides comprehensive observability for your MCP server interactions
through built-in OpenTelemetry instrumentation. You get complete visibility into
how your MCP servers perform, including detailed traces, metrics, and error
tracking.

## How telemetry works

ToolHive automatically instruments your MCP server interactions without
requiring changes to your servers. When you enable telemetry, ToolHive captures
detailed information about every request, tool call, and server interaction.

ToolHive's telemetry captures rich, protocol-aware information because it
understands MCP operations. You get detailed traces showing tool calls, resource
access, and prompt operations rather than generic HTTP requests.

## Distributed tracing

Distributed tracing shows you the complete journey of each request through your
MCP servers. ToolHive creates comprehensive traces that provide end-to-end
visibility across the proxy-container boundary.

### Trace structure

Here's what a trace looks like when a client calls a tool in the GitHub MCP
server (some fields omitted for brevity):

```text
Span: mcp.tools/call (150ms)
├── service.name: toolhive-mcp-proxy
├── service.version: v0.1.9
├── http.duration_ms: 150.3
├── http.host: localhost:14972
├── http.method: POST
├── http.request_content_length: 256
├── http.response_content_length: 1024
├── http.status_code: 202
├── http.url: /messages?session_id=b1d22d07-b35f-4260-9c0c-b872f92f64b1
├── http.user_agent: claude-code/1.0.53
├── mcp.method: tools/call
├── mcp.request.id: 5
├── mcp.server.name: github
├── mcp.tool.arguments: owner=stacklok, repo=toolhive, pullNumber=1131
├── mcp.tool.name: create_issue
└── mcp.transport: stdio
```

### MCP-specific traces

ToolHive automatically captures traces for all MCP operations, including:

- **Tool calls** (`mcp.tools/call`) - When AI assistants use tools
- **Resource access** (`mcp.resources/read`) - When servers read files or data
- **Prompt operations** (`mcp.prompts/get`) - When servers retrieve prompts
- **Connection events** (`mcp.initialize`) - When clients connect to servers

### Trace attributes

Each trace includes detailed context across three layers:

#### Service information

```text
service.name: toolhive-mcp-proxy
service.version: v0.1.9
```

#### HTTP layer information

```text
http.duration_ms: 150.3
http.host: localhost:14972
http.method: POST
http.request_content_length: 256
http.response_content_length: 1024
http.status_code: 202
http.url: /messages?session_id=b1d22d07-b35f-4260-9c0c-b872f92f64b1
http.user_agent: claude-code/1.0.53
```

#### MCP protocol details

Details about the MCP operation being performed (some fields are specific to
each operation):

```text
mcp.client.name: claude-code
mcp.method: tools/call
mcp.request.id: 123
mcp.server.name: github
mcp.tool.arguments: owner=stacklok, repo=toolhive, path=pkg/telemetry/middleware.go, start_index=130, max_length=1000
mcp.tool.name: get_file_contents
mcp.transport: stdio
rpc.service: mcp
rpc.system: jsonrpc
```

#### Method-specific attributes

- **`mcp.tools/call`** traces include:
  - `mcp.tool.name` - The name of the tool being called
  - `mcp.tool.arguments` - Sanitized tool arguments (sensitive values redacted)

- **`mcp.resources/read`** traces include:
  - `mcp.resource.uri` - The URI of the resource being accessed

- **`mcp.prompts/get`** traces include:
  - `mcp.prompt.name` - The name of the prompt being retrieved

- **`mcp.initialize`** traces include:
  - `mcp.client.name` - The name of the connecting client

## Metrics collection

ToolHive automatically collects metrics about your MCP server usage and
performance. These metrics help you understand usage patterns, performance
characteristics, and identify potential issues.

### Metric labels

All metrics include consistent labels for filtering and aggregation:

- `server` - MCP server name (e.g., `fetch`, `github`)
- `transport` - Backend transport type (`stdio`, `sse`, or `streamable-http`)
- `method` - HTTP method (`POST`, `GET`)
- `mcp_method` - MCP protocol method (e.g., `tools/call`, `resources/read`)
- `status` - Request outcome (`success` or `error`)
- `status_code` - HTTP status code (`200`, `400`, `500`)
- `tool` - Tool name for tool-specific metrics

### Key metrics

Example metrics from the Prometheus `/metrics` endpoint are shown below (some
fields are omitted for brevity):

#### Request metrics

```promql
# HELP toolhive_mcp_requests_total Total number of MCP requests
# TYPE toolhive_mcp_requests_total counter
toolhive_mcp_requests_total{mcp_method="tools/list",method="POST",server="github",status="success",status_code="202",transport="stdio"} 2

# HELP toolhive_mcp_request_duration_seconds Duration of MCP requests in seconds
# TYPE toolhive_mcp_request_duration_seconds histogram
toolhive_mcp_request_duration_seconds_bucket{mcp_method="tools/list",method="POST",server="github",status="success",status_code="202",transport="stdio",le="10000"} 2
toolhive_mcp_request_duration_seconds_bucket{mcp_method="tools/list",method="POST",server="github",status="success",status_code="202",transport="stdio",le="+Inf"} 2
toolhive_mcp_request_duration_seconds_sum{mcp_method="tools/list",method="POST",server="github",status="success",status_code="202",transport="stdio"} 0.000219416
toolhive_mcp_request_duration_seconds_count{mcp_method="tools/list",method="POST",server="github",status="success",status_code="202",transport="stdio"} 2
```

#### Connection metrics

```promql
# HELP toolhive_mcp_active_connections Number of active MCP connections
# TYPE toolhive_mcp_active_connections gauge
toolhive_mcp_active_connections{connection_type="sse",server="github",transport="stdio"} 3
```

#### Tool-specific metrics

```promql
# HELP toolhive_mcp_tool_calls_total Total number of MCP tool calls
# TYPE toolhive_mcp_tool_calls_total counter
toolhive_mcp_tool_calls_total{server="github",status="success",tool="get_file_contents"} 15
toolhive_mcp_tool_calls_total{server="github",status="success",tool="list_pull_requests"} 4
toolhive_mcp_tool_calls_total{server="github",status="success",tool="search_issues"} 2
```

## Export options

ToolHive supports multiple export formats to integrate with your existing
observability infrastructure.

### OTLP export

ToolHive supports OpenTelemetry Protocol (OTLP) export for both traces and
metrics to any compatible backend, either directly or via a collector
application.

The [OpenTelemetry ecosystem](https://opentelemetry.io/ecosystem/vendors/)
includes a wide range of observability backends including open source solutions
like Jaeger, self-hosted solutions like Splunk, and SaaS solutions like Datadog,
New Relic, and Honeycomb.

### Prometheus export

ToolHive can expose Prometheus-style metrics at a `/metrics` endpoint, enabling:

- **Direct scraping** by Prometheus servers
- **Service discovery** in Kubernetes environments
- **Integration** with existing Prometheus-based monitoring stacks

### Dual export

Both OTLP and Prometheus can be enabled simultaneously, allowing you to:

- Send traces to specialized tracing backends
- Expose metrics for Prometheus scraping
- Maintain compatibility with existing monitoring infrastructure

## Data sanitization

ToolHive automatically protects sensitive information in traces:

- **Sensitive arguments**: Tool arguments containing passwords, tokens, or keys
  are redacted
- **Sensitive key detection**: Arguments with keys containing patterns like
  "password", "token", "secret", "key", "auth", or "credential" are redacted
- **Argument truncation**: Long arguments are truncated to prevent excessive
  trace size

For example, a tool call with sensitive arguments:

```text
mcp.tool.arguments: password=secret123, api_key=abc456, title=Bug report
```

Is sanitized in the trace as:

```text
mcp.tool.arguments: password=[REDACTED], api_key=[REDACTED], title=Bug report
```

## Monitoring examples

These examples show how ToolHive's observability works in practice.

### Tool call monitoring

When a client calls the `create_issue` tool:

**Request**:

```json
{
  "jsonrpc": "2.0",
  "id": "req_456",
  "method": "tools/call",
  "params": {
    "name": "create_issue",
    "arguments": {
      "title": "Bug report",
      "body": "Found an issue with the API"
    }
  }
}
```

**Generated trace**:

```text
Span: mcp.tools/call
├── mcp.method: tools/call
├── mcp.request.id: req_456
├── mcp.tool.name: create_issue
├── mcp.tool.arguments: title=Bug report, body=Found an issue with the API
├── mcp.server.name: github
├── mcp.transport: sse
├── http.method: POST
├── http.status_code: 200
└── duration: 850ms
```

**Generated metrics**:

```promql
toolhive_mcp_requests_total{mcp_method="tools/call",server="github",status="success"} 1
toolhive_mcp_request_duration_seconds{mcp_method="tools/call",server="github"} 0.85
toolhive_mcp_tool_calls_total{server="github",tool="create_issue",status="success"} 1
```

### Error tracking

Failed requests generate error traces and metrics:

**Error trace**:

```text
Span: mcp.tools/call
├── mcp.method: tools/call
├── mcp.tool.name: invalid_tool
├── http.status_code: 400
├── span.status: ERROR
├── span.status_message: Tool not found
└── duration: 12ms
```

**Error metrics**:

```promql
toolhive_mcp_requests_total{mcp_method="tools/call",server="github",status="error",status_code="400"} 1
toolhive_mcp_tool_calls_total{server="github",tool="invalid_tool",status="error"} 1
```

## Key performance indicators

Monitor these key metrics for optimal MCP server performance:

1. **Request rate**: `rate(toolhive_mcp_requests_total[5m])`
2. **Error rate**: `rate(toolhive_mcp_requests_total{status="error"}[5m])`
3. **Response time**:
   `histogram_quantile(0.95, toolhive_mcp_request_duration_seconds_bucket)`
4. **Active connections**: `toolhive_mcp_active_connections`

## Setting up dashboards and alerts

This section shows practical examples of integrating ToolHive's observability
data with common monitoring tools.

### Prometheus integration

Configure Prometheus to scrape ToolHive metrics:

```yaml title="prometheus.yml"
scrape_configs:
  - job_name: 'toolhive-mcp-proxy'
    static_configs:
      - targets: [
        'localhost:43832',  # Example MCP server
        'localhost:51712'   # Example MCP server
      ]
    scrape_interval: 15s
    metrics_path: /metrics
```

### Grafana dashboard queries

Example queries for monitoring dashboards:

```promql
# Request rate by server
sum(rate(toolhive_mcp_requests_total[5m])) by (server)

# Error rate percentage
sum(rate(toolhive_mcp_requests_total{status="error"}[5m])) by (server) /
sum(rate(toolhive_mcp_requests_total[5m])) by (server) * 100

# Response time percentiles
histogram_quantile(0.95, sum(rate(toolhive_mcp_request_duration_seconds_bucket[5m])) by (le, server))

# Tool usage distribution
sum(rate(toolhive_mcp_tool_calls_total[5m])) by (tool, server)

# Active connections
toolhive_mcp_active_connections
```

### Alerting rules

Example Prometheus alerting rules:

```yaml title="prometheus.yml"
groups:
  - name: toolhive-mcp-proxy
    rules:
      - alert: HighErrorRate
        expr: rate(toolhive_mcp_requests_total{status="error"}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: 'High error rate in MCP proxy'
          description: 'Error rate is {{ $value }} errors per second'

      - alert: HighResponseTime
        expr:
          histogram_quantile(0.95, toolhive_mcp_request_duration_seconds_bucket)
          > 2.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High response time in MCP proxy'
          description: '95th percentile response time is {{ $value }}s'

      - alert: ProxyDown
        expr: up{job="toolhive-mcp-proxy"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'MCP proxy is down'
          description: 'ToolHive MCP proxy has been down for more than 1 minute'
```

## Recommendations

### Production deployment

1. Use appropriate sampling rates (1-10% for high-traffic systems)
2. Configure authentication for OTLP endpoints
3. Use HTTPS transport in production
4. Monitor telemetry overhead with metrics
5. Set up alerting on key performance indicators

### Development and testing

1. Use 100% sampling for complete visibility
2. Enable local backends (Jaeger, Prometheus)
3. Test with realistic workloads to validate metrics
4. Verify trace correlation across service boundaries

### Cost optimization

1. Tune sampling rates based on traffic patterns
2. Use head-based sampling for consistent trace collection
3. Monitor backend costs and adjust accordingly
4. Filter out health check requests if not needed

## Next steps

Now that you understand how ToolHive's observability works, you can:

1. **Choose a monitoring backend** that fits your needs and budget
2. **Enable telemetry** when running your servers:
   - [using the ToolHive CLI](../guides-cli/telemetry-and-metrics.md)
   - using the Kubernetes operator (not yet supported -
     [contributions welcome](https://github.com/stacklok/toolhive/releases/tag/v0.2.0))
3. **Set up basic dashboards** to track request rates, error rates, and response
   times
4. **Configure alerts** for critical issues

The telemetry system works automatically once enabled, providing immediate
insights into your MCP server performance and usage patterns.
