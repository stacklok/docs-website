# Report results

How to produce the per-doc breakdown table from the results CSV.

## Build the table from CSV

The validate step writes a CSV at `$RESULTS` with columns: `doc,filename,result,detail`

Aggregate it into the per-doc table using this bash:

```bash
RESULTS="<path-to-results.csv>"

echo "| Doc | Section | Blocks | Pass | Fail | Expected | Skip |"
echo "|-----|---------|--------|------|------|----------|------|"

TBLOCKS=0; TPASS=0; TFAIL=0; TEXPECTED=0; TSKIP=0

for doc in $(cut -d',' -f1 "$RESULTS" | sort -u); do
    blocks=$(grep -c "^$doc," "$RESULTS")
    pass=$(grep -c "^$doc,[^,]*,pass" "$RESULTS" || true)
    fail=$(grep -c "^$doc,[^,]*,fail" "$RESULTS" || true)
    expected=$(grep -c "^$doc,[^,]*,expected" "$RESULTS" || true)
    skip=$(grep -c "^$doc,[^,]*,skip" "$RESULTS" || true)

    # Determine section from prefix
    section="K8s"
    echo "$doc" | grep -q "^vmcp-" && section="vMCP"

    # Bold non-zero fail counts
    fail_display="$fail"
    [ "$fail" -gt 0 ] && fail_display="**$fail**"

    echo "| ${doc} | ${section} | ${blocks} | ${pass} | ${fail_display} | ${expected} | ${skip} |"

    TBLOCKS=$((TBLOCKS + blocks))
    TPASS=$((TPASS + pass))
    TFAIL=$((TFAIL + fail))
    TEXPECTED=$((TEXPECTED + expected))
    TSKIP=$((TSKIP + skip))
done

echo "| **TOTAL** | | **$TBLOCKS** | **$TPASS** | **$TFAIL** | **$TEXPECTED** | **$TSKIP** |"
```

## Table rules

- Include every doc that had at least 1 YAML block extracted
- Omit docs with 0 blocks
- Group K8s docs first (prefix `k8s-`), then vMCP docs (prefix `vmcp-`)
- Sort alphabetically within each section
- Bold the TOTAL row
- Bold any non-zero Fail count

## After the table

List each real failure with:

```text
### Real failures

**k8s-mcp-server-entry_1.yaml**: `strict decoding error: unknown field "spec.remoteURL"`
  Fix: Change `remoteURL` to `remoteUrl`

**vmcp-optimizer_3.yaml**: `strict decoding error: unknown field "spec.modelCache.storageSize"`
  Fix: Change `storageSize` to `size`
```

## Write to file

Always write the table and failure details to a markdown file:

- Single page: `TEST_DRYRUN_<PAGE_NAME>.md`
- Section: `TEST_DRYRUN_<SECTION_NAME>.md`
- All: `TEST_DRYRUN_ALL.md`
