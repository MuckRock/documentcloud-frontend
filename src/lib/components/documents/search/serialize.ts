import type { SearchProps } from "./types";

export function serialize({
  query,
  filters,
  sort,
  direction = "forward",
}: { query: string } & SearchProps): string {
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
