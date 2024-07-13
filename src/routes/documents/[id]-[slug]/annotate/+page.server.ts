import type { Actions } from "./$types.js";
import type { Access, Note, Section } from "$lib/api/types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as notes from "$lib/api/notes";
import { isErrorCode } from "$lib/utils/api";

// handle notes: create, update, delete
export const actions = {
  async create({ cookies, request, fetch, params }) {
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
      return fail(400, { error: e });
    }
  },

  async update({ cookies, request, fetch, params }) {
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
      return fail(400, { error: e });
    }
  },

  async delete({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const note_id = +form.get("id");

    if (!note_id) return fail(400, { id: "missing" });

    const resp = await notes
      .remove(params.id, note_id, csrf_token, fetch)
      .catch((e) => {
        console.log(e);
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
