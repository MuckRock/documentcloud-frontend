import { vi, describe, it, expect, type Mock } from "vitest";
import { serialize, deserialize, type SearchProps } from "../Search.svelte";
import type { Org, Project, User } from "@/lib/api/types";
import { organizationsList, usersList } from "@/test/fixtures/accounts";
import { projectList } from "@/test/fixtures/projects";
import { listUsers, listOrgs } from "@/lib/api/accounts";

const mockUser = usersList.results[0];
const mockProjects = projectList.results.slice(0, 2);
const mockOrgs = organizationsList.results.slice(0, 2);

vi.mock("@/lib/api/accounts");

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

vi.mock("@/lib/api/projects", () => ({
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

describe("serialize", () => {
  it("should serialize a basic query", () => {
    const props: SearchProps = { query: "foobar" };
    expect(serialize(props)).toBe("foobar");
  });

  it("should serialize filters", () => {
    const props: SearchProps = {
      query: "document",
      filters: {
        users: [{ id: 12345, name: "Test User" }] as User[],
        orgs: [{ id: 12345, name: "Test Org" }] as Org[],
      },
    };
    expect(serialize(props)).toBe("document user:12345 organization:12345");
  });

  it("should serialize multiple filters with OR", () => {
    const props: SearchProps = {
      query: "report",
      filters: {
        projects: [
          { id: 45678, title: "Project 1" },
          { id: 121212, title: "Project 2" },
        ] as Project[],
      },
    };
    expect(serialize(props)).toBe("report (project:45678 OR project:121212)");
  });

  it("should serialize access filter", () => {
    const props: SearchProps = {
      query: "secret",
      filters: { access: "private" },
    };
    expect(serialize(props)).toBe("secret access:private");
  });

  it("should serialize page count filters", () => {
    // with both min and max
    let props: SearchProps = {
      query: "long",
      filters: { minPages: 10, maxPages: 20 },
    };
    expect(serialize(props)).toBe("long pages:[10 TO 20]");

    // with only min
    props = {
      query: "long",
      filters: { minPages: 10 },
    };
    expect(serialize(props)).toBe("long pages:[10 TO *]");

    // with only max
    props = {
      query: "long",
      filters: { maxPages: 20 },
    };
    expect(serialize(props)).toBe("long pages:[* TO 20]");
  });

  it("should serialize sort and order", () => {
    // in ascending order, the sort is positive
    let props: SearchProps = {
      query: "test",
      sort: "title",
      order: "asc",
    };
    expect(serialize(props)).toBe("test sort:title");
    // in descending order, the sort is negative
    props = {
      query: "test",
      sort: "title",
      order: "desc",
    };
    expect(serialize(props)).toBe("test sort:-title");
  });
});

describe("deserialize", () => {
  it("should deserialize a basic query", async () => {
    const query = "foobar";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query: "foobar",
      sort: undefined,
      order: undefined,
    });
  });

  it("should deserialize user filters", async () => {
    const query = "document user:12345";
    expect(await deserialize(query)).toEqual({
      query: "document",
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
      query: "document",
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
      query: "report",
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
      query: "secret",
      filters: { access: "private" },
    });
  });

  it("should deserialize page count filters", async () => {
    // with both min and max
    let query = "long pages:[10 TO 20]";
    expect(await deserialize(query)).toEqual({
      query: "long",
      filters: { minPages: 10, maxPages: 20 },
    });
    // with only min
    query = "long pages:[10 TO *]";
    expect(await deserialize(query)).toEqual({
      query: "long",
      filters: { minPages: 10 },
    });
    // with only max
    query = "long pages:[* TO 10]";
    expect(await deserialize(query)).toEqual({
      query: "long",
      filters: { maxPages: 10 },
      order: undefined,
      sort: undefined,
    });
  });

  it("should deserialize sort and order", async () => {
    let query = "test sort:title";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query: "test",
      sort: "title",
      order: "asc",
    });
    query = "test sort:-title";
    expect(await deserialize(query)).toEqual({
      filters: {},
      query: "test",
      sort: "title",
      order: "desc",
    });
  });

  it("should preserve any terms wrapped in double quotes", async () => {
    const query = 'test "user:12345"';
    expect(await deserialize(query)).toEqual({
      filters: {},
      query: 'test "user:12345"',
      sort: undefined,
      order: undefined,
    });
  });
});
