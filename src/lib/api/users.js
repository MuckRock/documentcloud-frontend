import { BASE_API_URL } from "@/config/config.js";

/**
 * Get the current logged-in user, or null
 *
 * @param {globalThis.fetch} fetch
 * @return {import('@/api/types/orgAndUser.d.ts').User}
 */
export async function getMe(fetch) {
  const endpoint = new URL("users/me/", BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" }).catch((e) => ({
    ok: false, // catch errors here to prevent 500s
  }));

  if (!resp.ok) {
    return null;
  }

  return resp.json();
}
