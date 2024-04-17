import type { Actions } from "./$types";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { upload } from "$lib/components/forms/DocumentUpload.svelte";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  default: async ({ request, cookies, fetch }) => {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    return upload(form, csrf_token, null, fetch);
  },
} satisfies Actions;
