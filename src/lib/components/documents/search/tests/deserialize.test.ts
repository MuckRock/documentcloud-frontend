import { deserialize } from "../deserialize";

import { vi, describe, it, expect } from "vitest";
import { organizationsList, usersList } from "@/test/fixtures/accounts";
import { projectList } from "@/test/fixtures/projects";
import { listUsers, listOrgs } from "$lib/api/accounts";

const mockUser = usersList.results[0];
const mockProjects = projectList.results.slice(0, 2);
const mockOrgs = organizationsList.results.slice(0, 2);

vi.mock("$lib/api/accounts");

const mockListOrgs = vi.fn().mockResolvedValue({
  data: {
    count: 1,
    next: null,
    previous: null,
    results: mockOrgs,
  },
});
const mockListUsers = vi.fn().mockResolvedValue({
  data: {
    count: 1,
    next: null,
    previous: null,
    results: [mockUser],
  },
});

vi.mocked(listOrgs).mockImplementation(mockListOrgs);
vi.mocked(listUsers).mockImplementation(mockListUsers);

vi.mock("$lib/api/projects", () => ({
  list: () =>
    Promise.resolve({
      data: {
        count: 2,
        next: null,
        previous: null,
        results: mockProjects,
      },
    }),
}));

describe("deserialize", () => {
  it("should deserialize a basic query", async () => {
    const query = "foobar";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query,
      sort: undefined,
      order: undefined,
    });
  });

  it("should deserialize user filters", async () => {
    const query = "document user:12345";
    expect(await deserialize(query)).toEqual({
      query,
      filters: {
        users: [mockUser],
      },
      sort: undefined,
      order: undefined,
    });
    expect(mockListUsers).toHaveBeenCalledWith({ id__in: "12345" });
  });

  it("should deserialize organization filters", async () => {
    const query = "document organization:12345 organization:67890";
    expect(await deserialize(query)).toEqual({
      query,
      filters: {
        orgs: mockOrgs,
      },
      sort: undefined,
      order: undefined,
    });
    expect(mockListOrgs).toHaveBeenCalledWith({ id__in: "12345,67890" });
  });

  it("should deserialize multiple project filters", async () => {
    const query = "report (project:45678 OR project:121212)";
    expect(await deserialize(query)).toEqual({
      query,
      filters: {
        projects: mockProjects,
      },
      sort: undefined,
      order: undefined,
    });
  });

  it("should deserialize access filter", async () => {
    const query = "secret access:private";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { access: "private" },
    });
  });

  it("should deserialize page count filters", async () => {
    // with both min and max
    let query = "long pages:[10 TO 20]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { minPages: 10, maxPages: 20 },
    });
    // with only min
    query = "long pages:[10 TO *]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { minPages: 10, maxPages: NaN },
    });
    // with only max
    query = "long pages:[* TO 10]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { minPages: NaN, maxPages: 10 },
      order: undefined,
      sort: undefined,
    });
  });

  it("should deserialize date filters", async () => {
    // with both min and max
    let query = "old created_at:[2023-01-01T00:00:00Z TO 2023-12-31T23:59:59Z]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: {
        minDate: "2023-01-01T00:00:00Z",
        maxDate: "2023-12-31T23:59:59Z",
      },
    });
    // with only min
    query = "old created_at:[2023-01-01T00:00:00Z TO *]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { minDate: "2023-01-01T00:00:00Z", maxDate: "*" },
    });
    // with only max
    query = "old created_at:[* TO 2023-12-31T23:59:59Z]";
    expect(await deserialize(query)).toEqual({
      query,
      filters: { minDate: "*", maxDate: "2023-12-31T23:59:59Z" },
      order: undefined,
      sort: undefined,
    });
  });

  it("should deserialize sort and order", async () => {
    let query = "test sort:title";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query,
      sort: "title",
      direction: "forward",
    });
    query = "test sort:-title";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query,
      sort: "title",
      direction: "reverse",
    });
  });

  it("should preserve any terms wrapped in double quotes", async () => {
    const query = 'test "user:12345"';
    expect(await deserialize(query)).toEqual({
      filters: {},
      query,
      sort: undefined,
      order: undefined,
    });
  });
});
