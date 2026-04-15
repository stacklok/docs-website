# Validate YAML blocks

How to dry-run validate extracted YAML blocks efficiently.

## Command

Run all files in a single batch using a loop with result tracking. Write results to a CSV file for reliable aggregation (avoids zsh associative array issues).

```bash
YAML_DIR="<yaml-dir>"
RESULTS="$YAML_DIR/../results.csv"

for f in "$YAML_DIR"/*.yaml; do
    bn=$(basename "$f")
    doc=$(echo "$bn" | sed 's/_[0-9]*\.yaml$//')

    # Skip incomplete resources (snippets without kind/apiVersion/name)
    if ! grep -q 'kind:' "$f" || ! grep -q 'apiVersion:' "$f" || ! grep -q 'name:' "$f"; then
        echo "$doc,$bn,skip,incomplete fragment" >> "$RESULTS"
        continue
    fi

    OUT=$(kubectl apply --dry-run=server -f "$f" 2>&1)
    EC=$?

    if [ $EC -eq 0 ]; then
        echo "$doc,$bn,pass," >> "$RESULTS"
    elif echo "$OUT" | grep -q 'namespaces.*not found'; then
        echo "$doc,$bn,pass,namespace missing but schema valid" >> "$RESULTS"
    elif echo "$OUT" | grep -qE '<SERVER_NAME>|<NAMESPACE>|<SERVER_URL>'; then
        echo "$doc,$bn,expected,placeholder name" >> "$RESULTS"
    elif echo "$OUT" | grep -qE 'spec\.incomingAuth: Required value|spec\.config\.compositeTools\[0\]\.steps: Required value'; then
        echo "$doc,$bn,expected,partial snippet" >> "$RESULTS"
    else
        # Real failure - include error on a single line
        ERR=$(echo "$OUT" | tr '\n' ' ' | head -c 200)
        echo "$doc,$bn,fail,$ERR" >> "$RESULTS"
    fi
done
```

## Result classification

| Result     | Meaning                                  | Action needed?    |
| ---------- | ---------------------------------------- | ----------------- |
| `pass`     | Schema valid (or only namespace missing) | No                |
| `expected` | Placeholder name or partial snippet      | No                |
| `fail`     | Real schema error                        | Yes - fix the doc |
| `skip`     | Incomplete fragment (no kind/name)       | No                |

## Important notes

- Use a CSV file for results, not bash associative arrays (zsh compatibility)
- Write one line per YAML block with: doc name, filename, result, detail
- The CSV is consumed by the report procedure to build the table
