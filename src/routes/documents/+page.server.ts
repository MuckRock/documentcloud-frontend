import type { Actions } from "./$types.js";
import type { Document } from "$lib/api/types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { destroy_many, edit_many } from "$lib/api/documents";
import { isErrorCode } from "$lib/utils/api";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  async delete({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");

    const resp = await destroy_many(ids, csrf_token, fetch).catch(
      console.error,
    );

    if (!resp) {
      return fail(500);
    }

    if (isErrorCode(resp.status)) {
      return fail(resp.status);
    }

    return {
      success: true,
      count: ids.length,
    };
  },

  async edit({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");

    form.delete("documents");

    const update: Partial<Document> = Object.fromEntries(form);

    const docs = ids.map((id) => {
      return { ...update, id };
    });

    const resp = await edit_many(docs, csrf_token, fetch).catch(console.error);

    if (!resp) {
      return fail(500);
    }

    if (isErrorCode(resp.status)) {
      return fail(resp.status);
    }

    return {
      success: true,
      count: ids.length,
    };
  },
} satisfies Actions;
