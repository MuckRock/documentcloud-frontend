import type { Actions } from "./$types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as projects from "$lib/api/projects";
import { setFlash } from "sveltekit-flash-message/server";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}

export const actions = {
  // create is the only thing we can do here
  async default({ cookies, request, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const project = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      pinned: form.get("pinned") === "on",
      private: form.get("private") === "on",
    };

    try {
      const created = await projects.create(project, csrf_token, fetch);
      setFlash({ message: "Project created", status: "success" }, cookies);
      return { success: true, project: created };
    } catch (error) {
      // todo: return better errors
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(400, { error });
    }
  },
} satisfies Actions;
