import type { Actions } from "@sveltejs/kit";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getAddon, buildPayload, dispatch } from "$lib/api/addons";

export const actions = {
  async dispatch({ cookies, fetch, request, params }) {
    const [form, addon] = await Promise.all([
      request.formData(),
      getAddon(params.owner, params.repo, fetch),
    ]);

    const payload = buildPayload(addon, form, true);

    if (!payload.valid) {
      return fail(400, { errors: payload.errors });
    }

    const csrf_token = cookies.get(CSRF_COOKIE_NAME);

    const { data, error } = await dispatch(payload, csrf_token, fetch);

    if (error) {
      return fail(error.status, { ...error });
    }

    const type = payload.event ? "event" : "run";
    return {
      type,
      [type]: data,
    };
  },
} satisfies Actions;
