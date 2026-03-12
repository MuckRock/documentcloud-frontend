<script lang="ts" module>
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { http, HttpResponse } from "msw";
  import SearchEditorComponent from "../../search/SearchEditor.svelte";
  import { usersList, organizationsList } from "@/test/fixtures/accounts";
  import { projectList } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";
  import { createApiUrl } from "@/test/handlers/utils";

  const args = {
    initialQuery: "example query",
  };

  // MSW handlers for API-backed autocomplete and chip enrichment.
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
      const prefix = url.searchParams
        .get("title__istartswith")
        ?.toLowerCase();
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
      if (titleMatch) {
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

  export const meta = {
    title: "Components / Documents / Search Editor",
    component: SearchEditorComponent,
    parameters: {
      layout: "centered",
      msw: { handlers: apiHandlers },
    },
  };
</script>

<Template >
  {#snippet children({ args })}
    <SearchEditorComponent {...args} />
  {/snippet}
</Template>

<Story name="Empty" args={{ ...args, initialQuery: "" }} />
<Story name="Single Term" args={{ ...args, initialQuery: "documents" }} />
<Story
  name="Multiple Terms"
  args={{ ...args, initialQuery: "multi term query" }}
/>
<Story
  name="Complex Terms"
  args={{ ...args, initialQuery: 'iPhone "steve jobs" -iPad +mac^3' }}
/>
<Story
  name="Boolean Operators"
  args={{ ...args, initialQuery: "mueller AND report OR memo" }}
/>
<Story
  name="Field Queries"
  args={{
    ...args,
    initialQuery: "user:102112 access:public sort:-created_at",
  }}
/>
<Story
  name="Grouped Operators"
  args={{
    ...args,
    initialQuery: "(mueller OR watergate) AND NOT report",
  }}
/>
<Story
  name="Prefix Operators"
  args={{
    ...args,
    initialQuery: '+mueller -report +"steve jobs"',
  }}
/>
<Story
  name="Date Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
/>

<!-- Phase 4: Deserialization produces chips automatically from initialQuery -->
<Story
  name="Chips / Field Values"
  args={{
    ...args,
    initialQuery: "user:102112 access:private",
  }}
/>
<Story
  name="Chips / Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
/>
<Story
  name="Chips / Sort"
  args={{
    ...args,
    initialQuery: "mueller sort:page_count",
  }}
/>
<Story
  name="Chips / Mixed Query"
  args={{
    ...args,
    initialQuery:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
/>
<Story
  name="Chips / Prefixes"
  args={{
    ...args,
    initialQuery: "+user:102112 -access:private",
  }}
/>

<!-- Phase 6: API-backed autocomplete -->
<Story
  name="API / Autocomplete"
  args={{ ...args, initialQuery: "" }}
/>
<Story
  name="API / Enriched Chips"
  args={{
    ...args,
    initialQuery: "user:7143 organization:10010 project:1",
  }}
/>
