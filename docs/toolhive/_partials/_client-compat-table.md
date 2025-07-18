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
| ChatGPT Desktop            |    ❌     |         ❌         | See [workaround for STDIO-only clients][4]           |
| Claude Desktop             |    ❌     |         ❌         | See [workaround for STDIO-only clients][4]           |
| Kiro                       |    ❌     |         ❌         | See [workaround for STDIO-only clients][4]           |

[2]: https://github.com/cline/cline/issues/4391
[3]: /toolhive/reference/client-compatibility.mdx#vs-code-with-copilot
[4]: /toolhive/reference/client-compatibility#stdio-only-client-configuration
