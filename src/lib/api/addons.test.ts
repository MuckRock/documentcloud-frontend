import { vi, test, describe, it, expect, beforeEach, afterEach } from "vitest";
import * as addons from "./addons";
import { BASE_API_URL } from "@/config/config";
import { addonsList } from "@/test/fixtures/addons";
import { emptyList } from "@/test/fixtures/common";

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
    const response = await addons.getAddons({}, mockFetch);
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
