<script lang="ts" context="module">
  export function serialize({
    query,
    filters,
    sort,
    order = "asc",
  }: {
    query?: string;
    filters?: FilterFields;
    sort?: SortField;
    order?: SortOrder;
  }): string {
    const parts: string[] = [];

    // Add main query
    if (query) parts.push(query);

    if (filters) {
      // Add access filter
      if (filters.access) {
        parts.push(`access:${filters.access}`);
      }

      // Add page count filters
      if (filters.minPages && filters.maxPages) {
        parts.push(`pages:[${filters.minPages} TO ${filters.maxPages}]`);
      } else if (filters.minPages) {
        parts.push(`pages:[${filters.minPages} TO *]`);
      } else if (filters.maxPages) {
        parts.push(`pages:[* TO ${filters.maxPages}]`);
      }

      // Add user filters
      if (filters.users?.length) {
        const userPart = filters.users.map((u) => `user:${u.id}`).join(" OR ");
        parts.push(filters.users.length > 1 ? `(${userPart})` : userPart);
      }

      // Add organization filters
      if (filters.orgs?.length) {
        const orgPart = filters.orgs
          .map((o) => `organization:${o.id}`)
          .join(" OR ");
        parts.push(filters.orgs.length > 1 ? `(${orgPart})` : orgPart);
      }

      // Add project filters
      if (filters.projects?.length) {
        const projectPart = filters.projects
          .map((p) => `project:${p.id}`)
          .join(" OR ");
        parts.push(
          filters.projects.length > 1 ? `(${projectPart})` : projectPart,
        );
      }
    }

    if (sort) {
      if (order === "asc") {
        parts.push(`sort:${sort}`);
      } else {
        parts.push(`sort:-${sort}`);
      }
    }

    return parts.join(" ");
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Search from "../forms/Search.svelte";
  import Filter, { type FilterFields, defaultFilters } from "./Filter.svelte";
  import Sort, { type SortField, type SortOrder } from "./Sort.svelte";

  export let query = "";
  export let filters: FilterFields = defaultFilters;
  export let sort: SortField = "created_at";
  export let order: SortOrder = "desc";
  export let fields: SortField[] = ["created_at", "title", "page_count"];
</script>

<div class="search">
  <Search bind:query name="q" />
  <div class="controls">
    <Filter bind:filters />
    <Sort bind:order bind:sort {fields} {query} />
  </div>
</div>

<style>
  .search {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
