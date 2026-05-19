# Summary of changes

- Added GitHub Copilot CLI to the supported clients table and a new
  "Configuration locations" section in `docs/toolhive/reference/client-compatibility.mdx`
  (`stacklok/toolhive#5287`).
- Added a new "Extract identity from the token response" section in
  `docs/toolhive/guides-k8s/auth-k8s.mdx` covering the `identityFromToken`
  OAuth 2.0 upstream field, with a cross-link tip in
  `docs/toolhive/guides-vmcp/authentication.mdx` (`stacklok/toolhive#5269`,
  `stacklok/toolhive#5222`, `stacklok/toolhive#5285`).
- Added a "Rate limit a VirtualMCPServer" section in
  `docs/toolhive/guides-k8s/rate-limiting.mdx` covering the new
  `spec.config.rateLimiting` field, with prerequisites for Redis session
  storage and OIDC incoming auth (`stacklok/toolhive#5079`).
- Documented the new `--session-ttl` flag in `docs/toolhive/guides-cli/run-mcp-servers.mdx`,
  the `thv vmcp serve` flag reference in `docs/toolhive/guides-vmcp/local-cli.mdx`,
  and the vMCP TTL discussion in
  `docs/toolhive/guides-vmcp/scaling-and-performance.mdx`
  (`stacklok/toolhive#5117`).
- Added a "How do I disable update checks?" FAQ entry covering the new
  `TOOLHIVE_SKIP_UPDATE_CHECK` environment variable in
  `docs/toolhive/faq.mdx` (`stacklok/toolhive#5264`).
