import type { Actions } from "@sveltejs/kit";
import type {
  APIResponse,
  Run,
  Event,
  Maybe,
  ValidationError,
} from "@/lib/api/types";

import { fail } from "@sveltejs/kit";
import { CSRF_COOKIE_NAME } from "@/config/config.js";

import { getAddon, buildPayload, dispatch } from "$lib/api/addons";
import { setFlash } from "sveltekit-flash-message/server";

export const actions = {
  // create an add-on run, and possibly schedule an event
  async dispatch({ cookies, fetch, request, params }) {
    const { owner, repo } = params;
    if (!owner || !repo) {
      return fail(400, { message: "Missing required param" });
    }

    const [form, addon] = await Promise.all([
      request.formData(),
      getAddon(owner, repo, fetch),
    ]);
    if (!addon) {
      return fail(404, { message: "Add-On not found" });
    }

    const { event, ...payload } = buildPayload(addon, form, true);
    if (!payload.valid) {
      return fail(400, { errors: payload.errors });
    }

    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    if (!csrf_token) {
      return fail(403, { message: "Missing CSRF token" });
    }

    const promises = [];

    // dispatch
    const run = await dispatch(payload, csrf_token, fetch);

    // maybe schedule
    let scheduled: Maybe<APIResponse<Run | Event, ValidationError>> = undefined;
    if (event) {
      scheduled = await dispatch({ event, ...payload }, csrf_token, fetch);
      if (scheduled.error) {
        setFlash(
          { message: scheduled.error.message, status: "error" },
          cookies,
        );
        return fail(scheduled.error.status, { ...run.error });
      }
    }

    if (run.error) {
      setFlash({ message: run.error.message, status: "error" }, cookies);
      return fail(run.error.status, { ...run.error });
    }

    const type = event ? "event" : "run";
    const message = event ? "Event scheduled" : "Run dispatched";
    setFlash({ message, status: "success" }, cookies);
    return {
      type,
      run: run.data,
      event: scheduled?.data ?? {},
    };
  },
} satisfies Actions;
