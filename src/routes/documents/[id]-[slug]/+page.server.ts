import type { Actions } from "./$types";
import type { Document } from "$lib/api/types";

import { fail, redirect } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { destroy, edit, redact } from "$lib/api/documents";
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
  // like edit but specifically for data
  async data({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const { id } = params;

    // array of [['key', '...'], ['value', '...']]
    const form = await request.formData();
    const keys = form.getAll("key") as string[];
    const values = form.getAll("value") as string[];

    const data = keys.reduce((m, key, i) => {
      const value = values[i];
      if (key in m) {
        m[key].push(value);
      } else {
        m[key] = [value];
      }
      return m;
    }, {});

    try {
      const document = await edit(id, { data }, csrf_token, fetch);
      return {
        success: true,
        document,
      };
    } catch (error) {
      console.error(error);
      return fail(400);
    }
  },

  async delete({ cookies, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const { id } = params;

    console.log(`Deleting document: ${id}`);

    const resp = await destroy(id, csrf_token, fetch).catch((e) => {
      console.error(e);
    });

    // probably the API is down
    if (!resp) {
      return fail(500, { error: "Something went wrong." });
    }

    // something else broke
    if (isErrorCode(resp.status)) {
      // {"error": "..."}
      return fail(resp.status, await resp.json());
    }

    return redirect(302, "/documents/");
  },

  async edit({ cookies, fetch, request, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();
    const { id } = params;

    const update: Partial<Document> = Object.fromEntries(form);

    // noindex is a boolean so needs special treatment
    update.noindex = form.get("noindex") === "checked";

    try {
      const document = await edit(id, update, csrf_token, fetch);
      return {
        success: true,
        document,
      };
    } catch (error) {
      console.error(error);
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
      return fail(500, { error: "Something went wrong." });
    }

    // something else broke
    if (isErrorCode(resp.status)) {
      // {"error": "..."}
      return fail(resp.status, await resp.json());
    }

    return {
      success: true,
      redactions: await resp.json(), // this should be the same as above
    };
  },
} satisfies Actions;
