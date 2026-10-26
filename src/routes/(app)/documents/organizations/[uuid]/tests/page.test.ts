import { describe, test, expect, vi, beforeEach } from "vitest";

import { SIGN_IN_URL } from "@/config/config.js";
import { me, organizationsList } from "@/test/fixtures/accounts";
import { listOrgs } from "$lib/api/accounts";
import { searchUrl, orgDocs } from "$lib/utils/search";
import { load } from "../+page";

vi.mock("$lib/api/accounts", () => ({ listOrgs: vi.fn() }));

const org = organizationsList.results[0]!;
const url = new URL(
  `https://www.documentcloud.org/documents/organizations/${org.uuid}/`,
);

function event(signedIn: boolean) {
  return {
    params: { uuid: org.uuid },
    parent: async () => ({ me: signedIn ? me : null }),
    url,
    fetch: globalThis.fetch,
  } as unknown as Parameters<typeof load>[0];
}

describe("organization documents by uuid", () => {
  beforeEach(() => {
    vi.mocked(listOrgs).mockReset();
  });

  test("redirects a logged-out visitor to sign in and back", async () => {
    await expect(load(event(false))).rejects.toMatchObject({
      status: 302,
      location: new URL(
        `?next=${encodeURIComponent(url.href)}`,
        SIGN_IN_URL,
      ).toString(),
    });
    expect(listOrgs).not.toHaveBeenCalled();
  });

  test("redirects to a search for the organization's documents", async () => {
    vi.mocked(listOrgs).mockResolvedValue({
      data: { ...organizationsList, results: [org] },
    });

    await expect(load(event(true))).rejects.toMatchObject({
      status: 302,
      location: searchUrl(orgDocs(org)).toString(),
    });
    expect(listOrgs).toHaveBeenCalledWith({ uuid: org.uuid }, globalThis.fetch);
  });

  test("404s for a uuid with no organization", async () => {
    vi.mocked(listOrgs).mockResolvedValue({
      data: { ...organizationsList, results: [] },
    });

    await expect(load(event(true))).rejects.toMatchObject({ status: 404 });
  });
});
