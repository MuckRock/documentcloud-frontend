import { Svue } from "svue";

import { documents } from '@/manager/documents';

const POLL_INTERVAL = process.env.POLL_INTERVAL;

export const ticker = new Svue({
  data() {
    return {
      documents,
      triggered: false,
    };
  },
  computed: {
    events(documents) {
      return documents.pollEvents;
    },
    shouldTrigger(events, triggered) {
      if (events.length > 0 && !triggered) {
        ticker.triggered = true;
        triggerTimer();
      }
    }
  }
});

export async function triggerTimer() {
  // Run all the events in parallel
  await Promise.all(ticker.events.map(fn => fn()));

  // Set the timer after events have processed
  setTimeout(triggerTimer, POLL_INTERVAL)
}

