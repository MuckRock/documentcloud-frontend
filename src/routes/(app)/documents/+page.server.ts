import type { Actions } from "./$types.js";
import type { Data, Document } from "$lib/api/types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { destroy_many, edit_many, add_tags } from "$lib/api/documents";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  async data({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const form = await request.formData();
    const keys = form.getAll("key") as string[];
    const values = form.getAll("value") as string[];

    const data: Data = keys.reduce((m, key, i) => {
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

    const ids = String(form.get("documents")).split(",");

    // send a request for each key on each document
    // this might be a bunch of requests all at once
    const promises = Object.entries(data)
      .map(([key, values]) =>
        ids.map((id) => add_tags(id, key, values, csrf_token, fetch)),
      )
      .flat();

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);

    if (errors.length) {
      return fail(400, { errors });
    }

    return {
      success: true,
    };
  },

  async delete({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");

    const { error } = await destroy_many(ids, csrf_token, fetch);

    if (error) {
      return fail(error.status, { ...error });
    }

    return {
      success: true,
      count: ids.length,
    };
  },

  async edit({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");

    form.delete("documents");

    const update: Partial<Document> = Object.fromEntries(form);

    const docs = ids.map((id) => {
      return { ...update, id };
    });

    const { error } = await edit_many(docs, csrf_token, fetch);

    if (error) {
      return fail(error.status, { ...error });
    }

    return {
      success: true,
      count: ids.length,
    };
  },
} satisfies Actions;
