- Added AI-tool plugins guide at `docs/toolhive/guides-cli/ai-plugins.mdx` for
  the new `thv ai-plugin` surface (build, validate, push, install, list, info,
  uninstall, builds), including the manifest format, Claude Code / Codex
  install paths, and troubleshooting.
- Added a sidebar entry for the new AI-tool plugins guide in `sidebars.ts`.
- Updated `docs/toolhive/guides-cli/skills-management.mdx` with three new
  sections covering the experimental lock file: pin-and-reconcile with
  `thv skill sync`, upgrades with `thv skill upgrade`, and Sigstore signature
  verification (`--allow-unsigned`, `--allow-signer-change`, coverage
  differences between OCI and Git installs). Added a matching troubleshooting
  entry.
- Added "Ordering with Cedar authorization and audit" to
  `docs/toolhive/guides-cli/webhooks.mdx` documenting that Cedar policies,
  audit events, telemetry, and usage metrics see the post-mutation request,
  plus the new 400/500 fail-closed responses and the tool-filter and header
  gaps to be aware of.
- Swept the removed config-CRD status fields
  (`status.referencingWorkloads`, `status.referenceCount`, and the
  `REFERENCES` printer column) out of three K8s guides and the
  `MCPAuthzConfig` CRD intro, replacing them with workload-side `jq` queries
  where a "which workloads reference this?" pattern was needed. Updated the
  CRD intro at the source (`scripts/lib/crd-intros.mjs`) and synced the
  generated `mcpauthzconfig.mdx`.
- Added a v0.42.0 removal note to the `referencingServers` /
  `referencingWorkloads` section of `docs/toolhive/guides-k8s/migrate-to-v1beta1.mdx`
  so readers of that migration guide learn that both fields are now gone and
  see the current workload-query pattern.
