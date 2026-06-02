# Summary of changes

- Added `primaryUpstreamProvider` documentation (new
  `spec.authServerConfig.primaryUpstreamProvider` field on `VirtualMCPServer`)
  in `docs/toolhive/guides-vmcp/authentication.mdx`, including the deprecation
  notice for the previous `spec.incomingAuth.authzConfig.inline.primaryUpstreamProvider`
  location (stacklok/toolhive#5290).
- Added the `group_entity_type` (Kubernetes `groupEntityType`) Cedar config
  field with a worked transitive-policy example in
  `docs/toolhive/concepts/cedar-policies.mdx` and
  `docs/toolhive/reference/authz-policy-reference.mdx`. Documents the enterprise
  `ClaimGroup in PlatformRole` pattern that motivated stacklok/toolhive#5290.
- Updated `entities_json` description in `docs/toolhive/concepts/cedar-policies.mdx`
  to call out the `"[]"` default and its role for transitive policies.
- Added a Kubernetes-troubleshooting note for `AuthzConfigMapNotFound` and
  `AuthzConfigMapInvalid` condition reasons on the `AuthConfigured` condition
  in `docs/toolhive/guides-k8s/auth-k8s.mdx`.
- Added a troubleshooting note for `ExternalAuthConfigValidated=False` mirrored
  onto consumer CRs (`MCPServer`/`MCPRemoteProxy`/`VirtualMCPServer`) from the
  source `MCPExternalAuthConfig` in `docs/toolhive/guides-k8s/auth-k8s.mdx`
  (stacklok/toolhive#5354).
