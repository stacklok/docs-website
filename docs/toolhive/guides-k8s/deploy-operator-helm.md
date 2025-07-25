---
title: Deploy the operator
description:
  How to deploy the ToolHive operator in a Kubernetes cluster using Helm
---

Helm is the officially supported method to install the ToolHive operator in a
Kubernetes cluster.

## Prerequisites

- A Kubernetes cluster (current and two previous minor versions are supported)
- Permissions to create resources in the cluster
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/) configured to communicate
  with your cluster
- [Helm](https://helm.sh/docs/intro/install/) (v3.10 minimum, v3.14+
  recommended)

## Install the CRDs

![Latest CRD Helm chart release](https://img.shields.io/github/v/release/stacklok/toolhive?filter=toolhive-operator-crds-*&style=for-the-badge&logo=helm&label=Latest%20CRD%20chart&color=097aff)

The ToolHive operator requires Custom Resource Definitions (CRDs) to manage
MCPServer resources. The CRDs define the structure and behavior of MCPServers in
your cluster.

```bash
helm upgrade -i toolhive-operator-crds oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds
```

This command installs the latest version of the ToolHive operator CRDs Helm
chart. To install a specific version, append `--version <VERSION>` to the
command, for example:

```bash
helm upgrade -i toolhive-operator-crds oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds --version 0.0.7
```

## Install the operator

![Latest Operator Helm chart release](https://img.shields.io/github/v/release/stacklok/toolhive?filter=toolhive-operator-0*&style=for-the-badge&logo=helm&label=Latest%20Operator%20chart&color=097aff)

To install the ToolHive operator using default settings, run the following
command:

```bash
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator -n toolhive-system --create-namespace
```

This command installs the latest version of the ToolHive operator CRDs Helm
chart. To install a specific version, append `--version <VERSION>` to the
command, for example:

```bash
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator -n toolhive-system --create-namespace --version 0.1.1
```

Verify the installation:

```bash
kubectl get pods -n toolhive-system
```

After about 30 seconds, you should see the `toolhive-operator` pod running.

Check the logs of the operator pod:

```bash
kubectl logs -f -n toolhive-system <TOOLHIVE_OPERATOR_POD_NAME>
```

This shows you the logs of the operator pod, which can help you debug any
issues.

## Customize the operator

You can customize the operator installation by providing a `values.yaml` file
with your configuration settings. For example, to change the number of replicas
and set a specific ToolHive version, create a `values.yaml` file:

```yaml title="values.yaml"
operator:
  replicaCount: 2
  toolhiveRunnerImage: ghcr.io/stacklok/toolhive:v0.1.8 # or `latest`
```

Install the operator with your custom values:

```bash {3}
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator\
  -n toolhive-system --create-namespace\
  -f values.yaml
```

To see all available configuration options, run:

```bash
helm show values oci://ghcr.io/stacklok/toolhive/toolhive-operator
```

## Operator deployment modes

The ToolHive operator supports two distinct deployment modes to accommodate
different security requirements and organizational structures.

### Cluster mode (default)

Cluster mode provides the operator with cluster-wide access to manage MCPServer
resources in any namespace. This is the default mode and is suitable for
platform teams managing MCPServers across the entire cluster.

**Characteristics:**

- Full cluster-wide access to manage MCPServers in any namespace
- Uses `ClusterRole` and `ClusterRoleBinding` for broad permissions
- Simplest configuration and management
- Best for single-tenant clusters or trusted environments

To explicitly configure cluster mode, include the following property in your
Helm `values.yaml` file:

```yaml title="values.yaml"
operator:
  rbac:
    scope: 'cluster'
```

Reference the `values.yaml` file when you install the operator using Helm:

```bash {3}
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator \
  -n toolhive-system --create-namespace
  -f values.yaml
```

This is the default configuration used in the standard installation commands.

### Namespace mode

Namespace mode restricts the operator's access to only specified namespaces.
This mode is perfect for multi-tenant environments and organizations following
the principle of least privilege.

**Characteristics:**

- Restricted access to only specified namespaces
- Uses `ClusterRole` with namespace-specific `RoleBindings` for precise access
  control
- Enhanced security through reduced blast radius
- Ideal for multi-tenant environments and compliance requirements

To configure namespace mode, include the following in your Helm `values.yaml`:

```yaml title="values.yaml"
operator:
  rbac:
    scope: 'namespace'
    allowedNamespaces:
      - 'team-frontend'
      - 'team-backend'
      - 'staging'
      - 'production'
```

This example lets the operator manage MCPServer resources in the four namespaces
listed in the `allowedNamespaces` property. Adjust the list to match your
environment.

Reference the `values.yaml` file when you install the operator using Helm:

```bash {3}
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator \
  -n toolhive-system --create-namespace
  -f values.yaml
```

Verify the RoleBindings are created:

```bash
kubectl get rolebinding --all-namespaces | grep toolhive
```

You should see RoleBindings in the specified namespaces, granting the operator
access to manage MCPServers. Example output:

```text
NAMESPACE        NAME                                           ROLE
team-frontend    toolhive-operator-manager-rolebinding          ClusterRole/toolhive-operator-manager-role
team-backend     toolhive-operator-manager-rolebinding          ClusterRole/toolhive-operator-manager-role
staging          toolhive-operator-manager-rolebinding          ClusterRole/toolhive-operator-manager-role
production       toolhive-operator-manager-rolebinding          ClusterRole/toolhive-operator-manager-role
toolhive-system  toolhive-operator-leader-election-rolebinding  Role/toolhive-operator-leader-election-role
```

### Migrate between modes

You can switch between cluster mode and namespace mode by updating the
`values.yaml` file and reapplying the Helm chart as shown above. Migration in
both directions is supported.

## Check operator status

To verify the operator is working correctly:

```bash
# Verify CRDs are installed
kubectl get crd | grep toolhive

# Check operator deployment status
kubectl get deployment -n toolhive-system toolhive-operator

# Check operator service account and RBAC
kubectl get serviceaccount -n toolhive-system
kubectl get clusterrole | grep toolhive
kubectl get clusterrolebinding | grep toolhive

# Check operator pod status
kubectl get pods -n toolhive-system
# Check operator pod logs
kubectl logs -n toolhive-system <TOOLHIVE_OPERATOR_POD_NAME>
```

## Upgrade the operator

To upgrade the ToolHive operator to a new version, use the same command you used
to install it:

```bash
helm upgrade toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator -n toolhive-system --reuse-values
```

This upgrades the operator to the latest version available in the OCI registry.
If you have a custom `values.yaml` file, include it with the `-f` flag:

```bash
helm upgrade toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator -n toolhive-system --reuse-values -f values.yaml
```

## Uninstall the operator

To uninstall the operator and CRDs, run the following commands:

```bash
helm uninstall toolhive-operator -n toolhive-system
helm uninstall toolhive-operator-crds
```

This removes all the Kubernetes components associated with the chart and deletes
the release. You'll need to delete the namespace manually if you used Helm to
create it.

## Next steps

See [Run MCP servers in Kubernetes](./run-mcp-k8s.md) to learn how to create and
manage MCP servers using the ToolHive operator in your Kubernetes cluster. The
operator supports deploying MCPServer resources based on the deployment mode
configured during installation.

## Related information

- [Kubernetes introduction](./intro.md) - Overview of ToolHive's Kubernetes
  integration
- [ToolHive operator tutorial](../tutorials/quickstart-k8s.mdx) - Step-by-step
  tutorial for getting started using a local kind cluster

## Troubleshooting

<details>
<summary>Authentication error with ghcr.io</summary>

If you encounter an authentication error when pulling the Helm chart, it might
indicate a problem with your access to the GitHub Container Registry
(`ghcr.io`).

ToolHive's charts and images are public, but if you've previously logged into
`ghcr.io` using a personal access token, you might need to re-authenticate if
your token has expired or been revoked.

See the GitHub documentation to
[re-authenticate to the registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-with-a-personal-access-token-classic).

</details>

<details>
<summary>Operator pod fails to start</summary>

If the operator pod is not starting or is in a `CrashLoopBackOff` state, check
the pod logs for error messages:

```bash
kubectl get pods -n toolhive-system
# Note the name of the toolhive-operator pod

kubectl describe pod -n toolhive-system <TOOLHIVE_OPERATOR_POD_NAME>
kubectl logs -n toolhive-system <TOOLHIVE_OPERATOR_POD_NAME>
```

Common causes include:

- **Missing CRDs**: Ensure the CRDs were installed successfully before
  installing the operator. The operator requires the CRDs to function properly.
- **Configuration errors**: Check your `values.yaml` file for any
  misconfigurations
- **Insufficient permissions**: Ensure your cluster has the necessary RBAC
  permissions for the operator to function
- **Resource constraints**: Check if the cluster has sufficient CPU and memory
  resources available
- **Image pull issues**: Verify that the cluster can pull images from `ghcr.io`

</details>

<details>
<summary>CRDs installation fails</summary>

If the CRDs installation fails, you might see errors about existing resources or
permission issues:

```bash
# Check if CRDs already exist
kubectl get crd | grep toolhive

# Remove existing CRDs if needed (this will delete all related resources)
kubectl delete crd <CRD_NAME>
```

To reinstall the CRDs:

```bash
helm uninstall toolhive-operator-crds
helm upgrade -i toolhive-operator-crds oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds
```

</details>

<details>
<summary>Namespace creation issues</summary>

If you encounter permission errors when creating the `toolhive-system`
namespace, create it manually first:

```bash
kubectl create namespace toolhive-system
```

Then install the operator without the `--create-namespace` flag:

```bash
helm upgrade -i toolhive-operator oci://ghcr.io/stacklok/toolhive/toolhive-operator -n toolhive-system
```

</details>

<details>
<summary>Helm chart not found</summary>

If Helm cannot find the chart, ensure you're using the correct OCI registry URL
and that your Helm version supports OCI registries (v3.8.0+):

```bash
# Check Helm version
helm version

# Try pulling the chart explicitly
helm pull oci://ghcr.io/stacklok/toolhive/toolhive-operator
```

</details>

<details>
<summary>Network connectivity issues</summary>

If you're experiencing network timeouts or connection issues:

- Verify your cluster has internet access to reach `ghcr.io`
- Check if your organization uses a proxy or firewall that might block access
- Consider using a private registry mirror if direct access is restricted

</details>
