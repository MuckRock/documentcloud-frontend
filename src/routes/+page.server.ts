import { _ } from "svelte-i18n";
import { createFeedback, type Feedback } from "@/lib/api/feedback";
import type { Actions } from "./$types";

export const actions = {
  feedback: async ({ request, fetch }) => {
    const data = await request.formData();
    // POST form data to baserow
    const feedback: Feedback = {
      Type: String(data.get("type")) ?? "",
      Message: String(data.get("message")) ?? "",
      User: String(data.get("user")) ?? "",
    };
    try {
      await createFeedback(feedback, fetch);
      return { success: true };
    } catch (e) {
      return { error: String(e) };
    }
  },
} satisfies Actions;
