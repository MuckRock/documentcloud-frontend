import { vi, test, describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  SQUARELET_BASE,
} from "@/config/config";
import * as fixtures from "@/test/fixtures/accounts";

import {
  createMailkey,
  destroyMailkey,
  getMe,
  getOrg,
  getUpgradeUrl,
} from "./accounts";

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

test("getUpgradeUrl", () => {
  expect(getUpgradeUrl()).toEqual(new URL("/users/~payment/", SQUARELET_BASE));
  expect(getUpgradeUrl(fixtures.proOrg)).toEqual(
    new URL("/users/~payment/", SQUARELET_BASE),
  );
  expect(getUpgradeUrl(fixtures.organization)).toEqual(
    new URL(
      `/organizations/${fixtures.organization.slug}/payment/`,
      SQUARELET_BASE,
    ),
  );
});

describe("createMailkey", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: vi.fn().mockReturnValue({ mailkey: "xxxxxxxxx" }),
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("makes a POST request and returns the mailkey on success", async () => {
    const resp = await createMailkey("token", mockFetch);
    expect(resp).toBe("xxxxxxxxx");
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("users/mailkey/", BASE_API_URL),
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          [CSRF_HEADER_NAME]: "token",
        },
      },
    );
  });
  it("returns null on error", async () => {
    mockFetch = vi.fn().mockRejectedValue(new Error("Fetch Error"));
    const resp = await createMailkey("token", mockFetch);
    expect(resp).toBeNull();
  });
});

describe("destroyMailkey", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
    }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("makes a DELETE request and returns `true` upon success", async () => {
    const resp = await destroyMailkey("token", mockFetch);
    expect(resp).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("users/mailkey/", BASE_API_URL),
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          [CSRF_HEADER_NAME]: "token",
        },
      },
    );
  });
  it("returns false on error", async () => {
    mockFetch = vi.fn().mockRejectedValue(new Error("Fetch Error"));
    const resp = await destroyMailkey(mockFetch);
    expect(resp).toBe(false);
    mockFetch = vi.fn().mockResolvedValue({ ok: false });
    expect(await destroyMailkey(mockFetch)).toBe(false);
  });
});
