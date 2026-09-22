import type { Actions } from "./$types";

import { fail } from "@sveltejs/kit";
import { setFlash } from "sveltekit-flash-message/server";

import { getMe } from "$lib/api/accounts";
import { createFeedback, type Feedback } from "$lib/api/feedback";

export const actions = {
  feedback: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    // the ticket credits whoever is signed in, so look them up from the
    // session rather than trusting what the form sends
    const me = await getMe(fetch);

    // open a Zendesk ticket for the feedback
    const feedback: Feedback = {
      type: String(data.get("type") ?? ""),
      message: String(data.get("message") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      url: String(data.get("url") ?? ""),
      user: me,
    };

    if (!feedback.message) {
      return fail(400, { message: "Please tell us what's on your mind." });
    }

    // Zendesk needs an email address to open a ticket and follow up
    if (!feedback.email) {
      return fail(400, { message: "Please provide an email address." });
    }

    try {
      await createFeedback(feedback, fetch);
      setFlash(
        {
          message: "Feedback received, thanks for using DocumentCloud!",
          status: "success",
        },
        cookies,
      );
      return { success: true };
    } catch (e) {
      console.error("Could not open a Zendesk ticket", e);
      return fail(500);
    }
  },
} satisfies Actions;
