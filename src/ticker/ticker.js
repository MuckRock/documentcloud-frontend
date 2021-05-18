import { Svue } from "svue";

import { documents } from "@/manager/documents";
import { layout } from "@/viewer/layout";
import { entities } from "@/entities/entities";
import { batchDelay } from "@/util/batchDelay";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL);
const GET_BATCH_DELAY = parseInt(process.env.GET_BATCH_DELAY);

export const ticker = new Svue({
  data() {
    return {
      documents,
      layout,
      entities,
      triggered: false,
    };
  },
  computed: {
    events(documents, layout, entities) {
      // Add events from all possible sources here
      return [
        ...documents.pollEvents,
        ...layout.pollEvents,
        ...entities.pollEvents,
      ];
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
  await batchDelay(
    ticker.events,
    1,
    GET_BATCH_DELAY,
    (x) => x[0](),
    (e) => console.error("error updating some poll events", e),
  );

  // Set the timer after events have processed
  setTimeout(triggerTimer, POLL_INTERVAL);
}
