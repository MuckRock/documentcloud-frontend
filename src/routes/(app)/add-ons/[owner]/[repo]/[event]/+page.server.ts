import type { Actions } from "@sveltejs/kit";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getEvent, buildPayload, update } from "$lib/api/addons";

export const actions = {
  async update({ cookies, fetch, params, request }) {
    // todo: figure out how to skip reloading the event and addon
    const [form, event] = await Promise.all([
      request.formData(),
      getEvent(+params.event, fetch),
    ]);
    const addon = event.data.addon;
    const payload = buildPayload(addon, form, true);

    if (!payload.valid) {
      return fail(400, { errors: payload.errors });
    }

    const csrf_token = cookies.get(CSRF_COOKIE_NAME);

    const { data, error } = await update(
      +params.event,
      payload,
      csrf_token,
      fetch,
    );

    if (error) {
      return fail(error.status, { ...error });
    }

    return {
      type: "event",
      event: data,
    };
  },
} satisfies Actions;
