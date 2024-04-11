import type { Actions } from "./$types";
import type {
  Access,
  Document,
  DocumentUpload,
  OCREngine,
  Project,
} from "$lib/api/types";

import { CSRF_COOKIE_NAME, DEFAULT_LANGUAGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { unwrap } from "$lib/components/inputs/Select.svelte";
import { upload } from "$lib/components/forms/DocumentUpload.svelte";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  default: async ({ request, cookies, fetch }) => {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    return upload(form, csrf_token, fetch);
  },
} satisfies Actions;
