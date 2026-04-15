# Cluster setup

How to manage the kind cluster for dry-run validation. The goal is to avoid unnecessary cluster creation/deletion between runs.

## Check for existing cluster

Always check first. Do NOT create a cluster without checking.

```bash
kind get clusters 2>/dev/null | grep -q "^toolhive$"
```

If the cluster exists, verify CRDs are installed:

```bash
kubectl get crd --context kind-toolhive 2>/dev/null | grep -c toolhive.stacklok.dev
```

If CRDs are present (count > 0), skip straight to extraction. No setup needed.

## Create cluster only if missing

If no `toolhive` cluster exists:

```bash
kind create cluster --name toolhive
helm upgrade --install toolhive-operator-crds \
  oci://ghcr.io/stacklok/toolhive/toolhive-operator-crds \
  -n toolhive-system --create-namespace
```

The operator is NOT needed for dry-run validation. Only install CRDs.

## After the run: keep the cluster

Default to keeping the cluster after the run. Do NOT delete it unless the user explicitly asks. This avoids the 2-minute cluster creation penalty on the next run.

If the user asks to clean up, delete with:

```bash
kind delete cluster --name toolhive
```
