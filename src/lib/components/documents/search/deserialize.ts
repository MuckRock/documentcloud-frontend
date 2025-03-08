import { listOrgs, listUsers } from "$lib/api/accounts";
import { list as listProjects } from "$lib/api/projects";

import type { SearchProps } from "./types";
import { type FilterFields } from "../Filter.svelte";
import { type SortField, type SortDirection } from "../Sort.svelte";
import type { Maybe } from "@/lib/api/types";
import { walkTree, isNodeRangedTerm, isNodeTerm } from "$lib/utils/search";
import { parse } from "./parse";
import type { Node } from "lucene";

export async function deserialize(queryString: string): Promise<SearchProps> {
  const filters: FilterFields = {};
  let sort: Maybe<SortField>;
  let direction: Maybe<SortDirection>;
  const filtersToFetch: Record<string, string[]> = {
    users: [],
    projects: [],
    orgs: [],
  };

  const addToFilters = (node: Node) => {
    if (isNodeTerm(node)) {
      switch (node.field) {
        case "<implicit>":
          break;
        case "user":
          filtersToFetch.users?.push(node.term);
          break;
        case "organization":
          filtersToFetch.orgs?.push(node.term);
          break;
        case "project":
          filtersToFetch.projects?.push(node.term);
          break;
        case "access":
          filters.access = node.term;
          break;
        case "sort":
          sort = node.term as SortField;
          direction = node.prefix === "-" ? "reverse" : "forward";
          break;
      }
    } else if (isNodeRangedTerm(node)) {
      switch (node.field) {
        case "pages":
        case "page_count":
          filters.minPages = parseInt(node.term_min, 10);
          filters.maxPages = parseInt(node.term_max, 10);
          break;
        case "created_at":
          filters.minDate = node.term_min;
          filters.maxDate = node.term_max;
          break;
      }
    }
  };
  walkTree(parse(queryString), addToFilters);

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
    filters,
    sort,
    direction,
  };
}
