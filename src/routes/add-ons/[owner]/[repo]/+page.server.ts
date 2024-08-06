import type { Actions } from "@sveltejs/kit";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getAddon, buildPayload, dispatch } from "$lib/api/addons";
import { isErrorCode } from "$lib/utils";

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

    const resp = await dispatch(payload, csrf_token, fetch).catch(
      console.error,
    );

    if (!resp) {
      return fail(500, { errors: ["API error"] });
    }

    if (isErrorCode(resp.status)) {
      return fail(resp.status, { errors: [resp.statusText] });
    }

    return {
      success: resp.ok,
      run: await resp.json(),
    };
  },
} satisfies Actions;
