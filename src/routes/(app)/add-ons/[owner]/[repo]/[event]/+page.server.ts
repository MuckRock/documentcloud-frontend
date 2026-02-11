import type { Actions } from "@sveltejs/kit";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getEvent, buildPayload, update, isAddon } from "$lib/api/addons";
import { setFlash } from "sveltekit-flash-message/server";

export const actions = {
  async update({ cookies, fetch, params, request }) {
    // TODO figure out how to skip reloading the event and addon
    const id = Number(params.event);
    const [form, event] = await Promise.all([
      request.formData(),
      getEvent(id, fetch),
    ]);

    // Check for addon
    const addon = event.data?.addon;
    if (!isAddon(addon)) {
      return fail(404, { message: "Add-On not found" });
    }

    // Check for valid payload
    const payload = buildPayload(addon, form, true);
    if (!payload.valid) {
      return fail(400, { errors: payload.errors });
    }

    // Check for CSRF token
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const { data, error } = await update(id, payload, csrf_token, fetch);

    if (error) {
      setFlash({ message: error.message, status: "error" }, cookies);
      return fail(error.status, { ...error });
    }

    setFlash({ message: "Event updated", status: "success" }, cookies);
    return {
      type: "event",
      event: data,
    };
  },
} satisfies Actions;
