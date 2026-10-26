import { describe, test, expect, vi, beforeEach } from "vitest";

import { SIGN_IN_URL } from "@/config/config.js";
import { organizationsList } from "@/test/fixtures/accounts";
import { listOrgs } from "$lib/api/accounts";
import { searchUrl, orgDocs } from "$lib/utils/search";
import { GET } from "../+server";

vi.mock("$lib/api/accounts", () => ({ listOrgs: vi.fn() }));

const org = organizationsList.results[0]!;
const url = new URL(
  `https://www.documentcloud.org/organizations/uuid/${org.uuid}/`,
);
const signIn = new URL(
  `?next=${encodeURIComponent(url.href)}`,
  SIGN_IN_URL,
).toString();

function event(sessionid?: string) {
  return {
    params: { uuid: org.uuid },
    url,
    cookies: { get: () => sessionid },
    fetch: globalThis.fetch,
  } as unknown as Parameters<typeof GET>[0];
}

describe("organization documents by uuid", () => {
  beforeEach(() => {
    vi.mocked(listOrgs).mockReset();
  });

  test("redirects a logged-out visitor to sign in and back", async () => {
    await expect(GET(event())).rejects.toMatchObject({
      status: 302,
      location: signIn,
    });
    expect(listOrgs).not.toHaveBeenCalled();
  });

  test("redirects an expired session to sign in and back", async () => {
    vi.mocked(listOrgs).mockResolvedValue({
      error: { status: 401, message: "Unauthorized" },
    });

    await expect(GET(event("stale"))).rejects.toMatchObject({
      status: 302,
      location: signIn,
    });
  });

  test("redirects to a search for the organization's documents", async () => {
    vi.mocked(listOrgs).mockResolvedValue({
      data: { ...organizationsList, results: [org] },
    });

    await expect(GET(event("session"))).rejects.toMatchObject({
      status: 302,
      location: searchUrl(orgDocs(org)).toString(),
    });
    expect(listOrgs).toHaveBeenCalledWith({ uuid: org.uuid }, globalThis.fetch);
  });

  test("404s for a uuid with no organization", async () => {
    vi.mocked(listOrgs).mockResolvedValue({
      data: { ...organizationsList, results: [] },
    });

    await expect(GET(event("session"))).rejects.toMatchObject({
      status: 404,
    });
  });
});
