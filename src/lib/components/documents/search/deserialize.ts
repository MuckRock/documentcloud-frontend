import { listOrgs, listUsers } from "$lib/api/accounts";
import { list as listProjects } from "$lib/api/projects";

import type { SearchProps } from "./types";
import { type FilterFields } from "../Filter.svelte";
import {
  isSortField,
  type SortField,
  type SortDirection,
} from "../Sort.svelte";
import type { Maybe } from "@/lib/api/types";

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
        if (range[1] && range[1] !== "*") filters.minPages = parseInt(range[1]);
        if (range[2] && range[2] !== "*") filters.maxPages = parseInt(range[2]);
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
