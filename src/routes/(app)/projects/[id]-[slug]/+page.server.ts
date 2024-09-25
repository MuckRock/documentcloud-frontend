import type { Actions } from "./$types";
import type { Project, ProjectAccess } from "$lib/api/types";

import { fail, redirect } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as projects from "$lib/api/projects";
import * as collaborators from "$lib/api/collaborators";

export const actions = {
  async delete({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const project_id = +params.id;

    const { error } = await projects.destroy(project_id, csrf_token, fetch);

    if (error) {
      return fail(error.status, { message: error.message });
    }

    return redirect(302, "/projects/");
  },

  async edit({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const update: Partial<Project> = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      pinned: form.get("pinned") === "on",
      private: form.get("private") === "on",
    };

    const { data: updated, error } = await projects.edit(
      +params.id,
      update,
      csrf_token,
      fetch,
    );

    if (error) {
      return fail(error.status, { message: error.message });
    }

    return { success: true, project: updated };
  },

  async users({ request, cookies, params, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();
    const project_id = +params.id;

    const users = form.getAll("user").map(Number);
    const access = form.getAll("access");

    // batch update
    const updated = await Promise.all(
      users.map((u, i) => {
        const a = access[i];
        if (a === "remove") {
          // this returns an empty body, so just fire and forget
          collaborators.remove(project_id, u, csrf_token, fetch);
        } else {
          return collaborators.update(
            project_id,
            u,
            a as ProjectAccess,
            csrf_token,
            fetch,
          );
        }
      }),
    );

    return {
      success: true,
      users: updated,
    };
  },

  async invite({ request, cookies, params, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    const email = form.get("email") as string;
    const access = form.get("access") as ProjectAccess;

    const { data: user, error } = await collaborators.add(
      +params.id,
      { email, access },
      csrf_token,
      fetch,
    );

    if (error) {
      return fail(error.status, { ...error });
    }

    return {
      success: true,
      user,
    };
  },
} satisfies Actions;