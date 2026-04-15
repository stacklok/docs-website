# Validate YAML blocks

How to dry-run validate extracted YAML blocks efficiently.

## Important: use a script file, not inline bash

Long-running `for` loops with nested `if/elif/else` and subshells do NOT work reliably as inline Bash tool calls - they get backgrounded or time out. Always write the validation loop to a temporary `.sh` file and execute it with `bash`.

## Step 1: Write the validation script

Write the following to a temp file (e.g., `$YAML_DIR/../validate.sh`). Replace `<yaml-dir>` with the actual YAML directory path.

```bash
#!/bin/bash
set -euo pipefail

YAML_DIR="<yaml-dir>"
RESULTS="$YAML_DIR/../results.csv"
> "$RESULTS"

for f in "$YAML_DIR"/*.yaml; do
    bn=$(basename "$f")
    doc=$(echo "$bn" | sed 's/_[0-9]*\.yaml$//')

    # Skip incomplete resources (snippets without kind/apiVersion/name)
    if ! grep -q 'kind:' "$f" || ! grep -q 'apiVersion:' "$f" || ! grep -q 'name:' "$f"; then
        echo "$doc,$bn,skip,incomplete fragment" >> "$RESULTS"
        continue
    fi

    OUT=$(kubectl apply --dry-run=server -f "$f" 2>&1) || true

    if echo "$OUT" | grep -q 'created (server dry run)'; then
        echo "$doc,$bn,pass," >> "$RESULTS"
    elif echo "$OUT" | grep -q 'namespaces.*not found'; then
        echo "$doc,$bn,pass,namespace missing but schema valid" >> "$RESULTS"
    elif echo "$OUT" | grep -qE '<SERVER_NAME>|<NAMESPACE>|<SERVER_URL>'; then
        echo "$doc,$bn,expected,placeholder name" >> "$RESULTS"
    elif echo "$OUT" | grep -qE 'incomingAuth: Required|compositeTools.*steps: Required'; then
        echo "$doc,$bn,expected,partial snippet" >> "$RESULTS"
    else
        ERR=$(echo "$OUT" | tr '\n' ' ' | head -c 200)
        echo "$doc,$bn,fail,$ERR" >> "$RESULTS"
    fi
done

echo "Done: $(wc -l < "$RESULTS") lines"
```

## Step 2: Run the script

Use the Write tool to create the script file, then execute it:

```bash
bash $YAML_DIR/../validate.sh
```

This runs in a single process and completes reliably regardless of how many YAML blocks are validated.

## Result classification

| Result     | Meaning                                  | Action needed?    |
| ---------- | ---------------------------------------- | ----------------- |
| `pass`     | Schema valid (or only namespace missing) | No                |
| `expected` | Placeholder name or partial snippet      | No                |
| `fail`     | Real schema error                        | Yes - fix the doc |
| `skip`     | Incomplete fragment (no kind/name)       | No                |

## Important notes

- ALWAYS write to a script file first, then execute with `bash`
- Use `|| true` after `kubectl apply` to prevent `set -e` from exiting on validation failures
- Check for `created (server dry run)` in output rather than exit code, because some versions of kubectl return non-zero even on dry-run success with warnings
- Use a CSV file for results, not bash variables or associative arrays
- Write one line per YAML block with: doc name, filename, result, detail
- The CSV is consumed by the report procedure to build the table
