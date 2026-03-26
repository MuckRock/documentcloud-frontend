<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { http, HttpResponse } from "msw";

  import SearchEditorComponent from "../../search/SearchEditor.svelte";

  import { usersList, organizationsList } from "@/test/fixtures/accounts";
  import { projectList } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";
  import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
  import { createApiUrl } from "@/test/handlers/utils";

  // MSW handlers for API-backed autocomplete and atom enrichment.
  // Use exact paths (no wildcard) — these endpoints only vary by query params.
  const usersUrl = createApiUrl("users/");
  const orgsUrl = createApiUrl("organizations/");
  const projectsUrl = createApiUrl("projects/");
  const searchUrl = createApiUrl("documents/search/");

  const apiHandlers = [
    http.get(usersUrl, ({ request }) => {
      const url = new URL(request.url);
      const prefix = url.searchParams.get("name__istartswith")?.toLowerCase();
      const idIn = url.searchParams.get("id__in");
      let results = usersList.results;
      if (prefix) {
        results = results.filter(
          (u) =>
            u.name?.toLowerCase().startsWith(prefix) ||
            u.username.toLowerCase().startsWith(prefix),
        );
      }
      if (idIn) {
        const ids = new Set(idIn.split(",").map(Number));
        results = results.filter((u) => ids.has(u.id));
      }
      return HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results,
      });
    }),
    http.get(orgsUrl, ({ request }) => {
      const url = new URL(request.url);
      const prefix = url.searchParams.get("name__istartswith")?.toLowerCase();
      const idIn = url.searchParams.get("id__in");
      let results = organizationsList.results;
      if (prefix) {
        results = results.filter((o) =>
          o.name.toLowerCase().startsWith(prefix),
        );
      }
      if (idIn) {
        const ids = new Set(idIn.split(",").map(Number));
        results = results.filter((o) => ids.has(o.id));
      }
      return HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results,
      });
    }),
    http.get(projectsUrl, ({ request }) => {
      const url = new URL(request.url);
      const prefix = url.searchParams.get("title__istartswith")?.toLowerCase();
      const idIn = url.searchParams.get("id__in");
      let results = projectList.results;
      if (prefix) {
        results = results.filter((p) =>
          p.title.toLowerCase().startsWith(prefix),
        );
      }
      if (idIn) {
        const ids = new Set(idIn.split(",").map(Number));
        results = results.filter((p) => ids.has(p.id));
      }
      return HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results,
      });
    }),
    http.get(searchUrl, ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get("q") ?? "";
      let results = documentsList.results;
      // Filter by title prefix for queries like "title:foo*"
      const titleMatch = q.match(/^title:(.+?)(\*?)$/);
      if (titleMatch?.[1]) {
        const prefix = titleMatch[1].toLowerCase();
        results = results.filter((d) =>
          d.title.toLowerCase().startsWith(prefix),
        );
      }
      // "*" or empty query returns all documents
      return HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results: results.slice(0, 10),
      });
    }),
  ];

  const { Story } = defineMeta({
    title: "Documents / Search Editor",
    component: SearchEditorComponent,
    parameters: {
      layout: "centered",
      msw: { handlers: apiHandlers },
      viewport: {
        viewports: INITIAL_VIEWPORTS,
      },
    },
  });
</script>

<script lang="ts">
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  const search = new SearchResultsState();
  search.setResults(Promise.resolve({ data: documentsList }));
  setSearchResults(search);
</script>

<Story name="Empty" args={{ query: "" }} />
<Story name="Single Term" args={{ query: "documents" }} />
<Story name="Multiple Terms" args={{ query: "multi term query" }} />
<Story
  name="Complex Terms"
  args={{ query: 'iPhone "steve jobs" -iPad +mac^3' }}
/>
<Story
  name="Boolean Operators"
  args={{ query: "mueller AND report OR memo" }}
/>
<Story
  name="Field Queries"
  args={{
    query: "user:102112 access:public sort:-created_at",
  }}
/>
<Story
  name="Grouped Operators"
  args={{
    query: "(mueller OR watergate) AND NOT report",
  }}
/>
<Story
  name="Prefix Operators"
  args={{
    query: '+mueller -report +"steve jobs"',
  }}
/>
<Story
  name="Date Range"
  args={{
    query: "created_at:[NOW-1MONTH TO *] report",
  }}
/>

<!-- Phase 4: Deserialization produces atoms automatically from query -->
<Story
  name="Atoms / Field Values"
  args={{
    query: "user:102112 access:private",
  }}
/>
<Story
  name="Atoms / Range"
  args={{
    query: "created_at:[NOW-1MONTH TO *] report",
  }}
/>
<Story
  name="Atoms / Sort"
  args={{
    query: "mueller sort:page_count",
  }}
/>
<Story
  name="Atoms / Mixed Query"
  args={{
    query:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
/>
<Story
  name="Atoms / Prefixes"
  args={{
    query: "+user:102112 -access:private",
  }}
/>

<!-- Phase 6: API-backed autocomplete -->
<Story name="API / Autocomplete" args={{ query: "" }} />
<Story
  name="API / Enriched Atoms"
  args={{
    query: "user:7143 organization:10010 project:1",
  }}
/>

<!-- Responsive viewport stories for manual visual audit -->
<Story
  name="Mobile / Empty"
  args={{ query: "" }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
/>
<Story
  name="Mobile / With Atoms"
  args={{
    query:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
/>
<Story
  name="Mobile / Autocomplete Open"
  args={{ query: "" }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
/>
<Story
  name="Tablet / With Atoms"
  args={{
    query:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
  parameters={{ viewport: { defaultViewport: "ipad" } }}
/>
<Story
  name="Tablet / Autocomplete Open"
  args={{ query: "" }}
  parameters={{ viewport: { defaultViewport: "ipad" } }}
/>
