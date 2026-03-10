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
  getRangeConfig,
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

    it("matches data_* keys by display name", () => {
      const extra = new Set(["data_Folder", "data_Category", "tag"]);
      const results = getFieldSuggestions("f", extra);
      const values = results.map((r) => r.value);
      expect(values).toContain("data_Folder");
      // "Category" doesn't start with "f"
      expect(values).not.toContain("data_Category");
    });

    it("matches data_* keys by full field name too", () => {
      const extra = new Set(["data_Folder"]);
      const results = getFieldSuggestions("data", extra);
      const values = results.map((r) => r.value);
      expect(values).toContain("data_Folder");
    });

    it("does not include data_* keys without extra fields", () => {
      const results = getFieldSuggestions("Folder");
      expect(results).toEqual([]);
    });

    it("shows data_* label without data_ prefix", () => {
      const extra = new Set(["data_Folder"]);
      const results = getFieldSuggestions("Fol", extra);
      const folder = results.find((r) => r.value === "data_Folder");
      expect(folder?.label).toBe("Folder");
    });

    it("getAllFieldSuggestions includes data_* keys when provided", () => {
      const extra = new Set(["data_Folder", "data_Category"]);
      const results = getAllFieldSuggestions(extra);
      const values = results.map((r) => r.value);
      expect(values).toContain("data_Folder");
      expect(values).toContain("data_Category");
      // display name, not prefixed
      const folder = results.find((r) => r.value === "data_Folder");
      expect(folder?.label).toBe("Folder");
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

    it("returns synthetic FieldDef for data_* fields", () => {
      const field = resolveField("data_Folder");
      expect(field).toBeDefined();
      expect(field!.name).toBe("data_Folder");
      expect(field!.label).toBe("Folder");
      expect(field!.insertBehavior).toBe("field-value-chip");
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

    it("does not trigger for data_ prefix without preloaded data", () => {
      expect(detectTrigger("data_Folder:").stage).toBeNull();
    });

    it("triggers value stage for data_ prefix with preloaded data", () => {
      const preloaded = new Set(["data_Folder"]);
      const result = detectTrigger("data_Folder:", preloaded);
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("data_Folder");
      expect(result.valueFilter).toBe("");
    });

    it("triggers value stage for tag: with preloaded data", () => {
      const preloaded = new Set(["tag"]);
      const result = detectTrigger("tag:", preloaded);
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("tag");
      expect(result.valueFilter).toBe("");
    });

    it("passes filter text for preloaded tag field", () => {
      const preloaded = new Set(["tag"]);
      const result = detectTrigger("tag:imp", preloaded);
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("tag");
      expect(result.valueFilter).toBe("imp");
    });

    it("does not trigger for tag: without preloaded data", () => {
      expect(detectTrigger("tag:").stage).toBeNull();
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

    // Quoted value input
    it("detects quoted value pattern for user field", () => {
      const result = detectTrigger('user:"Alice');
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("user");
      expect(result.valueFilter).toBe("Alice");
    });

    it("detects quoted value with spaces", () => {
      const preloaded = new Set(["data_Book"]);
      const result = detectTrigger('data_Book:"Infinite Jest', preloaded);
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("data_Book");
      expect(result.valueFilter).toBe("Infinite Jest");
    });

    it("detects empty quoted value", () => {
      const result = detectTrigger('user:"');
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("user");
      expect(result.valueFilter).toBe("");
    });

    it("returns correct triggerStart for quoted value", () => {
      const result = detectTrigger('some text user:"Alice');
      expect(result.triggerStart).toBe(10); // "user:" starts at index 10
    });

    it("returns triggerStart for unquoted patterns", () => {
      const result = detectTrigger("some text access:");
      expect(result.triggerStart).toBe(10);
    });

    it("handles +/- prefix in quoted value", () => {
      const result = detectTrigger('+user:"Alice');
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("user");
      expect(result.valueFilter).toBe("Alice");
    });

    it("detects quoted value for tag with preloaded data", () => {
      const preloaded = new Set(["tag"]);
      const result = detectTrigger('tag:"important stuff', preloaded);
      expect(result.stage).toBe("value");
      expect(result.fieldName).toBe("tag");
      expect(result.valueFilter).toBe("important stuff");
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

    it("returns empty for non-async fields without preloaded data", async () => {
      const results = await fetchValueSuggestions("access", "p");
      expect(results).toEqual([]);
    });

    it("returns preloaded suggestions for tag field", async () => {
      const preloaded = {
        tag: [
          { label: "important", value: "important" },
          { label: "review", value: "review" },
        ],
      };
      const results = await fetchValueSuggestions("tag", "", preloaded);
      expect(results).toHaveLength(2);
      expect(results[0].value).toBe("important");
    });

    it("filters preloaded suggestions by prefix", async () => {
      const preloaded = {
        tag: [
          { label: "important", value: "important" },
          { label: "review", value: "review" },
        ],
      };
      const results = await fetchValueSuggestions("tag", "imp", preloaded);
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe("important");
    });

    it("returns preloaded suggestions for data_* fields", async () => {
      const preloaded = {
        data_Folder: [
          { label: "Legal", value: "Legal" },
          { label: "Finance", value: "Finance" },
        ],
      };
      const results = await fetchValueSuggestions(
        "data_Folder",
        "",
        preloaded,
      );
      expect(results).toHaveLength(2);
    });

    it("uses preloaded as default for async fields with empty filter", async () => {
      const preloaded = {
        user: [{ label: "Preloaded User", value: "999" }],
      };
      const results = await fetchValueSuggestions("user", "", preloaded);
      expect(results).toHaveLength(1);
      expect(results[0].label).toBe("Preloaded User");
    });

    it("falls back to API for async fields with filter text", async () => {
      const preloaded = {
        user: [{ label: "Preloaded User", value: "999" }],
      };
      const results = await fetchValueSuggestions("user", "Ali", preloaded);
      // Should call API, not return preloaded
      expect(results).toHaveLength(2);
      expect(results[0].label).toBe("Alice Smith");
    });
  });

  // ── Range config ─────────────────────────────────────────

  describe("getRangeConfig", () => {
    it("returns config for created_at", () => {
      const config = getRangeConfig("created_at");
      expect(config).toBeDefined();
      expect(config!.startLabel).toBe("Start Date");
      expect(config!.endLabel).toBe("End Date");
      expect(config!.shortcuts.length).toBeGreaterThan(0);
    });

    it("returns config for updated_at", () => {
      const config = getRangeConfig("updated_at");
      expect(config).toBeDefined();
      expect(config!.startLabel).toBe("Start Date");
      expect(config!.endLabel).toBe("End Date");
    });

    it("returns config for page_count with no shortcuts", () => {
      const config = getRangeConfig("page_count");
      expect(config).toBeDefined();
      expect(config!.startLabel).toBe("Min. Pages");
      expect(config!.endLabel).toBe("Max. Pages");
      expect(config!.shortcuts).toHaveLength(0);
    });

    it("returns undefined for non-range fields", () => {
      expect(getRangeConfig("access")).toBeUndefined();
      expect(getRangeConfig("user")).toBeUndefined();
      expect(getRangeConfig("title")).toBeUndefined();
    });

    it("resolves aliases to range configs", () => {
      const config = getRangeConfig("pages");
      expect(config).toBeDefined();
      expect(config!.startLabel).toBe("Min. Pages");
    });

    it("date field shortcuts have expected structure", () => {
      const config = getRangeConfig("created_at")!;
      const lastWeek = config.shortcuts.find((s) => s.label === "Last week");
      expect(lastWeek).toBeDefined();
      expect(lastWeek!.lower).toBe("NOW-7DAYS");
      expect(lastWeek!.upper).toBe("*");
    });

    it("date fields have shortcuts but page_count does not", () => {
      expect(getRangeConfig("created_at")!.shortcuts.length).toBeGreaterThan(0);
      expect(getRangeConfig("page_count")!.shortcuts).toHaveLength(0);
    });

    it("shortcuts default to inclusive bounds", () => {
      const config = getRangeConfig("created_at")!;
      for (const shortcut of config.shortcuts) {
        expect(shortcut.inclusiveLower ?? true).toBe(true);
        expect(shortcut.inclusiveUpper ?? true).toBe(true);
      }
    });
  });

  // ── Range field insertBehavior ─────────────────────────────

  describe("range field insertBehavior", () => {
    it("created_at has range-chip insertBehavior", () => {
      const field = resolveField("created_at");
      expect(field?.insertBehavior).toBe("range-chip");
    });

    it("updated_at has range-chip insertBehavior", () => {
      const field = resolveField("updated_at");
      expect(field?.insertBehavior).toBe("range-chip");
    });

    it("page_count has range-chip insertBehavior", () => {
      const field = resolveField("page_count");
      expect(field?.insertBehavior).toBe("range-chip");
    });

    it("pages alias resolves to range-chip", () => {
      const field = resolveField("pages");
      expect(field?.insertBehavior).toBe("range-chip");
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
