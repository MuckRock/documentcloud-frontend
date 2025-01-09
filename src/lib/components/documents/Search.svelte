<script lang="ts" context="module">
  import { listOrgs, listUsers } from "@/lib/api/accounts";
  import { list as listProjects } from "@/lib/api/projects";

  export interface SearchProps {
    query?: string;
    filters?: FilterFields;
    sort?: SortField;
    order?: SortOrder;
  }

  export function serialize({
    query,
    filters,
    sort,
    order = "asc",
  }: SearchProps): string {
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

  export async function deserialize(queryString: string): Promise<SearchProps> {
    const filters: FilterFields = {};
    let mainQuery: string[] = [];
    let sort: Maybe<SortField>;
    let order: Maybe<SortOrder>;
    const filtersToFetch: Record<string, string[]> = {
      users: [],
      projects: [],
      orgs: [],
    };

    // Split on whitespace that's not inside parentheses, brackets, or double quotation marks
    const parts =
      queryString.match(
        /(?:[^\s:]+:[^\s\[\]()]*\[[^\]]*\]|\([^)]*\)|"[^"]*"|[^:\s\[\]()]+(?:[^\s\[\]()]+)?)/g,
      ) || [];

    for (const part of parts) {
      if (part.startsWith("sort:")) {
        let value: Maybe<string> = part.split(":")[1];
        let valueOrder: SortOrder = "asc";
        if (value?.startsWith("-")) {
          value = value.slice(1);
          valueOrder = "desc";
        }
        if (isSortField(value)) {
          sort = value;
          order = valueOrder;
        }
      } else if (part.startsWith("access:")) {
        filters.access = part.split(":")[1];
      } else if (part.startsWith("pages:[")) {
        const range = part.match(/pages:\[(\d+|\*)\sTO\s(\d+|\*)\]/);
        if (range) {
          if (range[1] && range[1] !== "*")
            filters.minPages = parseInt(range[1]);
          if (range[2] && range[2] !== "*")
            filters.maxPages = parseInt(range[2]);
        }
      } else if (part.startsWith("(")) {
        // Handle grouped conditions
        const group = part.slice(1, -1);
        const items = group.split(" OR ");
        items.forEach((item) => {
          const [type, id] = item.split(":");
          if (type === "user" && id) {
            filtersToFetch.users?.push(id);
          } else if (type === "organization" && id) {
            filtersToFetch.orgs?.push(id);
          } else if (type === "project" && id) {
            filtersToFetch.projects?.push(id);
          }
        });
      } else if (part.endsWith(")")) {
        // Ignore closing parenthesis
      } else if (!part.startsWith('"') && part.includes(":")) {
        const [type, id] = part.split(":");
        if (type === "user" && id) {
          filtersToFetch.users?.push(id);
        } else if (type === "organization" && id) {
          filtersToFetch.orgs?.push(id);
        } else if (type === "project" && id) {
          filtersToFetch.projects?.push(id);
        }
      } else {
        mainQuery.push(part);
      }
    }

    // Now, need to fetch the users, projects, and orgs by their IDs
    // and update the filters object with the fetched data
    if (filtersToFetch.users?.length) {
      // fetch users and add to filters
      const id__in = filtersToFetch.users.join(",");
      const { data, error } = await listUsers({ id__in });
      if (data && !error) {
        filters.users = data.results;
      }
    }
    if (filtersToFetch.orgs?.length) {
      // fetch orgs and add to filters
      const id__in = filtersToFetch.orgs.join(",");
      const { data, error } = await listOrgs({ id__in });
      if (data && !error) {
        filters.orgs = data.results;
      }
    }
    if (filtersToFetch.projects?.length) {
      // fetch projects and add to filters
      const id__in = filtersToFetch.projects.join(",");
      const { data, error } = await listProjects({ id__in });
      if (data && !error) {
        filters.projects = data.results;
      }
    }

    return {
      query: mainQuery.join(" "),
      filters,
      sort,
      order,
    };
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Search from "../forms/Search.svelte";
  import Filter, { type FilterFields, defaultFilters } from "./Filter.svelte";
  import Sort, {
    isSortField,
    type SortField,
    type SortOrder,
  } from "./Sort.svelte";
  import type { Maybe, Nullable } from "@/lib/api/types";
  import { page } from "$app/stores";

  export let query = "";
  export let filters: FilterFields = defaultFilters;
  export let sort: SortField = "score";
  export let order: SortOrder = "desc";
  export let fields: SortField[] = [
    "score",
    "updated_at",
    "created_at",
    "page_count",
    "title",
  ];

  let form: Nullable<HTMLFormElement>;

  async function updatePropsFromQuery(pageUrlQuery: string) {
    const deserializedProps = await deserialize(pageUrlQuery);
    query = deserializedProps.query ?? query;
    sort = deserializedProps.sort ?? sort;
    order = deserializedProps.order ?? order;
    filters = Object.assign({}, filters, deserializedProps.filters);
  }

  function onChange() {
    form?.submit();
  }

  $: formatSearchString = (query: string) =>
    serialize({ query, filters, sort, order });
  $: {
    updatePropsFromQuery($page.url.searchParams?.get("q") ?? "");
  }
</script>

<div class="search">
  <div class="text">
    <Search bind:query bind:form {formatSearchString} name="q" />
  </div>
  <div class="controls">
    <Filter bind:filters {onChange} />
    <Sort bind:order bind:sort {fields} {query} {onChange} />
  </div>
</div>

<style>
  .search {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .text {
    flex: 1;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
