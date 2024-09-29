import { vi, test, describe, it, expect, beforeEach, afterEach } from "vitest";
import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config";
import { addonsList, run } from "@/test/fixtures/addons";
import { emptyList } from "@/test/fixtures/common";
import * as addons from "../addons";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAddons", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => addonsList });
  });
  it("calls the addons API endpoint", async () => {
    await addons.getAddons({}, mockFetch);
    const expectedEndpoint = new URL("addons/", BASE_API_URL);
    expect(mockFetch).toHaveBeenCalledWith(
      expectedEndpoint,
      expect.any(Object),
    );
  });
  it("passes parameters through as query arguments", async () => {
    await addons.getAddons(
      { active: true, featured: true, query: "foobar" },
      mockFetch,
    );
    const expectedEndpoint = new URL("addons/", BASE_API_URL);
    expectedEndpoint.searchParams.set("active", "true");
    expectedEndpoint.searchParams.set("featured", "true");
    expectedEndpoint.searchParams.set("query", "foobar");
    expect(mockFetch).toHaveBeenCalledWith(
      expectedEndpoint,
      expect.any(Object),
    );
  });
  it("returns the full list", async () => {
    const { data: response, error } = await addons.getAddons({}, mockFetch);
    expect(error).toBeUndefined();
    expect(response).toBe(addonsList);
  });
  it("calls SvelteKit's error fn given a response error", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error!",
    });
    await expect(addons.getAddons({}, mockFetch)).rejects.toThrowError();
  });

  test("getPinnedAddons", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => {} });
    await addons.getPinnedAddons(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`addons/?active=true`, BASE_API_URL),
      expect.any(Object),
    );
  });
});

describe("getAddon", async () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => addonsList,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("calls the addons list endpoint with a respository query argument", async () => {
    await addons.getAddon("MuckRock", "addon-repo", mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`addons/?repository=MuckRock%2Faddon-repo`, BASE_API_URL),
      expect.any(Object),
    );
  });
  it("returns the first result in the addon list", async () => {
    const response = await addons.getAddon("MuckRock", "addon-repo", mockFetch);
    expect(response).toEqual(addonsList.results[0]);
  });
  it("returns null if the returned list is empty", async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyList,
    });
    const response = await addons.getAddon("MuckRock", "addon-repo", mockFetch);
    expect(response).toEqual(null);
  });
});

describe("addon payloads", () => {
  test("buildPayload single dispatch", () => {
    const scraper = addonsList.results.find((a) => a.name === "Scraper");
    const parameters = {
      site: "https://www.documentcloud.org",
      project: "test",
    };
    const form = buildForm(parameters);
    const payload = addons.buildPayload(scraper, form);

    expect(payload).toMatchObject({
      addon: scraper.id,
      parameters,
    });
  });

  test("buildPayload scheduled event", () => {
    const scraper = addonsList.results.find((a) => a.name === "Scraper");
    const parameters = {
      site: "https://www.documentcloud.org",
      project: "test",
      event: "weekly",
    };
    const form = buildForm(parameters);
    const payload = addons.buildPayload(scraper, form);

    expect(payload).toMatchObject({
      addon: scraper.id,
      parameters: {
        site: "https://www.documentcloud.org",
        project: "test",
      },
      event: addons.eventValues.weekly,
    });
  });

  test("buildPayload array param", () => {
    const siteSnapshot = addonsList.results.find(
      (a) => a.name === "Site Snapshot",
    );
    const parameters = {
      sites: ["https://www.muckrock.com", "https://www.documentcloud.org"],
      project_id: 1,
      access_level: "public",
    };
    const form = buildForm(parameters);
    const payload = addons.buildPayload(siteSnapshot, form, true);

    expect(payload.valid).toBeTruthy();

    expect(payload).toMatchObject({
      addon: siteSnapshot.id,
      parameters,
      valid: true,
    });
  });

  test("buildPayload remove blank values", () => {
    const scraper = addonsList.results.find((a) => a.name === "Scraper");

    const parameters = {
      site: "https://www.documentcloud.org",
      project: "test",
      slack_webhook: "",
    };

    const form = buildForm(parameters);
    const payload = addons.buildPayload(scraper, form, true);

    if (payload.errors) {
      console.error(payload.errors);
    }
    expect(payload.valid).toBeTruthy();

    expect(payload).toMatchObject({
      addon: scraper.id,
      parameters: {
        site: "https://www.documentcloud.org",
        project: "test",
      },
    });
  });

  test("buildPayload with documents", () => {
    const translate = addonsList.results.find(
      (a) => a.name === "Translate Documents",
    );
    const parameters = {
      access_level: "public",
      project_id: 1,
      input_lang: "af",
      output_lang: "zh-CN",
    };

    const form = buildForm({
      ...parameters,
      documents: "1,2,3",
      selection: "selected",
    });
    const payload = addons.buildPayload(translate, form, true);

    if (!payload.valid) {
      console.error(payload.errors);
    }

    // put this after the above test so we can see errors on failure
    expect(payload.valid).toBeTruthy();

    expect(payload).toMatchObject({
      addon: translate.id,
      parameters,
      documents: [1, 2, 3],
    });
  });

  test("buildPayload with query", () => {
    const translate = addonsList.results.find(
      (a) => a.name === "Translate Documents",
    );
    const parameters = {
      access_level: "public",
      project_id: 1,
      input_lang: "af",
      output_lang: "zh-CN",
    };

    const form = buildForm({
      ...parameters,
      query: "+user:chris-100000",
      selection: "query",
    });
    const payload = addons.buildPayload(translate, form, true);

    if (!payload.valid) {
      console.error(payload.errors);
    }

    // put this after the above test so we can see errors on failure
    expect(payload.valid).toBeTruthy();

    expect(payload).toMatchObject({
      addon: translate.id,
      parameters,
      query: "+user:chris-100000",
    });
  });
});

describe("add-on dispatch and scheduling", () => {
  test.todo("addons.getEvent");
  test.todo("addons.history");
  test.todo("addons.scheduled");
  test.todo("addons.dispatch");
  test.todo("addons.update");

  test("addons.dismiss", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return { ...run, dismissed: true };
        },
      };
    });
    const { data, error } = await addons.dismiss(run.uuid, "token", mockFetch);

    expect(error).toBeUndefined();
    expect(data).toEqual({ ...run, dismissed: true });
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`addon_runs/${run.uuid}/?expand=addon`, BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        body: JSON.stringify({ dismissed: true }),
      },
    );
  });
});

function buildForm(parameters: Record<string, any>): FormData {
  const form = new FormData();

  for (const [k, v] of Object.entries(parameters)) {
    if (Array.isArray(v)) {
      v.forEach((value) => form.append(k, value));
    } else {
      form.set(k, v);
    }
  }

  return form;
}
