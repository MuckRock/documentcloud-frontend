import { vi, test, describe, it, expect, beforeEach, afterEach } from "vitest";

import { BASE_API_URL } from "@/config/config";
import * as fixtures from "@/test/fixtures/accounts";

import { getMe, getOrg } from "./accounts";

describe("getMe", async () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: vi.fn().mockReturnValue(fixtures.me),
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the expected data", async () => {
    const resp = await getMe(mockFetch);
    expect(resp).toBe(fixtures.me);
  });

  it("calls the expected endpoint", async () => {
    await getMe(mockFetch);
    const expectedEndpoint = new URL(`users/me/`, BASE_API_URL);
    expectedEndpoint.searchParams.set("expand", "organization");
    expect(mockFetch).toHaveBeenCalledWith(expectedEndpoint, {
      credentials: "include",
    });
  });

  it("returns undefined upon server error", async () => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: false,
      json: vi.fn().mockReturnValue(fixtures.me),
    }));
    const resp = await getMe(mockFetch);
    expect(resp).toBeUndefined();
  });

  it("returns undefined upon fetch error", async () => {
    mockFetch = vi.fn().mockRejectedValue(new Error("Fetch Error"));
    const resp = await getMe(mockFetch);
    expect(resp).toBeUndefined();
  });
});

test("getOrg", async () => {
  const mockFetch = vi.fn().mockImplementation(async () => ({
    ok: true,
    json: vi.fn().mockReturnValue(fixtures.organization),
  }));
  const resp = await getOrg(mockFetch, 1);
  expect(resp).toEqual(fixtures.organization);
  expect(mockFetch).toHaveBeenCalledWith(
    new URL("organizations/1/", BASE_API_URL),
    { credentials: "include" },
  );
});

test.todo("users.get");
test.todo("users.list");
