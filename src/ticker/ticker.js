import { Svue } from "svue";

import { documents } from "@/manager/documents";
import { layout } from "@/viewer/layout";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL);

export const ticker = new Svue({
  data() {
    return {
      documents,
      layout,
      triggered: false,
    };
  },
  computed: {
    events(documents, layout) {
      // Add events from all possible sources here
      return [...documents.pollEvents, ...layout.pollEvents];
    },
    shouldTrigger(events, triggered) {
      if (events.length > 0 && !triggered) {
        ticker.triggered = true;
        triggerTimer();
      }
    },
  },
});

export async function triggerTimer() {
  // Run all the events in parallel
  await Promise.all(ticker.events.map((fn) => fn()));

  // Set the timer after events have processed
  setTimeout(triggerTimer, POLL_INTERVAL);
}
