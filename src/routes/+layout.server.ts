import { isConfigured } from "$lib/api/feedback";

export async function load() {
  return {
    // there's no point offering the feedback form if we have nowhere to send
    // it, so the UI hides itself when Zendesk isn't configured
    feedbackEnabled: isConfigured(),
  };
}
