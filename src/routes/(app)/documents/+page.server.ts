import type { Actions } from "./$types.js";
import type { Data, Document } from "$lib/api/types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import { destroy_many, edit_many, add_tags } from "$lib/api/documents";
import { setFlash } from "sveltekit-flash-message/server";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  async delete({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");
    console.log(`BULK DELETE: ${form.get("documents")}`);

    const { error } = await destroy_many(ids, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { ...error });
    }

    const message = ids.length === 1 ? "Document deleted" : "Documents deleted";
    setFlash({ message, status: "success" }, cookies);
    return {
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
    console.log(`BULK EDIT: ${form.get("documents")}`);
    form.delete("documents");

    // @ts-ignore
    const update: Partial<Document> = Object.fromEntries(form);

    const docs = ids.map((id) => {
      return { ...update, id };
    });

    const { error, data } = await edit_many(docs, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { ...error });
    }

    const message =
      ids.length === 1
        ? "Saved edits to one document"
        : `Saved edits to ${ids.length} documents`;
    setFlash({ message, status: "success" }, cookies);
    return {
      count: ids.length,
      documents: data,
    };
  },
  async change_owner({ cookies, fetch, request }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }
    const form = await request.formData();

    const ids = String(form.get("documents")).split(",");
    const user = form.get("user");
    const organization = form.get("organization");

    console.log(
      `CHANGE OWNER: ${form.get("documents")}, User: ${user}, Org: ${organization}`,
    );

    const docs: Partial<Document>[] = ids.map((id) => {
      const d: Partial<Document> = { id };
      if (user) {
        d.user = +user;
      }
      if (organization) {
        d.organization = +organization;
      }

      return d;
    });

    const { error, data } = await edit_many(docs, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { ...error });
    }

    const message =
      ids.length === 1
        ? "Updated ownership for one document"
        : `Updated ownership for ${ids.length} documents`;
    setFlash({ message, status: "success" }, cookies);
    return {
      count: ids.length,
      documents: data,
    };
  },
} satisfies Actions;
