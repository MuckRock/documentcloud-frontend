import { _ } from "svelte-i18n";
import { createFeedback, type Feedback } from "@/lib/api/feedback";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { setFlash } from "sveltekit-flash-message/server";

export const actions = {
  feedback: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    // POST form data to baserow
    const feedback: Feedback = {
      Type: String(data.get("type")) ?? "",
      Message: String(data.get("message")) ?? "",
      User: String(data.get("user")) ?? "",
    };
    try {
      await createFeedback(feedback, fetch);
      setFlash(
        {
          message: "Feedback recieved, thanks for using DocumentCloud!",
          status: "success",
        },
        cookies,
      );
      return { success: true };
    } catch (e) {
      setFlash({ message: e.message, status: "error" }, cookies);
      fail(500, { message: String(e) });
    }
  },
} satisfies Actions;
