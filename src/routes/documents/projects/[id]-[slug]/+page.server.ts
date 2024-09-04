import type { Actions } from "./$types";
import type {
  Project,
  ProjectMembershipItem,
  ProjectUser,
} from "$lib/api/types";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as projects from "$lib/api/projects";

export const actions = {
  async edit({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const update: Partial<Project> = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      pinned: form.get("pinned") === "on",
      private: form.get("private") === "on",
    };

    try {
      const updated = await projects.edit(
        +params.id,
        update,
        csrf_token,
        fetch,
      );
      return { success: true, project: updated };
    } catch (error) {
      return fail(400, { error });
    }
  },

  async users() {},

  async invite() {},

  async remove() {},
} satisfies Actions;
