import { describe, test, expect, vi, beforeEach } from "vitest";

import { SIGN_IN_URL } from "@/config/config.js";
import { usersList } from "@/test/fixtures/accounts";
import { listUsers } from "$lib/api/accounts";
import { searchUrl, userDocs } from "$lib/utils/search";
import { GET } from "../+server";

vi.mock("$lib/api/accounts", () => ({ listUsers: vi.fn() }));

const user = usersList.results[0]!;
const url = new URL(`https://www.documentcloud.org/users/uuid/${user.uuid}/`);
const signIn = new URL(
  `?next=${encodeURIComponent(url.href)}`,
  SIGN_IN_URL,
).toString();

function event(sessionid?: string) {
  return {
    params: { uuid: user.uuid },
    url,
    cookies: { get: () => sessionid },
    fetch: globalThis.fetch,
  } as unknown as Parameters<typeof GET>[0];
}

describe("user documents by uuid", () => {
  beforeEach(() => {
    vi.mocked(listUsers).mockReset();
  });

  test("redirects a logged-out visitor to sign in and back", async () => {
    await expect(GET(event())).rejects.toMatchObject({
      status: 302,
      location: signIn,
    });
    expect(listUsers).not.toHaveBeenCalled();
  });

  test("redirects an expired session to sign in and back", async () => {
    vi.mocked(listUsers).mockResolvedValue({
      error: { status: 401, message: "Unauthorized" },
    });

    await expect(GET(event("stale"))).rejects.toMatchObject({
      status: 302,
      location: signIn,
    });
  });

  test("redirects to a search for the user's documents", async () => {
    vi.mocked(listUsers).mockResolvedValue({
      data: { ...usersList, results: [user] },
    });

    await expect(GET(event("session"))).rejects.toMatchObject({
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

    await expect(GET(event("session"))).rejects.toMatchObject({
      status: 404,
    });
  });
});
