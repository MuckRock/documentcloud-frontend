import type { Actions } from "./$types";

import { fail } from "@sveltejs/kit";

import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as projects from "$lib/api/projects";

export const actions = {
  // create is the only thing we can do here
  async default({ cookies, request, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const project = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      pinned: form.get("pinned") === "on",
      private: form.get("private") === "on",
    };

    try {
      const created = await projects.create(project, csrf_token, fetch);
      return { success: true, project: created };
    } catch (error) {
      // todo: return better errors
      return fail(400, { error });
    }
  },
} satisfies Actions;
