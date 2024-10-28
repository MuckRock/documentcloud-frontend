import type { Actions } from "./$types";
import type { Project, ProjectAccess } from "$lib/api/types";

import { fail, redirect } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";
import * as collaborators from "$lib/api/collaborators";
import * as projects from "$lib/api/projects";

export const actions = {
  /**
   * Delete this project
   */
  async delete({ cookies, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const project_id = +params.id;

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const { error } = await projects.destroy(project_id, csrf_token, fetch);

    if (error) {
      return fail(error.status, { message: error.message });
    }

    return redirect(302, "/projects/");
  },

  /**
   * Edit this project
   */
  async edit({ cookies, request, fetch, params }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

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

  /**
   * Invite a collaborator
   */
  async invite({ request, cookies, params, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

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
      user,
    };
  },

  /**
   * Update a collaborator's permissions
   */
  async update({ request, cookies, params, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const user = form.get("user");
    const access = form.get("access");
    if (!user || !access) {
      return fail(400, { message: "Missing form data" });
    }

    const project_id = +params.id;

    const { data, error } = await collaborators.update(
      project_id,
      +user,
      String(access),
      csrf_token,
      fetch,
    );

    if (error) {
      return fail(error.status, { ...error });
    }

    return {
      user: data,
    };
  },

  /**
   * Remove a collaborator
   */
  async remove({ request, cookies, params, fetch }) {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const user = form.get("user");
    const project_id = +params.id;

    if (!user || !project_id) {
      return fail(400, { message: "Missing form data" });
    }

    const { error } = await collaborators.remove(
      project_id,
      +user,
      csrf_token,
      fetch,
    );

    if (error) {
      return fail(error.status, { ...error });
    }
  },
} satisfies Actions;
