import {
  vi,
  test,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  MAX_PER_PAGE,
  SQUARELET_BASE,
} from "@/config/config";
import * as fixtures from "@/test/fixtures/accounts";

import {
  createMailkey,
  destroyMailkey,
  getMe,
  getOrg,
  getUpgradeUrl,
  isPremiumOrg,
  getCreditBalance,
  userOrgs,
  orgUsers,
  alphabetizeUsers,
  inMyOrg,
  isOrg,
  isUser,
  setOrg,
} from "../accounts";
import type { Org } from "../types";

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
  const resp = await getOrg(1, mockFetch);
  expect(resp).toEqual(fixtures.organization);
  expect(mockFetch).toHaveBeenCalledWith(
    new URL("organizations/1/", BASE_API_URL),
    { credentials: "include" },
  );
});

test("setOrg", async () => {
  const orgToSet = 2;
  const mockFetch = vi.fn().mockImplementation(async () => ({
    ok: true,
    json: vi.fn().mockReturnValue({ ...fixtures.me, organization: orgToSet }),
  }));
  expect(await setOrg(orgToSet, "csrf_token", mockFetch)).toEqual({
    data: {
      ...fixtures.me,
      organization: orgToSet,
    },
  });
  expect(mockFetch).toHaveBeenCalledWith(
    new URL(`users/me/?expand=organization`, BASE_API_URL),
    {
      body: `{"organization":${orgToSet}}`,
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        Referer: APP_URL,
        [CSRF_HEADER_NAME]: "csrf_token",
      },
      method: "PATCH",
    },
  );
});

test("userOrgs", async () => {
  const mockFetch = vi.fn().mockImplementation(async () => ({
    ok: true,
    json: vi.fn().mockReturnValue(fixtures.organizationsList),
  }));
  expect(await userOrgs(fixtures.me, mockFetch)).toEqual(
    fixtures.organizationsList.results,
  );
  expect(mockFetch).toHaveBeenCalledWith(
    new URL(
      `organizations/?id__in=${encodeURIComponent(fixtures.me.organizations.join(","))}&per_page=${MAX_PER_PAGE}`,
      BASE_API_URL,
    ),
    {
      credentials: "include",
    },
  );
});

describe("orgUsers", () => {
  let mockFetch;
  beforeEach(() => {
    mockFetch = vi.fn();
  });
  it("returns an empty list when the org is individual", () => {
    expect(orgUsers(fixtures.proOrg, mockFetch)).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
  it("fetches a list of all users in a group org", async () => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: vi.fn().mockReturnValue(fixtures.usersList),
    }));
    expect(await orgUsers(fixtures.organization, mockFetch)).toEqual(
      fixtures.usersList.results,
    );
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(
        `users/?organization=${fixtures.organization.id}&per_page=${MAX_PER_PAGE}`,
        BASE_API_URL,
      ),
      {
        credentials: "include",
      },
    );
  });
});

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
  let mockFetch: Mock;
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
  it("returns false on bad status", async () => {
    mockFetch = vi.fn().mockImplementation(async () => ({
      ok: false,
    }));
    expect(await destroyMailkey("token", mockFetch)).toBe(false);
  });
  it("returns false on error", async () => {
    mockFetch = vi.fn().mockRejectedValue(new Error("Fetch Error"));
    const resp = await destroyMailkey("token", mockFetch);
    expect(resp).toBe(false);
  });
});

test("isUser", () => {
  expect(isUser(undefined)).toBe(false);
  expect(isUser(null)).toBe(false);
  expect(isUser(1)).toBe(false);
  expect(isUser(fixtures.me)).toBe(true);
});

test("isOrg", () => {
  expect(isOrg(undefined)).toBe(false);
  expect(isOrg(null)).toBe(false);
  expect(isOrg(1)).toBe(false);
  expect(isOrg(fixtures.organization)).toBe(true);
});

test("isPremiumOrg", () => {
  expect(isPremiumOrg(fixtures.freeOrg)).toBe(false);
  expect(isPremiumOrg(fixtures.proOrg)).toBe(true);
  expect(isPremiumOrg(null)).toBe(false);
});

test("getCreditBalance", () => {
  expect(getCreditBalance(null)).toBeNull();
  expect(getCreditBalance(fixtures.freeOrg)).toBe(0);
  expect(getCreditBalance(fixtures.proOrg)).toBe(5500);
  // handles missing props
  expect(getCreditBalance({} as Org)).toBe(0);
});

test("alphabetizeUsers", () => {
  const unorderedList = [
    { name: "Tony Danza", username: "td" },
    { name: "Henry Winkler", username: "hw" },
    { username: "tk" },
  ];
  expect(unorderedList.sort(alphabetizeUsers)).toEqual([
    { name: "Henry Winkler", username: "hw" },
    { username: "tk" },
    { name: "Tony Danza", username: "td" },
  ]);
});

test("inMyOrg", () => {
  const org = fixtures.organization;
  const users = fixtures.usersList.results.filter((user) =>
    user.organizations.includes(org.id),
  );
  const me = fixtures.me;
  expect(inMyOrg(org.id, me.id)).toEqual([]);
  expect(inMyOrg(org.id, me.id, users)).toEqual([
    {
      id: 3,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/account_images/Screenshot_2016-11-16_15.43.27.png",
      name: "Michael Morisy",
      organization: 1,
      organizations: [7, 9, 1, 6, 4, 8, 5],
      admin_organizations: [7, 9, 1, 6, 4, 8, 5],
      username: "morisy",
      uuid: "a7579bae-6e11-4ef0-8d65-e60288fba420",
      verified_journalist: true,
    },
    {
      id: 1,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/account_images/22_MuckRock_2018_PRELIMANRY_EDITS_DSC_5387_2018_Derek_Kouyoumjian_preview_SfuGGnJ.jpg",
      name: "Mitchell J Kotler",
      organization: 1,
      organizations: [10028, 10027, 2, 1],
      admin_organizations: [10028, 10027, 2, 1],
      username: "mitch",
      uuid: "76742194-b998-4ca5-a7af-fd054de89e88",
      verified_journalist: true,
    },
    {
      id: 2,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Dylan Freedman",
      organization: 3,
      organizations: [3, 1],
      admin_organizations: [3],
      username: "freedmand",
      uuid: "0aa27e3b-c5d8-4a9d-a278-753a770f86d7",
      verified_journalist: true,
    },
    {
      id: 100010,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/avatars/ABS.jpg",
      name: "ja-test",
      organization: 10021,
      organizations: [10021, 1],
      admin_organizations: [10021],
      username: "ja22",
      uuid: "78756937-b6d9-40ee-b1ac-03c134416de6",
      verified_journalist: true,
    },
    {
      id: 100001,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Muckrock Staff",
      organization: 1,
      organizations: [1, 10002],
      admin_organizations: [10002],
      username: "MuckrockStaff",
      uuid: "0cbb557a-344e-4da7-9d4c-b9bf8e0a899a",
      verified_journalist: true,
    },
  ]);
});
