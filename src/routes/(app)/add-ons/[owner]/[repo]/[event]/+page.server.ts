import type { Actions } from "@sveltejs/kit";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getEvent, buildPayload, update } from "$lib/api/addons";
import { isErrorCode } from "$lib/utils";

export const actions = {
  async update({ cookies, fetch, params, request }) {
    const [form, event] = await Promise.all([
      request.formData(),
      getEvent(+params.event, fetch),
    ]);
    const addon = event.addon;
    const payload = buildPayload(addon, form, true);

    if (!payload.valid) {
      return fail(400, { errors: payload.errors });
    }

    const csrf_token = cookies.get(CSRF_COOKIE_NAME);

    const resp = await update(+event.id, payload, csrf_token, fetch).catch(
      console.error,
    );

    if (!resp) {
      return fail(500, { errors: ["API error"] });
    }

    if (isErrorCode(resp.status)) {
      return fail(resp.status, { errors: [await resp.json()] });
    }

    return {
      success: resp.ok,
      event: await resp.json(),
    };
  },
} satisfies Actions;
