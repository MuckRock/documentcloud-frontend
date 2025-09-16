<!-- @component
Global process manager for things happening in the background.
Processing documents and running add-ons get updated on a timer.
This makes the state of those processes available via context.
-->

<script lang="ts" context="module">
  import type { Maybe, Pending, Run } from "$lib/api/types";

  import { invalidate, invalidateAll } from "$app/navigation";

  import throttle from "lodash-es/throttle";
  import {
    getContext,
    setContext,
    onMount,
    afterUpdate,
    onDestroy,
  } from "svelte";
  import { type Writable, writable, derived } from "svelte/store";

  import { history } from "$lib/api/addons";
  import { pending } from "$lib/api/documents";
  import { POLL_INTERVAL } from "@/config/config";

  interface ProcessContext {
    documents: Writable<Pending[]>;
    finished: Writable<Set<number>>;
    addons: Writable<Run[]>;
    load: () => void;
  }

  interface Debounced {
    (): Promise<void>;
    cancel: () => void;
    flush: () => void;
  }

  export function getPendingDocuments(): Maybe<Writable<Pending[]>> {
    return getContext<ProcessContext>("processing")?.documents;
  }

  export function getFinishedDocuments(): Maybe<Writable<Set<number>>> {
    return getContext<ProcessContext>("processing")?.finished;
  }

  export function getRunningAddons(): Maybe<Writable<Run[]>> {
    return getContext<ProcessContext>("processing")?.addons;
  }

  export function getProcessLoader(): Maybe<() => void> {
    return getContext<ProcessContext>("processing")?.load;
  }

  export let addons: Writable<Run[]> = writable([]);
  export let documents: Writable<Pending[]> = writable([]);
  export let finished: Writable<Set<number>> = writable(new Set());

  // loading, exported so other components can restart this process
  async function _load() {
    const inProgress = await pending();
    documents.set(inProgress);

    // if we've processed these docs before, take them out of finished
    if (inProgress.length > 0) {
      finished.update((f) => {
        inProgress.forEach((d) => f.delete(d.doc_id));
        return f;
      });
    }

    // addons
    const { data, error } = await history({ dismissed: false, per_page: 100 });
    if (!error && data) {
      addons.set(data.results);
    }
  }

  // throttled load
  export const load: Debounced = throttle(_load, POLL_INTERVAL, {
    leading: true,
    trailing: true,
  }) as Debounced;
</script>

<script lang="ts">
  // keep track of processed documents
  let started: Set<number> = new Set();

  const currentIds = derived(
    documents,
    ($documents) => new Set($documents.map((d) => d.doc_id)),
  );

  // stores we need deeper in the component tree, available via context
  setContext<ProcessContext>("processing", {
    addons,
    documents,
    load,
    finished,
  });

  onMount(() => {
    load();
    // started grows indefinitely, so we need to manage it here
    return documents.subscribe((docs) => {
      started = new Set([...started, ...docs.map((d) => d.doc_id)]);
    });
  });

  afterUpdate(() => {
    if ($documents.length > 0 || $addons.length > 0) {
      load();
    }

    started.forEach((d) => {
      if (!$currentIds.has(d) && !$finished.has(d)) {
        // invalidate finished
        finished.update((f) => new Set([...f, d]));
        invalidate(`document:${d}`);
      }
    });
  });

  onDestroy(() => {
    if (load.cancel) {
      load.cancel();
    }
  });
</script>

<slot />
