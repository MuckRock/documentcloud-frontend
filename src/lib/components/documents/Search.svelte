<script lang="ts" context="module">
  import { listOrgs, listUsers } from "@/lib/api/accounts";
  import { list as listProjects } from "@/lib/api/projects";

  export interface SearchProps {
    query?: string;
    filters?: FilterFields;
    sort?: SortField;
    direction?: SortDirection;
  }

  export function serialize({
    query,
    filters,
    sort,
    direction = "forward",
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

      // Add date filters
      if (filters.minDate && filters.maxDate) {
        parts.push(
          `created_at:[${filters.minDate.split("T")[0]}T00:00:00Z TO ${filters.maxDate.split("T")[0]}T23:59:59Z]`,
        );
      } else if (filters.minDate) {
        parts.push(
          `created_at:[${filters.minDate.split("T")[0]}T00:00:00Z TO *]`,
        );
      } else if (filters.maxDate) {
        parts.push(
          `created_at:[* TO ${filters.maxDate.split("T")[0]}T23:59:59Z]`,
        );
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
      if (direction === "forward") {
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
    let direction: Maybe<SortDirection>;
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
        let valueDirection: SortDirection = "forward";
        if (value?.startsWith("-")) {
          value = value.slice(1);
          valueDirection = "reverse";
        }
        if (isSortField(value)) {
          sort = value;
          direction = valueDirection;
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
      } else if (part.startsWith("created_at:[")) {
        const range = part.match(
          /created_at:\[([0-9-]+T[0-9:]+Z|\*)\sTO\s([0-9-]+T[0-9:]+Z|\*)\]/,
        );
        if (range) {
          if (range[1] && range[1] !== "*")
            filters.minDate = range[1].split("T")[0];
          if (range[2] && range[2] !== "*")
            filters.maxDate = range[2].split("T")[0];
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
      direction,
    };
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import type { Maybe } from "$lib/api/types";
  import Search from "../inputs/Search.svelte";
  import Filter, { type FilterFields, defaultFilters } from "./Filter.svelte";
  import Sort, {
    isSortField,
    type SortField,
    type SortDirection,
  } from "./Sort.svelte";

  export let query = "";
  export let filters: FilterFields = defaultFilters;
  export let sort: SortField = "score";
  export let direction: SortDirection = "forward";
  export let otherParams: Record<string, string> = {};

  let form: HTMLFormElement;

  const fields: SortField[] = ["score", "created_at", "page_count", "title"];

  async function updatePropsFromQuery(pageUrlQuery: string) {
    const deserializedProps = await deserialize(pageUrlQuery);
    query = deserializedProps.query ?? query;
    sort = deserializedProps.sort ?? sort;
    direction = deserializedProps.direction ?? direction;
    filters = Object.assign({}, filters, deserializedProps.filters);
  }

  function submit(search: string) {
    const url = new URL($page.url);
    url.search = search;
    Object.entries(otherParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    return goto(url);
  }

  // When the page URL updates, we should update the query, filters, and sorting
  $: {
    updatePropsFromQuery($page.url.searchParams?.get("q") ?? "");
  }

  // We should call the submit function when the search parameters change
  $: {
    const search = serialize({ query, filters, sort, direction });
    submit(search);
  }

  // DEBUG LOGGING STRINGS: REMOVE BEFORE MERGE
  // $: {
  //   console.log({
  //     query,
  //     filters,
  //     sort,
  //     direction,
  //     // searchString: formatSearchString(query),
  //   });
  // }
  // $: {
  //   console.log(formatSearchString(query));
  // }
</script>

<form class="search" bind:this={form} on:submit={submit}>
  <div class="text">
    <Search name="q" bind:value={query} />
  </div>
  <div class="controls">
    <Filter bind:filters />
    <Sort bind:direction bind:sort {fields} />
  </div>
</form>

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
