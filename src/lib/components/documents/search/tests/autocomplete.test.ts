import { vi, describe, it, expect } from "vitest";
import {
  getAllFieldSuggestions,
  getFieldSuggestions,
  getValueSuggestions,
  detectTrigger,
  resolveField,
  resolveFieldName,
  isAsyncField,
  fetchValueSuggestions,
  fetchDisplayNames,
} from "../autocomplete-data";

// Mock the API modules
vi.mock("$lib/api/accounts", () => ({
  listUsers: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 100, name: "Alice Smith", username: "alice" },
        { id: 101, name: "Alice Jones", username: "alicej" },
      ],
    },
  }),
  listOrgs: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 200, name: "Acme Corp" },
        { id: 201, name: "Alpha Inc" },
      ],
    },
  }),
}));

vi.mock("$lib/api/projects", () => ({
  list: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 300, title: "Project Alpha" },
        { id: 301, title: "Project Beta" },
      ],
    },
  }),
}));

vi.mock("$lib/api/documents", () => ({
  search: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 400, title: "Test Document" },
        { id: 401, title: "Test Report" },
      ],
    },
  }),
}));

describe("autocomplete-data", () => {
  // ── Field suggestions ───────────────────────────────────────

  describe("getFieldSuggestions", () => {
    it("returns empty for empty filter", () => {
      expect(getFieldSuggestions("")).toEqual([]);
    });

    it("getAllFieldSuggestions returns all fields (for / shortcut)", () => {
      const results = getAllFieldSuggestions();
      expect(results.length).toBeGreaterThan(0);
      const values = results.map((r) => r.value);
      expect(values).toContain("access");
      expect(values).toContain("user");
      expect(values).toContain("sort");
      expect(values).toContain("title");
    });

    it("matches field names by prefix", () => {
      const results = getFieldSuggestions("us");
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe("user");
    });

    it("matches field labels by prefix (case-insensitive)", () => {
      const results = getFieldSuggestions("Acc");
      expect(results.some((r) => r.value === "access")).toBe(true);
    });

    it("matches aliases", () => {
      const results = getFieldSuggestions("acc");
      // "access" matches directly, "account" alias also matches → "user"
      expect(results.some((r) => r.value === "access")).toBe(true);
      expect(results.some((r) => r.value === "user")).toBe(true);
    });

    it("typing 'titl' returns title", () => {
      const results = getFieldSuggestions("titl");
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe("title");
    });

    it("typing 'so' returns sort and source", () => {
      const results = getFieldSuggestions("so");
      const values = results.map((r) => r.value);
      expect(values).toContain("sort");
      expect(values).toContain("source");
    });

    it("typing 's' returns multiple matches", () => {
      const results = getFieldSuggestions("s");
      const values = results.map((r) => r.value);
      expect(values).toContain("status");
      expect(values).toContain("sort");
      expect(values).toContain("source");
      expect(values).toContain("slug");
    });

    it("returns no duplicates when alias and field both match", () => {
      // "project" matches directly; "projects" alias also maps to "project"
      const results = getFieldSuggestions("project");
      const projectResults = results.filter((r) => r.value === "project");
      expect(projectResults).toHaveLength(1);
    });

    it("returns empty for unrecognized prefix", () => {
      expect(getFieldSuggestions("xyz")).toEqual([]);
    });
  });

  // ── Value suggestions ───────────────────────────────────────

  describe("getValueSuggestions", () => {
    it("returns all access values with empty filter", () => {
      const results = getValueSuggestions("access", "");
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.value)).toEqual([
        "public",
        "organization",
        "private",
      ]);
    });

    it("filters access values by prefix", () => {
      const results = getValueSuggestions("access", "p");
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.value)).toContain("public");
      expect(results.map((r) => r.value)).toContain("private");
    });

    it("returns all status values with empty filter", () => {
      const results = getValueSuggestions("status", "");
      expect(results).toHaveLength(5);
    });

    it("filters status values", () => {
      const results = getValueSuggestions("status", "s");
      expect(results.map((r) => r.value)).toEqual(["success"]);
    });

    it("returns language values", () => {
      const results = getValueSuggestions("language", "");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.value === "eng")).toBe(true);
    });

    it("filters language by label", () => {
      const results = getValueSuggestions("language", "Sp");
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe("spa");
    });

    it("returns sort options", () => {
      const results = getValueSuggestions("sort", "");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.value === "created_at")).toBe(true);
      expect(results.some((r) => r.value === "score")).toBe(true);
    });

    it("filters sort options", () => {
      const results = getValueSuggestions("sort", "title");
      expect(results).toHaveLength(2); // Title A-Z and Z-A
    });

    it("returns empty for async fields (no static values)", () => {
      expect(getValueSuggestions("user", "")).toEqual([]);
      expect(getValueSuggestions("organization", "")).toEqual([]);
    });

    it("returns empty for text fields without values", () => {
      expect(getValueSuggestions("title", "")).toEqual([]);
    });

    it("resolves aliases for value lookup", () => {
      // "order" is an alias for "sort"
      const results = getValueSuggestions("order", "");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ── Field resolution ────────────────────────────────────────

  describe("resolveField / resolveFieldName", () => {
    it("resolves canonical field names", () => {
      expect(resolveField("access")?.name).toBe("access");
      expect(resolveField("user")?.name).toBe("user");
    });

    it("resolves aliases", () => {
      expect(resolveFieldName("account")).toBe("user");
      expect(resolveFieldName("group")).toBe("organization");
      expect(resolveFieldName("projects")).toBe("project");
      expect(resolveFieldName("id")).toBe("document");
      expect(resolveFieldName("pages")).toBe("page_count");
      expect(resolveFieldName("doctext")).toBe("text");
      expect(resolveFieldName("order")).toBe("sort");
    });

    it("resolveField returns field def for aliases", () => {
      const field = resolveField("account");
      expect(field?.name).toBe("user");
      expect(field?.insertBehavior).toBe("field-value-chip");
    });

    it("returns undefined for unknown fields", () => {
      expect(resolveField("nonexistent")).toBeUndefined();
    });
  });

  // ── Trigger detection ───────────────────────────────────────

  describe("detectTrigger", () => {
    it("returns null stage for empty string", () => {
      expect(detectTrigger("").stage).toBeNull();
    });

    it("returns field stage for partial field name", () => {
      const result = detectTrigger("acc");
      expect(result.stage).toBe("field");
      expect(result.fieldFilter).toBe("acc");
    });

    it("returns field stage for single character", () => {
      const result = detectTrigger("s");
      expect(result.stage).toBe("field");
      expect(result.fieldFilter).toBe("s");
    });

    it("returns field stage for word after space", () => {
      const result = detectTrigger("mueller us");
      expect(result.stage).toBe("field");
      expect(result.fieldFilter).toBe("us");
    });

    it("returns value stage for access:", () => {
      const result = detectTrigger("access:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("access");
      expect(result.valueFilter).toBe("");
    });

    it("returns value stage for access:p", () => {
      const result = detectTrigger("access:p");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("access");
      expect(result.valueFilter).toBe("p");
    });

    it("returns value stage for sort:", () => {
      const result = detectTrigger("sort:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("sort");
      expect(result.valueFilter).toBe("");
    });

    it("returns value stage with alias (order:)", () => {
      const result = detectTrigger("order:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("sort");
    });

    it("returns null for plain-text field with colon (title:)", () => {
      expect(detectTrigger("title:").stage).toBeNull();
    });

    it("returns null for text:something", () => {
      expect(detectTrigger("text:something").stage).toBeNull();
    });

    it("returns null for unknown field (xyz:)", () => {
      expect(detectTrigger("xyz:").stage).toBeNull();
    });

    it("handles +/- prefix before field name", () => {
      const result = detectTrigger("+access:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("access");
    });

    it("handles field:value after other content", () => {
      const result = detectTrigger("mueller AND status:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("status");
      expect(result.valueFilter).toBe("");
    });

    it("returns null for numeric text", () => {
      expect(detectTrigger("12345").stage).toBeNull();
    });

    it("returns null when only whitespace after last space", () => {
      expect(detectTrigger("mueller ").stage).toBeNull();
    });

    it("does not trigger for data_ prefix (no suggestions)", () => {
      expect(detectTrigger("data_Folder:").stage).toBeNull();
    });

    // Phase 6: async entity fields now trigger value stage
    it("returns value stage for user:", () => {
      const result = detectTrigger("user:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("user");
      expect(result.valueFilter).toBe("");
    });

    it("returns value stage for organization:", () => {
      const result = detectTrigger("organization:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("organization");
    });

    it("returns value stage for project:", () => {
      const result = detectTrigger("project:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("project");
    });

    it("returns value stage for document:", () => {
      const result = detectTrigger("document:");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("document");
    });

    it("returns value stage for user: with filter text", () => {
      const result = detectTrigger("user:ali");
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("user");
      expect(result.valueFilter).toBe("ali");
    });
  });

  // ── isAsyncField ──────────────────────────────────────────

  describe("isAsyncField", () => {
    it("returns true for entity fields", () => {
      expect(isAsyncField("user")).toBe(true);
      expect(isAsyncField("organization")).toBe(true);
      expect(isAsyncField("project")).toBe(true);
      expect(isAsyncField("document")).toBe(true);
    });

    it("returns true for aliases of entity fields", () => {
      expect(isAsyncField("account")).toBe(true);
      expect(isAsyncField("group")).toBe(true);
      expect(isAsyncField("id")).toBe(true);
    });

    it("returns false for static and text fields", () => {
      expect(isAsyncField("access")).toBe(false);
      expect(isAsyncField("status")).toBe(false);
      expect(isAsyncField("sort")).toBe(false);
      expect(isAsyncField("title")).toBe(false);
      expect(isAsyncField("tag")).toBe(false);
    });
  });

  // ── fetchValueSuggestions ─────────────────────────────────

  describe("fetchValueSuggestions", () => {
    it("fetches user suggestions", async () => {
      const results = await fetchValueSuggestions("user", "Ali");
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ label: "Alice Smith", value: "100" });
      expect(results[1]).toEqual({ label: "Alice Jones", value: "101" });
    });

    it("fetches organization suggestions", async () => {
      const results = await fetchValueSuggestions("organization", "A");
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ label: "Acme Corp", value: "200" });
    });

    it("fetches project suggestions", async () => {
      const results = await fetchValueSuggestions("project", "Pro");
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ label: "Project Alpha", value: "300" });
    });

    it("fetches document suggestions", async () => {
      const results = await fetchValueSuggestions("document", "Te");
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ label: "Test Document", value: "400" });
    });

    it("fetches document suggestions with empty filter", async () => {
      const results = await fetchValueSuggestions("document", "");
      expect(results).toHaveLength(2);
    });

    it("returns empty for non-async fields", async () => {
      const results = await fetchValueSuggestions("access", "p");
      expect(results).toEqual([]);
    });
  });

  // ── fetchDisplayNames ─────────────────────────────────────

  describe("fetchDisplayNames", () => {
    it("fetches display names for entity nodes", async () => {
      const names = await fetchDisplayNames([
        { field: "user", value: "100" },
        { field: "organization", value: "200" },
        { field: "project", value: "300" },
      ]);

      expect(names.get("user:100")).toBe("Alice Smith");
      expect(names.get("organization:200")).toBe("Acme Corp");
      expect(names.get("project:300")).toBe("Project Alpha");
    });

    it("returns empty map for empty input", async () => {
      const names = await fetchDisplayNames([]);
      expect(names.size).toBe(0);
    });

    it("ignores non-async fields", async () => {
      const names = await fetchDisplayNames([
        { field: "access", value: "public" },
      ]);
      expect(names.size).toBe(0);
    });
  });
});
