import type { Actions } from "./$types.js";
import type { Document } from "$lib/api/types";

import { fail, redirect } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { edit, redact } from "$lib/api/documents";
import { isErrorCode } from "$lib/utils/api";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

/**
 * All document actions are defined here, because users end up
 * back on the document viewer after any successful action.
 */
export const actions = {
  async edit({ cookies, fetch, request, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();
    const { id } = params;

    const update: Partial<Document> = {};

    // set any fields that aren't blank
    Array.from(form).reduce((m, [k, v]) => {
      if (v) {
        m[k] = v;
      }
      return m;
    }, update);

    try {
      const document = await edit(id, update, csrf_token, fetch);
      return {
        success: true,
        document,
      };
    } catch (error) {
      return fail(400);
    }
  },

  async redact({ cookies, fetch, request, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();
    const redactions = JSON.parse(form.get("redactions") as string);

    const resp = await redact(params.id, redactions, csrf_token, fetch).catch(
      console.error,
    );

    // probably the API is down
    if (!resp) {
      return fail(500, { message: "Something went wrong." });
    }

    // something else broke
    if (isErrorCode(resp.status)) {
      return fail(resp.status, { message: await resp.text() });
    }

    return {
      success: true,
      redactions: await resp.json(), // this should be the same as above
    };
  },
} satisfies Actions;
