import { describe, it, expect } from "vitest";
import { serialize } from "../Search.svelte";
import type { FilterFields } from "../Filter.svelte";
import type { SortField, SortOrder } from "../Sort.svelte";
import type { Project, User } from "@/lib/api/types";

interface SearchProps {
  query?: string;
  filters?: FilterFields;
  sort?: SortField;
  order?: SortOrder;
}

describe("Search.svelte", () => {
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
        },
      };
      expect(serialize(props)).toBe("document user:12345");
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
});
