| Client                     | Supported | Auto-configuration | Notes                                                |
| -------------------------- | :-------: | :----------------: | ---------------------------------------------------- |
| GitHub Copilot (VS Code)   |    ✅     |         ✅         | v1.100+ or Insiders version (v1.102+, [see note][3]) |
| Cursor                     |    ✅     |         ✅         | v0.50.0+                                             |
| Roo Code (VS Code)         |    ✅     |         ✅         | v3.19.2+                                             |
| Cline (VS Code)            |    ✅     |         ✅         | v3.8.5+ (sse only; streamable-http [issue][2])       |
| Claude Code CLI            |    ✅     |         ✅         | v1.0.27+                                             |
| GitHub Copilot (JetBrains) |    ✅     |         ❌         | v1.5.47+                                             |
| Continue (VS Code)         |    ✅     |         ❌         | v1.0.14+                                             |
| Continue (JetBrains)       |    ✅     |         ❌         | v1.0.23+                                             |
| PydanticAI                 |    ✅     |         ❌         | v0.2.18+                                             |
| ChatGPT Desktop            |    ❌     |         ❌         | No support for HTTP/SSE MCPs                         |
| Claude Desktop             |    ❌     |         ❌         | No support for HTTP/SSE MCPs ([issue][1])            |

[1]: https://github.com/orgs/modelcontextprotocol/discussions/16
[2]: https://github.com/cline/cline/issues/4391
[3]: /toolhive/reference/client-compatibility.mdx#vs-code-with-copilot
