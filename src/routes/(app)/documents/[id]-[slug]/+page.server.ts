import type { Actions } from "./$types";
import type { Access, Document, Note } from "$lib/api/types";

import { fail, redirect } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { destroy, edit, redact } from "$lib/api/documents";
import * as notes from "$lib/api/notes";
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
  async data({ cookies, request, fetch, params, url }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const { id } = params;

    // array of [['key', '...'], ['value', '...']]
    const form = await request.formData();
    const keys = form.getAll("key") as string[];
    const values = form.getAll("value") as string[];

    const data = keys.reduce((m, key, i) => {
      const value = values[i];

      // filter out blanks
      if (key === "" || value === "") return m;

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
      console.error(`Data: ${url}`);
      console.error(error);
      return fail(400);
    }
  },

  async delete({ cookies, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const { id } = params;

    console.info(`Deleting document: ${id}`);

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

  async createAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const [x1, x2, y1, y2] = JSON.parse(form.get("coords") as string);

    const note: Partial<Note> = {
      title: form.get("title") as string,
      content: (form.get("content") as string) ?? "",
      access: form.get("access") as Access,
      page_number: +form.get("page_number"),
      x1,
      x2,
      y1,
      y2,
    };

    try {
      const created = await notes.create(params.id, note, csrf_token, fetch);
      return {
        success: true,
        note: created,
      };
    } catch (e) {
      return fail(400, { error: e.message });
    }
  },

  async updateAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const note_id = +form.get("id");

    // only limited update options for now
    const note: Partial<Note> = {
      title: form.get("title") as string,
      content: (form.get("content") as string) ?? "",
      access: form.get("access") as Access,
    };

    try {
      const updated = await notes.update(
        params.id,
        note_id,
        note,
        csrf_token,
        fetch,
      );
      return {
        success: true,
        note: updated,
      };
    } catch (e) {
      return fail(400, { error: e.message });
    }
  },

  async deleteAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const note_id = +form.get("id");

    if (!note_id) return fail(400, { id: "missing" });

    const resp = await notes
      .remove(params.id, note_id, csrf_token, fetch)
      .catch((e) => {
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

    return {
      success: true,
    };
  },
} satisfies Actions;
