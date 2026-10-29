# Manage website search

The website uses Algolia's free DocSearch service for public documentation. Use
this guide to update the crawler and verify search results after changes to the
site's rendered HTML.

## Configuration and indexes

The Algolia application ID is `5VBG92C77M`. The crawler reads
`https://docs.stacklok.com`, discovers pages through links and the sitemap, and
extracts the server-rendered HTML with JavaScript rendering disabled.

Scheduled crawls run weekly on Sundays at 21:58 UTC. After a large documentation
update is published, request a manual crawl from a maintainer with Algolia
crawler console access to refresh search results sooner.

| Index               | Purpose           | Extraction                                                                                                             |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `stacklok`          | DocSearch results | Headings and content for regular pages, endpoint headings for API references, and individual fields for CRD references |
| `stacklok-markdown` | Ask AI retrieval  | Markdown from `main`, split into records                                                                               |

The website's application ID, index names, and public API key are configured in
[`docusaurus.config.ts`](../../docusaurus.config.ts). DocSearch and Ask AI use
the same public key.

[`crawler.config.js`](./crawler.config.js) contains the complete crawler
configuration, with the crawler API key replaced by `<ALGOLIA_CRAWLER_API_KEY>`.
Use this file as the reviewable repository copy. Deployment to Algolia is
manual; changes to this file do not update the running crawler. The file is
excluded from Prettier and ESLint to preserve the console copy and accommodate
Algolia's crawler runtime.

## Keys and access

The public website key and the public key displayed in Algolia's dashboard both
have the `search`, `listIndexes`, and `settings` permissions. `settings` permits
reading index settings. These keys are safe to expose in the browser.

DocSearch provisions the crawler key. It has write permissions, including
`addObject`, `deleteObject`, `deleteIndex`, and `editSettings`. Keep its value
in Algolia's console or approved secret storage, and use a placeholder in the
repository. Contact DocSearch support when you need to rotate that managed key.

To inspect a key's own permissions and restrictions, use Algolia's
[Retrieve API key permissions endpoint](https://www.algolia.com/doc/rest-api/search/get-api-key).
Authenticate with the same key you are inspecting. A key with the `search`
permission can retrieve its own metadata; its description is redacted.

```bash
ALGOLIA_KEY='<KEY_TO_CHECK>'

curl --fail-with-body \
  "https://5VBG92C77M.algolia.net/1/keys/$ALGOLIA_KEY" \
  -H "X-Algolia-Application-Id: 5VBG92C77M" \
  -H "X-Algolia-API-Key: $ALGOLIA_KEY"
```

## Extraction limits and reference pages

The crawler allows 750 records per page. The main DocSearch index, `stacklok`,
has a 10 KB limit per record; the CRD extractor checks the complete serialized
record, including metadata and hierarchy fields, against that limit.

The Ask AI markdown extractor uses `maxRecordBytes: 100000` to split content for
`stacklok-markdown`. That index accepts larger records: a live-index check on
October 13, 2026 found a VirtualMCPServer record with a 97,106-byte text field.
Keep this markdown threshold separate from the main index's 10 KB limit. Record
size and per-page extraction limits are also separate from the total index
record allowance.

API references contain nested JSON examples and large response descriptions. For
the ToolHive API and Enterprise Manager API pages, the main index extracts
headings through `h2` with content extraction disabled. This provides endpoint
results without indexing overlapping text from nested example lists.

CRD references use a dedicated extractor that emits one page record and one
record per field. Each field record contains its full path, type, and
description, and links to the schema section containing its table. Description
content is capped at 6,000 bytes, leaving room for the other record attributes.
The extractor checks the complete serialized record size and fails visibly if a
page exceeds the record count limit or contains duplicate field paths.

The site serves minified HTML with optional closing tags omitted. Older Cheerio
parsers can nest table rows inside headers or description cells. The CRD
extractor accommodates that structure and removes nested rows from a field's
description before reading its text. Preserve this handling when editing the
extractor.

## Update and validate the crawler

These steps require access to Algolia's crawler console. Coordinate console
changes and crawl runs with a maintainer who has access. Any contributor can
propose configuration changes in this repository.

1. Edit the repository copy of the complete configuration. Keep the API key
   placeholder in the saved file.
2. Open the crawler configuration editor in Algolia and paste the updated
   configuration. Restore the managed crawler key in the console.
3. Preview extraction for these pages:
   - `https://docs.stacklok.com/toolhive/reference/crds/virtualmcpserver`
   - `https://docs.stacklok.com/platform/enterprise-platform/enterprise-manager-api`
   - `https://docs.stacklok.com/toolhive/reference/api`
   - A regular how-to page, such as
     `https://docs.stacklok.com/toolhive/guides-k8s/quickstart`
4. Check both index actions. The main action must contain the CRD field
   extractor; the markdown action must retain its markdown splitting extractor.
   Check record counts, sizes, metadata, and result URLs before saving.
5. Run a full crawl and confirm both indexes complete successfully. Search the
   website for an individual CRD field name, an API endpoint, and a regular
   documentation topic. Open the results and confirm the destination sections.
6. Keep the repository copy aligned with the configuration that passed the
   crawl.

As a baseline, the October 13, 2026 validation covered all 18 published CRD
pages. VirtualMCPServer produced 564 records, and the largest record across
those pages was 2,587 bytes in local validation. The full Algolia crawl
succeeded, and field searches landed in the correct schema sections. Recheck
these values after schema or rendering changes.

## Next steps

- Review the [saved crawler configuration](./crawler.config.js) when changing
  API or CRD rendering.
- Use
  [Algolia's API key documentation](https://www.algolia.com/doc/guides/security/api-keys/)
  when checking permissions and restrictions.
