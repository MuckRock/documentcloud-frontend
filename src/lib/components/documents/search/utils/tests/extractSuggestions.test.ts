import { describe, it, expect } from "vitest";
import type { Document, Org, User } from "$lib/api/types";
import { extractSuggestions } from "../extractSuggestions";

/** Helper to create a minimal expanded Document for testing. */
function makeDoc(
  overrides: Partial<Document> & { id: number | string; title: string },
): Document {
  const { id, title, ...rest } = overrides;
  return {
    id,
    user: 1,
    organization: 1,
    access: "public",
    status: "success",
    title,
    slug: "test",
    language: "eng",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    page_count: 1,
    edit_access: false,
    notes: [],
    data: {},
    ...rest,
  } as Document;
}

function makeUser(
  id: number,
  name: string | undefined,
  username: string,
): User {
  return {
    uuid: `uuid-${id}`,
    id,
    username,
    name,
    avatar_url: undefined,
    organization: 1,
    organizations: [1],
    admin_organizations: [],
  };
}

function makeOrg(id: number, name: string, individual = false): Org {
  return {
    uuid: `uuid-org-${id}`,
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    avatar_url: "",
    individual,
  };
}

describe("extractSuggestions", () => {
  it("extracts users with name and username formatting", () => {
    const docs = [
      makeDoc({
        id: 1,
        title: "Doc 1",
        user: makeUser(10, "Alice Smith", "asmith"),
      }),
      makeDoc({
        id: 2,
        title: "Doc 2",
        user: makeUser(20, undefined, "bob"),
      }),
    ];

    const result = extractSuggestions(docs);
    expect(result.user).toEqual([
      {
        label: "Alice Smith (asmith)",
        displayValue: "Alice Smith",
        value: "10",
      },
      { label: "bob", displayValue: "bob", value: "20" },
    ]);
  });

  it("filters out individual orgs", () => {
    const docs = [
      makeDoc({
        id: 1,
        title: "Doc 1",
        organization: makeOrg(100, "MuckRock", false),
      }),
      makeDoc({
        id: 2,
        title: "Doc 2",
        organization: makeOrg(200, "Alice Smith", true),
      }),
      makeDoc({
        id: 3,
        title: "Doc 3",
        organization: makeOrg(300, "News Corp", false),
      }),
    ];

    const result = extractSuggestions(docs);
    expect(result.organization).toEqual([
      { label: "MuckRock", value: "100" },
      { label: "News Corp", value: "300" },
    ]);
  });

  it("extracts documents", () => {
    const docs = [
      makeDoc({ id: 1, title: "First Doc" }),
      makeDoc({ id: 2, title: "Second Doc" }),
    ];

    const result = extractSuggestions(docs);
    expect(result.document).toEqual([
      { label: "First Doc", value: "1" },
      { label: "Second Doc", value: "2" },
    ]);
  });

  it("extracts tags from doc.data._tag", () => {
    const docs = [
      makeDoc({
        id: 1,
        title: "Doc 1",
        data: { _tag: ["politics", "government"] },
      }),
      makeDoc({
        id: 2,
        title: "Doc 2",
        data: { _tag: ["politics", "law"] },
      }),
    ];

    const result = extractSuggestions(docs);
    expect(result.tag).toEqual([
      { label: "politics", value: "politics" },
      { label: "government", value: "government" },
      { label: "law", value: "law" },
    ]);
  });

  it("extracts data_* fields", () => {
    const docs = [
      makeDoc({
        id: 1,
        title: "Doc 1",
        data: { state: ["MA", "NY"] },
      }),
      makeDoc({
        id: 2,
        title: "Doc 2",
        data: { state: ["MA", "CA"] },
      }),
    ];

    const result = extractSuggestions(docs);
    expect(result.data_state).toEqual([
      { label: "MA", value: "MA" },
      { label: "NY", value: "NY" },
      { label: "CA", value: "CA" },
    ]);
  });

  it("deduplicates users across documents", () => {
    const user = makeUser(10, "Alice", "alice");
    const docs = [
      makeDoc({ id: 1, title: "Doc 1", user }),
      makeDoc({ id: 2, title: "Doc 2", user }),
    ];

    const result = extractSuggestions(docs);
    expect(result.user).toHaveLength(1);
  });

  it("returns empty result for empty input", () => {
    const result = extractSuggestions([]);
    expect(result).toEqual({});
  });

  it("skips orgs where individual is undefined (numeric org)", () => {
    const docs = [makeDoc({ id: 1, title: "Doc 1", organization: 42 })];
    const result = extractSuggestions(docs);
    expect(result.organization).toBeUndefined();
  });
});
