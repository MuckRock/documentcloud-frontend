import { describe, test, expect, vi, beforeEach } from "vitest";

import { SIGN_IN_URL } from "@/config/config.js";
import { me, usersList } from "@/test/fixtures/accounts";
import { listUsers } from "$lib/api/accounts";
import { searchUrl, userDocs } from "$lib/utils/search";
import { load } from "../+page";

vi.mock("$lib/api/accounts", () => ({ listUsers: vi.fn() }));

const user = usersList.results[0]!;
const url = new URL(`https://www.documentcloud.org/users/uuid/${user.uuid}/`);

function event(signedIn: boolean) {
  return {
    params: { uuid: user.uuid },
    parent: async () => ({ me: signedIn ? me : null }),
    url,
    fetch: globalThis.fetch,
  } as unknown as Parameters<typeof load>[0];
}

describe("user documents by uuid", () => {
  beforeEach(() => {
    vi.mocked(listUsers).mockReset();
  });

  test("redirects a logged-out visitor to sign in and back", async () => {
    await expect(load(event(false))).rejects.toMatchObject({
      status: 302,
      location: new URL(
        `?next=${encodeURIComponent(url.href)}`,
        SIGN_IN_URL,
      ).toString(),
    });
    expect(listUsers).not.toHaveBeenCalled();
  });

  test("redirects to a search for the user's documents", async () => {
    vi.mocked(listUsers).mockResolvedValue({
      data: { ...usersList, results: [user] },
    });

    await expect(load(event(true))).rejects.toMatchObject({
      status: 302,
      location: searchUrl(userDocs(user)).toString(),
    });
    expect(listUsers).toHaveBeenCalledWith(
      { uuid: user.uuid },
      globalThis.fetch,
    );
  });

  test("404s for a uuid with no user", async () => {
    vi.mocked(listUsers).mockResolvedValue({
      data: { ...usersList, results: [] },
    });

    await expect(load(event(true))).rejects.toMatchObject({ status: 404 });
  });
});
