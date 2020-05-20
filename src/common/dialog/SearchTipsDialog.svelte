<script>
  import SearchExample from "@/common/SearchExample";

  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { slugify } from "@/util/string";

  $: userExample =
    $orgsAndUsers.me != null
      ? `user:${slugify($orgsAndUsers.me.name, $orgsAndUsers.me.id)}`
      : "user:example-123";

  const table = [
    // Basic usage
    ["Basic usage"],
    ["Exact string matching", "Surround query with quotes", '"exact match"'],
    [
      "Search by document title",
      "Type “title:” followed by the title of your document (surround multiple words with quotes or parentheses)",
      "title:mueller",
      'title:"mueller report"'
    ],
    [
      "Search by user",
      "Type “user:” followed by an autocompleted user name",
      "user:example-user-123"
    ],
    [
      "Search by project",
      "Type “project:” followed by an autocompleted project name",
      "project:example-project-123"
    ],
    [
      "Search by organization",
      "Type “organization:” followed by an autocompleted organization name",
      "organization:example-org-123"
    ],

    // Logic
    ["Logic"],
    [
      "Require both terms to be present",
      "Type “AND” (capitalization important) in between the queries",
      "hello AND goodbye"
    ],
    [
      "Require one term or another (or both) to be present",
      "Type “OR” (capitalization important) in between the queries",
      "hello OR goodbye"
    ],
    [
      "Group queries together",
      "Use parentheses to group logical queries together. These can be nested for complex queries",
      "(a OR b) AND (c OR d)"
    ],
    [
      "Exclude a term or filter",
      "Type “-” or “NOT” followed by a word, quoted phrase, or filter",
      "-report",
      "NOT report",
      '-title:"my doc"',
      'NOT title:"my doc"'
    ],
    [
      "Require a term or filter",
      "Type “+” followed by a word, quoted phrase, or filter (most filters are automatically required but this is a way to be explicit)",
      "+report",
      '+title:"my doc"'
    ],

    // More filters
    ["More filters"],
    [
      "Search by access",
      "Type “access:” followed by an autocompleted access level (“private”, “public”, or “organization”)",
      "access:public"
    ],
    [
      "Search by status",
      "Type “status:” followed by an autocompleted document status (“success”, “readable”, “pending”, “error”, or “nofile”)",
      "status:success"
    ],
    [
      "Search by tag",
      "Type “tag:” followed by the tag you wish to be present (requires documents to be tagged ahead of time)",
      "tag:report"
    ],
    [
      "Search by key/value pair",
      "Type “data_&lt;key&gt;:” followed by the value you wish to be present (requires documents to be labeled ahead of time)",
      "data_year:2020"
    ],
    [
      "Search by page count",
      "Type “pages:” followed by an exact number or a range",
      "pages:123",
      "pages:[100 TO *]",
      "pages:[* TO 20]",
      "pages:[50 TO 80]"
    ],
    [
      "Search by language",
      "Type “language:” followed by an autocompleted language option",
      "language:spa"
    ],

    // Sorting
    ["Sorting"],
    [
      ["Add sort options"],
      "Type “sort:” followed by an autocompleted sort option. The order of the sort can be reversed by prepending a ‘-’ to the sort value. For example, “sort:title” sorts by a document’s title in ascending order (A-Z). “sort:-title” sorts by a document’s title in descending order (Z-A). “sort:score” sorts by query relevance and is the default.",
      "sort:created_at",
      "sort:-created_at",
      "sort:title",
      "investigation sort:-page_count",
      // TODO: add source when the field is implemented
      "sort:score"
    ],

    ["Advanced"],
    [
      "Wildcard letter",
      "Add ? in a word to match a single letter, e.g. “s?ar” matches “soar”, “star”, “scar”, etc.",
      "s?ar"
    ],
    [
      "Wildcard run",
      "Add * in a word to match a run of zero or more letters, e.g. “s*ore” matches “sore”, “score”, “sophomore”, etc.",
      "s*ore",
      "report*",
      "*ing"
    ],
    [
      "Fuzzy word search",
      "Add ‘~’ at the end of a word to search that word along with common misspellings (useful for OCR errors, too)",
      "building~"
    ],
    [
      "Phrase match with gap",
      "Surround two words with quotes and add ‘~’ followed by how many words can occur between the two words",
      '"taxpayers money"~5'
    ],
    [
      "Search for text on a specific page number",
      "Type “page_no_&lt;number&gt;:” followed by the search text, where “&lt;number&gt;” is the desired page number",
      "page_no_23:findings"
    ],
    [
      "Custom search weight",
      "After a search term add ‘^’ followed by a number to weight the importance of that term in the query",
      '"findings revealed"^10 report^3'
    ]
  ];
</script>

<style lang="scss">
  .padded {
    margin-bottom: 35px;
  }

  table {
    $border: solid 1px gainsboro;
    margin-top: -10px;

    td,
    th {
      border-right: $border;
      border-bottom: $border;
      vertical-align: middle;
      padding: 4px 8px;

      &:first-child {
        border-left: $border;
      }
    }

    .name {
      padding: 8px;

      h4 {
        font-size: 15px;
        margin: 0 0 3px 0;
      }

      p {
        font-size: 13px;
        margin: 0;
      }
    }

    .filter {
      padding-bottom: 0;
      width: 50%;
      max-width: 270px;
      min-width: 200px;
    }

    tr:first-child {
      td,
      th {
        border-top: $border;
      }
    }

    th {
      background: rgb(244, 244, 244);
      font-size: 14px;

      &.header {
        background: white !important;
        border: none !important;
        padding: 0 !important;

        > div {
          background: $primary;
          color: white;
          padding: 6px 8px;
          margin-top: 14px;
          border-bottom: $border;
        }
      }
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>Search Tips</h1>
    <div class="padded">
      <p>
        The search bar is a flexible and powerful tool for searching your
        documents, your organization’s documents, and public documents. The
        default search view, “Your Documents,” includes a user filter to only
        display your documents, but you can do a lot more.
      </p>
      <SearchExample
        content={`${userExample} "mueller report" project:test-345  -pages:448`} />
      <p>
        The above example, for instance, searches all documents within
        {#if $orgsAndUsers.loggedIn}your account{:else}a user’s account{/if}
        for a specific project that contain the exact text “mueller report” and
        don’t have a page count of 448 (thus excluding the actual Mueller
        Report).
      </p>
      <p>
        <b>Reference table:</b>
      </p>

      <table cellspacing="0">
        {#each table as row}
          {#if row.length == 1}
            <tr>
              <th colspan="2" class="header">
                <div>{row[0]}</div>
              </th>
            </tr>
            <tr>
              <th>Description</th>
              <th>Example Query</th>
            </tr>
          {:else}
            <tr>
              <td class="name">
                <h4>
                  {@html row[0]}
                </h4>
                <p>
                  {@html row[1]}
                </p>
              </td>
              <td class="filter">
                {#each row.slice(2) as example}
                  <SearchExample compact={true} content={example} />
                {/each}
              </td>
            </tr>
          {/if}
        {/each}
      </table>
    </div>
  </div>
</div>
