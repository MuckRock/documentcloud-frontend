<!-- @component
Global process manager for things happening in the background.
Processing documents and running add-ons get updated on a timer.
This makes the state of those processes available via context.
-->

<script lang="ts" context="module">
  import type { Maybe, Pending, Run } from "$lib/api/types";

  import throttle from "lodash-es/throttle";
  import {
    getContext,
    setContext,
    onMount,
    afterUpdate,
    onDestroy,
  } from "svelte";
  import { type Writable, writable } from "svelte/store";

  import { history } from "$lib/api/addons";
  import { pending } from "$lib/api/documents";
  import { POLL_INTERVAL } from "@/config/config";

  interface ProcessContext {
    documents: Writable<Pending[]>;
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

  export function getRunningAddons(): Maybe<Writable<Run[]>> {
    return getContext<ProcessContext>("processing")?.addons;
  }

  export function getProcessLoader(): Maybe<() => void> {
    return getContext<ProcessContext>("processing")?.load;
  }

  export let addons: Writable<Run[]> = writable([]);
  export let documents: Writable<Pending[]> = writable([]);

  // loading, exported so other components can restart this process

  async function _load() {
    documents.set(await pending());

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
  // stores we need deeper in the component tree, available via context
  setContext<ProcessContext>("processing", { addons, documents, load });

  onMount(() => {
    load();
  });

  afterUpdate(() => {
    if ($documents.length > 0 || $addons.length > 0) {
      load();
    }
  });

  onDestroy(() => {
    if (load.cancel) {
      load.cancel();
    }
  });
</script>

<slot />
