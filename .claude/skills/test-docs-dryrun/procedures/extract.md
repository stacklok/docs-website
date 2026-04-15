# Extract YAML blocks

How to extract ToolHive CRD YAML blocks from documentation files. Always use the extraction script - do NOT write inline bash to parse YAML.

## Commands

Use the `--prefix` flag to avoid filename collisions between sections. This is critical because both sections have files with the same name (e.g., `telemetry-and-metrics.mdx`).

```bash
SKILL_PATH="<skill-path>"
YAML_DIR="$(mktemp -d)/yaml"
mkdir -p "$YAML_DIR"

# K8s Operator docs
for f in docs/toolhive/guides-k8s/*.mdx; do
    python3 "$SKILL_PATH/scripts/extract-yaml.py" "$f" "$YAML_DIR" --prefix k8s
done

# vMCP docs
for f in docs/toolhive/guides-vmcp/*.mdx; do
    python3 "$SKILL_PATH/scripts/extract-yaml.py" "$f" "$YAML_DIR" --prefix vmcp
done
```

Replace `<skill-path>` with the absolute path to this skill's directory.

## Output

The script writes one file per YAML block:

```text
k8s-auth-k8s_0.yaml
k8s-auth-k8s_1.yaml
k8s-run-mcp-k8s_0.yaml
vmcp-authentication_0.yaml
vmcp-telemetry-and-metrics_0.yaml
```

The prefix ensures `k8s-telemetry-and-metrics_0.yaml` and `vmcp-telemetry-and-metrics_0.yaml` don't collide.

## For single section

If only validating one section, use just the relevant loop:

```bash
# K8s only
for f in docs/toolhive/guides-k8s/*.mdx; do
    python3 "$SKILL_PATH/scripts/extract-yaml.py" "$f" "$YAML_DIR" --prefix k8s
done

# vMCP only
for f in docs/toolhive/guides-vmcp/*.mdx; do
    python3 "$SKILL_PATH/scripts/extract-yaml.py" "$f" "$YAML_DIR" --prefix vmcp
done
```

## For single page

```bash
python3 "$SKILL_PATH/scripts/extract-yaml.py" <file-path> "$YAML_DIR" --prefix single
```
