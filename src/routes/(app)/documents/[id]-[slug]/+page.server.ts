import type { Actions } from "./$types";
import type { Access, Document, Note } from "$lib/api/types";

import { fail } from "@sveltejs/kit";
import { setFlash, redirect } from "sveltekit-flash-message/server";

import { CSRF_COOKIE_NAME, EMBED_URL } from "@/config/config.js";
import { destroy, edit, redact } from "$lib/api/documents";
import * as notes from "$lib/api/notes";

export function load({ cookies, request, url }) {
  const inIframe = request.headers.get("Sec-Fetch-Dest") === "iframe";
  if (inIframe) {
    const embed = new URL(url);

    embed.host = new URL(EMBED_URL).host;
    embed.searchParams.set("embed", "1");
    return redirect(307, embed);
  }

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
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
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

    const { data: document, error } = await edit(
      id,
      { data },
      csrf_token,
      fetch,
    );

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, {
        message: error.message,
        error: error.errors,
      });
    }
    setFlash({ message: "Data saved", status: "success" }, cookies);
    return {
      success: true,
      document,
    };
  },

  async delete({ cookies, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const { id } = params;

    console.info(`Deleting document: ${id}`);

    // data will be null on success
    const { error } = await destroy(id, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { message: error.message });
    }

    return redirect(
      302,
      "/documents/",
      { message: "Document deleted", status: "success" },
      cookies,
    );
  },

  async edit({ cookies, fetch, request, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();
    const { id } = params;

    // @ts-ignore
    const update: Partial<Document> = Object.fromEntries(form.entries());

    // noindex is a boolean so needs special treatment
    update.noindex = form.get("noindex") === "on";

    const { data: document, error } = await edit(id, update, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, {
        message: error.message,
        errors: error.errors,
      });
    }

    setFlash({ message: "Metadata saved", status: "success" }, cookies);
    return {
      success: true,
      document,
    };
  },

  async redact({ cookies, fetch, request, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();
    const redactions = JSON.parse(form.get("redactions") as string);

    const { data, error: err } = await redact(
      params.id,
      redactions,
      csrf_token,
      fetch,
    );

    // probably the API is down
    if (err) {
      setFlash(
        { message: "Redactions failed to save.", status: "error" },
        cookies,
      );
      return fail(500, { error: err.message, errors: err.errors });
    }

    setFlash({ message: "Redactions saved", status: "success" }, cookies);
    return {
      redactions: data, // this should be the same as above
    };
  },

  async createAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const [x1, x2, y1, y2] = JSON.parse(form.get("coords") as string);

    const note: Partial<Note> = {
      title: form.get("title") as string,
      content: (form.get("content") as string) ?? "",
      access: form.get("access") as Access,
      page_number: form.get("page_number")
        ? Number(form.get("page_number"))
        : undefined,
      x1,
      x2,
      y1,
      y2,
    };

    const { data: created, error } = await notes.create(
      params.id,
      note,
      csrf_token,
      fetch,
    );

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, {
        message: error.message,
        errors: error.errors,
      });
    }

    setFlash({ message: "Note created", status: "success" }, cookies);
    return {
      success: true,
      note: created,
    };
  },

  async updateAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const note_id = form.get("id");

    // only limited update options for now
    const note: Partial<Note> = {
      title: form.get("title") as string,
      content: (form.get("content") as string) ?? "",
      access: form.get("access") as Access,
    };

    const { data: updated, error } = await notes.update(
      params.id,
      Number(note_id),
      note,
      csrf_token,
      fetch,
    );

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, {
        message: error.message,
        errors: error.errors,
      });
    }

    setFlash({ message: "Note updated", status: "success" }, cookies);
    return {
      success: true,
      note: updated,
    };
  },

  async deleteAnnotation({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const note_id = Number(form.get("id"));

    if (!note_id) return fail(400, { id: "missing" });

    const { error } = await notes.remove(params.id, note_id, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { message: error.message });
    }

    setFlash({ message: "Note deleted", status: "success" }, cookies);
    return {
      success: true,
    };
  },
} satisfies Actions;
