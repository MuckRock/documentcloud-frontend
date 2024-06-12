import type { Actions } from "./$types.js";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { edit } from "$lib/api/documents";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  async edit({ fetch, request }) {},
} satisfies Actions;
