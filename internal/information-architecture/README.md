# ToolHive information architecture pilot

Status: vMCP pilot implemented; wider navigation remains proposed. Assessment
baseline: `main` at `d1a0cee16cfbec7e1a59f6be2e2291590d859627` on November
17, 2026.

Start with one complete journey: combine MCP servers behind a Virtual MCP Server
(vMCP) endpoint and use a tool through a connected client. Give readers one
explanation of vMCP, an early choice between local and Kubernetes setup, and an
observable result at the end of either path.

This document proposes a change to the component-based navigation described in
[AGENTS.md](../../AGENTS.md). It records the target structure and the bounded
first implementation. The current authoring policy remains the baseline for work
outside this pilot; update it alongside adoption of the new structure.

## Assessment baseline

The current [sidebar](../../sidebars.ts) organizes ToolHive around the UI, CLI,
Kubernetes Operator, vMCP, and Registry Server. It provides familiar entry
points for readers who know which component they need. Shared material sits in a
separate Resources sidebar, reached through a separate
[navbar item](../../docusaurus.config.ts).

All 23 authored Resources pages belong to ToolHive. Returning them to ToolHive
would make their product ownership clear. Stacklok Platform, AI Gateway, and
Connector Gateway have their own documentation; this proposal concerns the
ToolHive section and its Resources content.

The first journey has concrete gaps:

| Evidence                                                                                                                                                                        | Reader consequence                                                                    | Pilot response                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| The [vMCP index](../../docs/toolhive/guides-vmcp/index.mdx), introduction, and [concept](../../docs/toolhive/concepts/vmcp.mdx) repeat purpose, capabilities, and fit guidance. | Readers have to infer whether these are prerequisites or alternative explanations.    | Give explanation one home and make the index a task router.                |
| Local setup is the last vMCP sidebar entry; the quickstart is Kubernetes-specific.                                                                                              | A reader evaluating aggregation encounters cluster deployment first.                  | Present local and Kubernetes paths together at entry.                      |
| Quickstart verification checks backend status and `/health`, then asks readers to try questions in an assistant.                                                                | A healthy process can be mistaken for a verified tool connection.                     | List aggregated tools and execute a named tool with an expected result.    |
| Quickstart cleanup deletes cluster resources after registering a local ToolHive connection.                                                                                     | Readers lack instructions for removing that connection and stopping the port-forward. | Account for all resources and foreground processes created in the lesson.  |
| The local guide calls the Kubernetes configuration guide the "full schema."                                                                                                     | Readers can confuse runtime YAML with the Kubernetes resource configuration.          | Identify the configuration format and link to its authoritative reference. |

Orientation and setup pages were read in detail. The remaining vMCP pages and
Resources pages were inventoried by purpose and structure. Their dispositions
below are planning decisions, not a completed technical audit. Product claims
and executable examples still need source and runtime verification when edited.

## Structural options

Each option can be implemented independently. The trade-offs concern ongoing
content ownership as well as navigation labels.

| Direction                                                                           | Advantages                                                                                                                                       | Costs and limitations                                                                                                                                      | Assessment                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Retain component sections; bring Resources into ToolHive and improve cross-links.   | Lowest disruption; familiar to existing readers; clear ownership of component-specific procedures.                                               | Readers still need to select a component before understanding the task; repeated capability explanations need separate editorial cleanup.                  | Useful interim improvement, with limited effect on the underlying task journey. |
| Organize ToolHive by reader tasks; keep component choices inside each task.         | Starts with the desired outcome; shared explanations have a clear home; local and cluster alternatives can be compared where the choice matters. | Broad tasks can become oversized categories; local and operator procedures need explicit applicability; requires careful migration and findability checks. | Recommended target, tested through the vMCP pilot before wider rollout.         |
| Separate audience paths, such as individual developers and platform operators.      | Makes prerequisites and responsibilities visible early; supports different onboarding needs.                                                     | The same person can occupy both roles; publishing and consumption overlap; maintaining parallel paths can reproduce shared content.                        | Use audience cues in entry pages and prerequisites; avoid parallel manuals.     |
| Organize the whole section by tutorials, how-to guides, explanation, and reference. | Page purpose is explicit; supports editorial discipline and reference lookup.                                                                    | Readers must translate their task into a document type; one journey crosses several navigation branches.                                                   | Use Diataxis to govern page purpose within the task structure.                  |

## Proposed ToolHive navigation

These are groups within the ToolHive section. The tree sketches content
ownership and discoverable tasks, rather than prescribing a new file tree or
requiring a new page for every label.

```text
ToolHive
├── Start here
│   ├── Choose your setup
│   ├── Run your first MCP server: UI or CLI
│   └── Start on Kubernetes
├── Use servers and skills
│   ├── Find and run MCP servers
│   ├── Connect your client
│   ├── Manage local servers, groups, and permissions
│   ├── Install and manage skills and plugins
│   └── MCP server usage guides
├── Deploy and operate
│   ├── Deploy the Kubernetes Operator and workloads
│   ├── Combine servers with vMCP
│   │   ├── Run locally
│   │   ├── Quickstart on Kubernetes
│   │   └── Configure an existing deployment
│   ├── Publish endpoints
│   ├── Secure access and manage secrets
│   ├── Collect telemetry and audit activity
│   ├── Handle failures and scale
│   └── Optimize and compose tools
├── Publish and share
│   ├── Build and test servers and skills
│   ├── Curate a custom catalog
│   ├── Deploy and manage the Registry Server
│   └── Contribute to the catalog
├── Understand ToolHive
│   ├── MCP, skills, and groups
│   ├── Aggregation with vMCP
│   ├── Authentication and authorization
│   ├── Backend identity and embedded authorization
│   └── Observability and tool optimization
├── Reference
│   └── CLI, API, CRD, Helm, schema, and compatibility references
└── Help
    ├── FAQ and support
    └── Contribute to ToolHive
```

"Publish endpoints" owns network reachability and exposing a running service.
"Publish and share" owns distributing servers, skills, and catalog entries. Test
this distinction with readers; rename the endpoint task if they confuse the two.
Local vMCP also needs an entry link from local server management so evaluation
remains easy to find under Use servers and skills.

Keep component names in task titles, applicability statements, search metadata,
and reference groups. Each page has one primary navigation home; links from
other journeys provide secondary discovery. Generated references keep their
existing files and generation paths, with contextual links from task pages.

## Content ownership

Shared capability explanations own the mental model, terminology, supported
patterns, and trade-offs. Procedures include enough immediate context to
complete their task, then link to the explanation for deeper reading.

Keep local CLI runtime configuration and Kubernetes CRD configuration distinct.
Likewise, client authentication, authorization, backend credentials, delegated
identity, and provider-specific registration have different purposes. Shared
terminology alone is insufficient reason to merge their procedures.

Tutorials own a guided example through verification and cleanup. How-to guides
own adapting an existing setup to a specific outcome. Reference owns exact
fields, defaults, and constraints. Moving duplicate prose into a new category
without resolving its ownership would leave the maintenance problem intact.

## Resources destinations

Every authored page in the baseline Resources sidebar appears below.
Destinations are primary navigation homes. Retain existing paths and URLs unless
a later consolidation requires a move; a navigation change alone needs no
redirect.

| Current page                                                                              | Proposed home within ToolHive                                             | Disposition                                                                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [MCP primer](../../docs/toolhive/concepts/mcp-primer.mdx)                                 | Understand ToolHive / MCP                                                 | Keep the explanation; link from Start here.                                                                                       |
| [Groups](../../docs/toolhive/concepts/groups.mdx)                                         | Understand ToolHive / Groups                                              | Keep shared meaning here; local and Kubernetes procedures own implementation details.                                             |
| [Tool optimization](../../docs/toolhive/concepts/tool-optimization.mdx)                   | Understand ToolHive / Tool optimization                                   | Own the filtering and override model; link to applicable procedures.                                                              |
| [Registry criteria](../../docs/toolhive/concepts/registry-criteria.mdx)                   | Publish and share / Contribute to the catalog                             | Treat as contribution criteria, with links from catalog submission instructions.                                                  |
| [Observability](../../docs/toolhive/concepts/observability.mdx)                           | Understand ToolHive / Observability                                       | Keep the model; assess setup, dashboard recipes, and metric definitions for procedure/reference ownership in the telemetry pilot. |
| [Authentication and authorization](../../docs/toolhive/concepts/auth-framework.mdx)       | Understand ToolHive / Authentication and authorization                    | Canonical shared model; retain distinct setup procedures.                                                                         |
| [Cedar policies](../../docs/toolhive/concepts/cedar-policies.mdx)                         | Deploy and operate / Secure access / Write policies                       | Scope around writing and testing policies; consolidate exact semantics with the existing policy reference when audited.           |
| [Backend authentication](../../docs/toolhive/concepts/backend-auth.mdx)                   | Understand ToolHive / Backend identity                                    | Own pattern selection and identity boundaries; link to component setup.                                                           |
| [Embedded authorization server](../../docs/toolhive/concepts/embedded-auth-server.mdx)    | Understand ToolHive / Embedded authorization                              | Keep the OAuth and session model; assess embedded setup sections for consolidation with component guides.                         |
| [vMCP](../../docs/toolhive/concepts/vmcp.mdx)                                             | Understand ToolHive / Aggregation with vMCP                               | Canonical vMCP explanation in the first pilot.                                                                                    |
| [Skills](../../docs/toolhive/concepts/skills.mdx)                                         | Understand ToolHive / Skills                                              | Keep the explanation; link from installing and publishing skills.                                                                 |
| [OpenTelemetry](../../docs/toolhive/integrations/opentelemetry.mdx)                       | Deploy and operate / Collect telemetry                                    | Keep a worked collection path; assess common collector setup and workload details in the telemetry pilot.                         |
| [Vault](../../docs/toolhive/integrations/vault.mdx)                                       | Deploy and operate / Manage secrets                                       | Keep the Kubernetes-specific procedure explicit.                                                                                  |
| [AWS STS](../../docs/toolhive/integrations/aws-sts.mdx)                                   | Deploy and operate / Secure access / AWS backend credentials              | Preserve its federation and remote-proxy procedure.                                                                               |
| [ngrok ingress](../../docs/toolhive/integrations/ingress-ngrok.mdx)                       | Deploy and operate / Publish endpoints                                    | Own an operator's endpoint publication task; link onward to client connection.                                                    |
| [Okta role-based authorization](../../docs/toolhive/integrations/okta.mdx)                | Deploy and operate / Secure access / Authorize a single server            | Preserve direct OIDC validation and Cedar verification as a distinct path.                                                        |
| [vMCP identity provider overview](../../docs/toolhive/integrations/vmcp-idp-overview.mdx) | Deploy and operate / Secure access / Connect an identity provider to vMCP | Keep provider selection and prerequisites; distinguish the embedded authorization server path from direct validation.             |
| [vMCP with Entra ID](../../docs/toolhive/integrations/vmcp-entra-id.mdx)                  | Deploy and operate / Secure access / Entra ID with vMCP                   | Keep provider-specific app registration, claims, and deployment steps.                                                            |
| [vMCP with Okta](../../docs/toolhive/integrations/vmcp-okta.mdx)                          | Deploy and operate / Secure access / Okta with vMCP                       | Keep provider-specific app registration, claims, and deployment steps.                                                            |
| [Custom registry tutorial](../../docs/toolhive/tutorials/custom-registry.mdx)             | Publish and share / Curate a custom catalog                               | Retain guided learning; make the distinction from deploying a Registry Server explicit.                                           |
| [Optimizer tutorial](../../docs/toolhive/tutorials/mcp-optimizer.mdx)                     | Deploy and operate / Optimize tools                                       | Keep the Kubernetes lesson; provide a contextual link to local optimization.                                                      |
| [FAQ](../../docs/toolhive/faq.mdx)                                                        | Help / FAQ                                                                | Re-home within ToolHive navigation.                                                                                               |
| [Support](../../docs/toolhive/support.mdx)                                                | Help / Support                                                            | Re-home within ToolHive navigation.                                                                                               |

Resources also owns three generated index routes: `/toolhive/concepts`,
`/toolhive/integrations`, and `/toolhive/tutorials`. Preserve those routes
during staging. When retiring their sidebar categories, retain useful authored
indexes at those URLs or redirect each to a relevant replacement. Keep
integration discovery through the task groups and links; record the exact index
destinations in the full Resources migration before removing its navbar item.

## vMCP page dispositions

This ledger covers all 18 authored guide pages and the shared concept page.
"First" identifies the initial implementation; "later" preserves the page while
recording its intended ownership. A future navigation destination does not by
itself require rewriting the page.

| Current page                                                                                   | Decision and owned reader need                                                                                                                                                                                                  | Timing                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [Index](../../docs/toolhive/guides-vmcp/index.mdx)                                             | Keep as a short router: understand vMCP, run locally, start on Kubernetes, or adapt an existing deployment. Replace the repeated capability introduction and indiscriminate card list with a few explicit routes.               | First                      |
| Introduction (retired)                                                                         | Merge unique architecture, backend-resource relationships, and deployment trade-offs into the concept page; retire with a permanent redirect.                                                                                   | First                      |
| [Concept](../../docs/toolhive/concepts/vmcp.mdx)                                               | Keep as the sole full explanation. Cover purpose, fit by need, architecture, and local/Kubernetes differences. Verify claims before retaining examples.                                                                         | First                      |
| [Quickstart](../../docs/toolhive/guides-vmcp/quickstart.mdx)                                   | Keep the Kubernetes tutorial. Complete prerequisites, tool-level verification, client connection, and cleanup; limit Next steps to 1-3 actions.                                                                                 | First                      |
| [Local CLI](../../docs/toolhive/guides-vmcp/local-cli.mdx)                                     | Keep the local procedure. Establish a reproducible group, client connection, verification, process lifetime, and cleanup. Keep advanced customization subordinate and link to generated command reference for exhaustive flags. | First                      |
| [Configuration](../../docs/toolhive/guides-vmcp/configuration.mdx)                             | Keep the Kubernetes adaptation guide. Clarify applicability and replace the retired intro link. Preserve current configuration semantics; broader restructuring can follow.                                                     | First, limited             |
| [Backend discovery](../../docs/toolhive/guides-vmcp/backend-discovery.mdx)                     | Keep under Deploy and operate / Combine servers. Own selecting, configuring, and diagnosing backend discovery.                                                                                                                  | Later                      |
| [Authentication](../../docs/toolhive/guides-vmcp/authentication.mdx)                           | Keep under Secure access. Own the vMCP client and backend setup paths; shared explanations provide the model.                                                                                                                   | Later                      |
| [Embedded authorization server](../../docs/toolhive/guides-vmcp/embedded-auth-server-vmcp.mdx) | Keep the vMCP-specific setup, registration, session, and TLS procedures. Evaluate page scope separately.                                                                                                                        | Later                      |
| [Delegate agent identity](../../docs/toolhive/guides-vmcp/delegate-agent-identity.mdx)         | Keep the token-exchange, consent, delegate authentication, and SPIFFE procedures under Secure access.                                                                                                                           | Later                      |
| [Accept workload assertions](../../docs/toolhive/guides-vmcp/accept-workload-assertions.mdx)   | Keep as a separate JWT-bearer grant task under Secure access.                                                                                                                                                                   | Later                      |
| [Tool aggregation](../../docs/toolhive/guides-vmcp/tool-aggregation.mdx)                       | Keep under Optimize and compose tools. Own vMCP conflict resolution, visibility, and overrides; preserve distinctions from client-side filtering.                                                                               | Later                      |
| [Composite tools](../../docs/toolhive/guides-vmcp/composite-tools.mdx)                         | Keep under Optimize and compose tools. Assess separation of a worked workflow from the extensive syntax/reference material.                                                                                                     | Later                      |
| [Optimizer](../../docs/toolhive/guides-vmcp/optimizer.mdx)                                     | Keep under Optimize and compose tools. Own setup and tuning; retain explicit local/Kubernetes applicability.                                                                                                                    | Later                      |
| [Code mode](../../docs/toolhive/guides-vmcp/code-mode.mdx)                                     | Keep the server-side execution task and its local/Kubernetes paths under Optimize and compose tools.                                                                                                                            | Later                      |
| [Failure handling](../../docs/toolhive/guides-vmcp/failure-handling.mdx)                       | Keep under Handle failures and scale. Own vMCP failure policy and verification.                                                                                                                                                 | Later                      |
| [Telemetry and metrics](../../docs/toolhive/guides-vmcp/telemetry-and-metrics.mdx)             | Keep under Collect telemetry. Own vMCP instrumentation details; assess shared setup and metric definitions in the telemetry pilot.                                                                                              | Later                      |
| [Audit logging](../../docs/toolhive/guides-vmcp/audit-logging.mdx)                             | Keep under Audit activity. Preserve audit-event and identity semantics when deduplicating shared collection instructions.                                                                                                       | Later                      |
| [Scaling and performance](../../docs/toolhive/guides-vmcp/scaling-and-performance.mdx)         | Keep under Handle failures and scale; replace the retired intro link in the first change.                                                                                                                                       | Later, plus link fix first |

## First implementation

Implement the six orientation and setup rows marked First, plus the inbound link
and redirect changes below. Keep the existing vMCP category as the pilot's task
entry; place the local path beside the Kubernetes quickstart. Add an Understand
ToolHive group to the ToolHive sidebar containing the canonical vMCP
explanation, and remove that page's Resources sidebar entry. Link the
explanation and task router in both directions.

This temporarily leaves the other Resources pages in their existing sidebar. The
complete destination map above makes the staged migration explicit. Adopt the
full task sidebar and remove Resources in a subsequent change after reviewing
the pilot, rather than expanding this implementation to every page.

The consolidated explanation should retain unique architecture content while
replacing the "5+ servers" fit threshold with concrete needs. Claims about
approval gates, automatic rollback, immediate permission revocation, and
local/Kubernetes parity require source checks. Existing prose is an audit input.

For local setup, verify the prerequisites of every example backend, especially
GitHub credentials. Prefer a small example that avoids unnecessary accounts.
Keep runtime YAML distinct from `VirtualMCPServer` YAML. Move exhaustive flag
coverage out of the narrative only after confirming that the generated reference
covers the same options; generation gaps belong upstream.

The initial change excludes broad rewrites of identity, discovery, telemetry,
performance, and workflow guides. Preserve their recent technical additions.

### Migration and link ledger

| Item                                                         | Required change                                                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `/toolhive/guides-vmcp/intro`                                | Permanent redirect to `/toolhive/concepts/vmcp`; update any older redirects targeting the retired URL to avoid chains. |
| `/toolhive/concepts/vmcp`                                    | Keep URL and explanation purpose; consolidate content and preserve its existing anchors.                               |
| vMCP index, quickstart, local CLI, configuration             | Keep current URLs. Change navigation labels where needed to identify local and Kubernetes applicability.               |
| `sidebars.ts`                                                | Remove intro, surface the local path, and give the canonical explanation one primary ToolHive sidebar home.            |
| Concept, configuration, scaling and performance              | Replace their links to intro with the appropriate explanation or procedure.                                            |
| Client compatibility, Entra ID integration, Okta integration | Replace intro links; preserve context and keep these pages' technical content intact.                                  |
| Generated references                                         | Preserve files; fix generated inbound links at their source if the full sweep finds any.                               |

The initial inbound sweep found the seven navigation/content locations above:
the sidebar and six authored pages. Repeat the sweep across docs, blog, source,
scripts, contributor guidance, and configuration before retiring intro.

Redirects carry URL fragments to the destination. Preserve these intro heading
IDs as explicit anchors where necessary, even if the consolidated headings
change. The initial sweep found no inbound links using intro fragments, but
external links can still depend on them.

| Intro fragment            | Destination content in the canonical explanation |
| ------------------------- | ------------------------------------------------ |
| `what-is-vmcp`            | Purpose and aggregation model                    |
| `core-capabilities`       | Supported capabilities and links to procedures   |
| `when-to-use-vmcp`        | Fit and trade-offs                               |
| `architecture-overview`   | Architecture diagram and deployment differences  |
| `how-it-works`            | Backend relationships and request routing        |
| `optimize-tool-discovery` | Optimization context and link to setup           |
| `next-steps`              | Links to local and Kubernetes procedures         |
| `related-information`     | Further explanation and reference                |

## Verification and decision criteria

Use these tasks for an editorial walkthrough and a rendered preview review.
Record observed results when testing; the criteria below have not yet been
validated with readers.

| Reader task                             | Passing result                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluate aggregation without a cluster. | Identify the local path from the vMCP entry within 10 seconds and reach its procedure in one selection.                                                       |
| Understand whether vMCP fits.           | Find one full explanation; determine the relevant need and deployment trade-offs without reading another introduction.                                        |
| Complete the local example.             | Create the documented backends, start vMCP, see tools from each backend, connect the named client, execute a named tool, and clean up.                        |
| Complete the Kubernetes example.        | Reach ready backends, list aggregated tools, execute a named tool through the connected client, and remove local and cluster resources created by the lesson. |
| Find the next useful task.              | Choose authentication, aggregation customization, or operation from 1-3 next actions; advanced identity and optimization are optional continuations.          |
| Follow an old introduction link.        | Resolve directly to the canonical explanation, including preserved fragments.                                                                                 |

Before publishing the implementation, verify flags and runtime configuration
against current ToolHive source and generated CLI reference. Verify Kubernetes
fields against generated CRD reference/schema. Run both documented paths in the
appropriate environments, including tool listing, invocation, client connection,
and cleanup. Schema validation alone cannot establish that the journey works.
Record any unavailable runtime check explicitly.

Format and lint changed content, check the final diff, and build with the Node
version in `package.json`. Inspect the preview for sidebar ownership, card
labels, mobile navigation, and search arrivals. Check redirects separately; the
site build cannot establish that an old external URL redirects correctly.

Proceed to the wider task navigation if the pilot provides distinct local and
Kubernetes paths, removes the extra introduction without losing useful context,
and makes verification and continuation explicit. If readers still need a
component browse path, add a compact component index linked from Start here. Use
observed navigation failures to revise labels and grouping.

## Follow-on work

After reviewing the pilot, migrate the remaining Resources pages to their mapped
ToolHive homes, resolve index routes, and remove Resources from the navbar.
Update AGENTS.md, the style guide's introduction-page convention, and
authoring/review skill placement guidance with the adopted ownership model.

Next, examine client connectivity across UI, CLI, and Kubernetes. Separate
publishing an endpoint from consuming it; give each procedure an explicit
handoff covering the endpoint, credentials, client support, and verification.

Then examine telemetry. Establish one shared explanation and collection setup,
retain workload-specific instrumentation and signals, and place metric
dictionaries in reference. Reuse steps only where the reader's task and
configuration are actually identical.
