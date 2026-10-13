new Crawler({
  appId: "5VBG92C77M",
  apiKey: "<ALGOLIA_CRAWLER_API_KEY>",
  maxUrls: null,
  indexPrefix: "",
  rateLimit: 8,
  renderJavaScript: false,
  startUrls: ["https://docs.stacklok.com"],
  discoveryPatterns: ["https://docs.stacklok.com/**"],
  schedule: "at 21:58 on Sunday",
  maxDepth: 10,
  actions: [
    {
      indexName: "stacklok",
      pathsToMatch: ["https://docs.stacklok.com/**"],
      recordExtractor: ({ url, $, helpers }) => {
        // Algolia editor declarations mix Cheerio and browser DOM node types.
        const dom = /** @type {any} */ ($);
        const pathname = url.pathname.replace(/\/+$/, "");
        const isApiReference =
          pathname === "/toolhive/reference/api" ||
          pathname === "/platform/enterprise-platform/enterprise-manager-api";
        const isCrdReference =
          /^\/(?:toolhive|platform)\/reference\/crds\/[^/]+$/.test(pathname);
        const lvl0 =
          dom(
            ".menu__link.menu__link--sublist.menu__link--active, " +
              ".navbar__item.navbar__link--active",
          )
            .last()
            .text()
            .trim() || "Documentation";

        if (!isCrdReference) {
          return helpers.docsearch({
            recordProps: {
              lvl0: { selectors: "", defaultValue: lvl0 },
              lvl1: ["header h1", "article h1"],
              lvl2: "article h2",
              ...(!isApiReference && {
                lvl3: "article h3",
                lvl4: "article h4",
                lvl5: "article h5, article td:first-child",
                lvl6: "article h6",
              }),
              content: isApiReference
                ? ""
                : "article p, article li, article td:last-child",
            },
            aggregateContent: true,
            recordVersion: "v3",
          });
        }

        const clean = (text) =>
          text
            .replace(/\u200b/g, "")
            .replace(/\s+/g, " ")
            .trim();
        // Count UTF-8 bytes without depending on Node-only APIs in the crawler.
        const bytes = (text) =>
          encodeURIComponent(text).replace(/%[A-F\d]{2}/gi, "x").length;
        const bounded = (text, limit) => {
          if (bytes(text) <= limit) return text;
          let result = "";
          let size = 0;
          for (const character of text) {
            size += bytes(character);
            if (size > limit - 3) break;
            result += character;
          }
          return result.trimEnd() + "...";
        };
        const pageUrl = String(url).split("#")[0];
        const title = clean(dom("article h1").first().text());
        const language =
          dom('meta[name="docsearch:language"]').attr("content") || "en";
        const tags = (name, fallback) =>
          (dom(`meta[name="docsearch:${name}"]`).attr("content") || fallback)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        const metadata = {
          lang: language,
          language,
          version: tags("version", "current"),
          docusaurus_tag: tags("docusaurus_tag", ""),
        };
        const hierarchy = (scope, field) => ({
          lvl0,
          lvl1: title,
          lvl2: scope,
          lvl3: field,
          lvl4: null,
          lvl5: null,
          lvl6: null,
        });
        const records = [
          {
            ...metadata,
            objectID: `${pageUrl}:page`,
            url: pageUrl,
            url_without_anchor: pageUrl,
            anchor: "",
            hierarchy: hierarchy(null, null),
            content: null,
            type: "lvl1",
            weight: { pageRank: 0, level: 1, position: 0 },
          },
        ];
        let scope = null;
        let scopeAnchor = null;
        const blocks = dom(
          "article h2, article h3, article h4, article h5, article h6, article table",
        );
        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
          const node = blocks.eq(blockIndex);
          if (!node.is("table")) {
            // Schema headings contain the full field path in a code element.
            scope = clean(node.children("code").first().text()) || null;
            scopeAnchor = node.attr("id") || null;
            continue;
          }
          const columns = node.find("thead th");
          const headerNames = [];
          for (
            let columnIndex = 0;
            columnIndex < columns.length;
            columnIndex++
          ) {
            headerNames.push(clean(columns.eq(columnIndex).text()));
          }
          if (
            !scope ||
            !scopeAnchor ||
            headerNames[0] !== "Field" ||
            headerNames[1] !== "Type" ||
            !headerNames[2] ||
            !headerNames[2].startsWith("Description")
          )
            continue;
          const rows = node.find("tbody tr");
          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const cells = rows.eq(rowIndex).children("td");
            const field = clean(cells.eq(0).find("code").first().text());
            if (!field) continue;
            const fullPath = `${scope}.${field}`;
            const fieldType = clean(cells.eq(1).text());
            // Older parsers can nest subsequent rows inside an unclosed cell.
            const descriptionCell = cells.eq(2).clone();
            descriptionCell.find("tr, tbody").remove();
            const description = clean(descriptionCell.text());
            records.push({
              ...metadata,
              objectID: `${pageUrl}:field:${fullPath}`,
              url: `${pageUrl}#${scopeAnchor}`,
              url_without_anchor: pageUrl,
              anchor: scopeAnchor,
              hierarchy: hierarchy(scope, field),
              content: bounded(
                `${fullPath} (${fieldType}). ${description}`,
                6000,
              ),
              type: "content",
              weight: { pageRank: 0, level: 3, position: records.length },
            });
          }
        }
        // Fail visibly if the renderer changes or a future schema exceeds the limits.
        if (records.length === 1)
          throw new Error(`No CRD fields extracted: ${pageUrl}`);
        if (records.length > 750)
          throw new Error(`CRD exceeds 750 records: ${pageUrl}`);
        if (
          new Set(records.map((record) => record.objectID)).size !==
          records.length
        )
          throw new Error(`Duplicate CRD field paths: ${pageUrl}`);
        for (const record of records) {
          if (bytes(JSON.stringify(record)) >= 10000)
            throw new Error(`CRD record exceeds 10 KB: ${record.objectID}`);
        }
        return records;
      },
    },
    {
      indexName: "stacklok-markdown",
      pathsToMatch: ["https://docs.stacklok.com/**"],
      recordExtractor: ({ $, url, helpers }) => {
        const text = helpers.markdown("main");
        if (text === "") return [];

        // Extract meta tag values. These are required for Docusaurus
        const language =
          $('meta[name="docsearch:language"]').attr("content") || "en";
        const version =
          $('meta[name="docsearch:version"]').attr("content") || "latest";
        const docusaurus_tag =
          $('meta[name="docsearch:docusaurus_tag"]').attr("content") || "";

        return helpers.splitTextIntoRecords({
          text,
          baseRecord: {
            url,
            objectID: url,
            title: $("head > title").text(),
            lang: language, // Required for Docusaurus
            language, // Required for Docusaurus
            version: version.split(","), // in case there are multiple versions. Required for Docusaurus
            docusaurus_tag: docusaurus_tag // Required for Docusaurus
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          },
          maxRecordBytes: 100000,
          orderingAttributeName: "part",
        });
      },
    },
  ],
  sitemaps: ["https://docs.stacklok.com/sitemap.xml"],
  initialIndexSettings: {
    stacklok: {
      advancedSyntax: true,
      allowTyposOnNumericTokens: false,
      attributeCriteriaComputedByMinProximity: true,
      attributeForDistinct: "url",
      attributesForFaceting: [
        "type",
        "lang",
        "language",
        "version",
        "docusaurus_tag",
      ],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
      ],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "content"],
      customRanking: [
        "desc(weight.pageRank)",
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      distinct: 1,
      highlightPostTag: "</span>",
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      ignorePlurals: true,
      minProximity: 1,
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      ranking: [
        "words",
        "filters",
        "typo",
        "attribute",
        "proximity",
        "exact",
        "custom",
      ],
      removeWordsIfNoResults: "allOptional",
      searchableAttributes: [
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy.lvl5)",
        "unordered(hierarchy.lvl6)",
        "content",
      ],
    },
    "markdown-index": {
      attributesForFaceting: ["lang", "language", "version", "docusaurus_tag"],
      ignorePlurals: true,
      minProximity: 4,
      removeStopWords: false,
      searchableAttributes: ["unordered(title)", "unordered(text)"],
      removeWordsIfNoResults: "allOptional",
    },
    "stacklok-markdown": {
      attributesForFaceting: ["lang", "language", "version", "docusaurus_tag"],
      ignorePlurals: true,
      minProximity: 4,
      removeStopWords: false,
      searchableAttributes: ["unordered(title)", "unordered(text)"],
      removeWordsIfNoResults: "allOptional",
    },
  },
  ignoreCanonicalTo: true,
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
});
