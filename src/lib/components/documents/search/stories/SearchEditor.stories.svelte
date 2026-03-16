<script context="module" lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { http, HttpResponse } from "msw";
  import SearchEditorComponent from "../../search/SearchEditor.svelte";
  import { usersList, organizationsList } from "@/test/fixtures/accounts";
  import { projectList } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";
  import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
  import { createApiUrl } from "@/test/handlers/utils";

  const args = {
    initialQuery: "example query",
  };

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
    title: "Components / Documents / Search Editor",
    component: SearchEditorComponent,
    parameters: {
      layout: "centered",
      msw: { handlers: apiHandlers },
      viewport: {
        viewports: INITIAL_VIEWPORTS,
      },
    },
  });

  type Args = ComponentProps<typeof SearchEditorComponent>;
</script>

{#snippet template(storyArgs: Args)}
  <SearchEditorComponent {...storyArgs} />
{/snippet}

<Story name="Empty" args={{ ...args, initialQuery: "" }} {template} />
<Story
  name="Single Term"
  args={{ ...args, initialQuery: "documents" }}
  {template}
/>
<Story
  name="Multiple Terms"
  args={{ ...args, initialQuery: "multi term query" }}
  {template}
/>
<Story
  name="Complex Terms"
  args={{ ...args, initialQuery: 'iPhone "steve jobs" -iPad +mac^3' }}
  {template}
/>
<Story
  name="Boolean Operators"
  args={{ ...args, initialQuery: "mueller AND report OR memo" }}
  {template}
/>
<Story
  name="Field Queries"
  args={{
    ...args,
    initialQuery: "user:102112 access:public sort:-created_at",
  }}
  {template}
/>
<Story
  name="Grouped Operators"
  args={{
    ...args,
    initialQuery: "(mueller OR watergate) AND NOT report",
  }}
  {template}
/>
<Story
  name="Prefix Operators"
  args={{
    ...args,
    initialQuery: '+mueller -report +"steve jobs"',
  }}
  {template}
/>
<Story
  name="Date Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
  {template}
/>

<!-- Phase 4: Deserialization produces atoms automatically from initialQuery -->
<Story
  name="Atoms / Field Values"
  args={{
    ...args,
    initialQuery: "user:102112 access:private",
  }}
  {template}
/>
<Story
  name="Atoms / Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
  {template}
/>
<Story
  name="Atoms / Sort"
  args={{
    ...args,
    initialQuery: "mueller sort:page_count",
  }}
  {template}
/>
<Story
  name="Atoms / Mixed Query"
  args={{
    ...args,
    initialQuery:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
  {template}
/>
<Story
  name="Atoms / Prefixes"
  args={{
    ...args,
    initialQuery: "+user:102112 -access:private",
  }}
  {template}
/>

<!-- Phase 6: API-backed autocomplete -->
<Story
  name="API / Autocomplete"
  args={{ ...args, initialQuery: "" }}
  {template}
/>
<Story
  name="API / Enriched Atoms"
  args={{
    ...args,
    initialQuery: "user:7143 organization:10010 project:1",
  }}
  {template}
/>

<!-- Responsive viewport stories for manual visual audit -->
<Story
  name="Mobile / Empty"
  args={{ ...args, initialQuery: "" }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
  {template}
/>
<Story
  name="Mobile / With Atoms"
  args={{
    ...args,
    initialQuery:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
  {template}
/>
<Story
  name="Mobile / Autocomplete Open"
  args={{ ...args, initialQuery: "" }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
  {template}
/>
<Story
  name="Tablet / With Atoms"
  args={{
    ...args,
    initialQuery:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
  parameters={{ viewport: { defaultViewport: "ipad" } }}
  {template}
/>
<Story
  name="Tablet / Autocomplete Open"
  args={{ ...args, initialQuery: "" }}
  parameters={{ viewport: { defaultViewport: "ipad" } }}
  {template}
/>
