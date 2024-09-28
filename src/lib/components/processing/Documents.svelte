<!-- @component
Fetch and display the status of all pending documents.
This component should update on a timer.

This component keeps track of pending items it has seen,
so we can invalidate documents as they finish processing.
-->
<script context="module" lang="ts">
  import { type Writable, writable } from "svelte/store";
  import type { Document, Pending } from "$lib/api/types";

  export const current: Writable<Pending[]> = writable([]);
</script>

<script lang="ts">
  import { invalidate } from "$app/navigation";

  import { onMount, onDestroy } from "svelte";
  import { _ } from "svelte-i18n";

  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import PendingDocument from "./PendingDocument.svelte";

  import { POLL_INTERVAL } from "@/config/config";
  import { list, pending } from "$lib/api/documents";

  let documents: Map<number, Document> = new Map();
  let seen: Set<number> = new Set();
  let finished: number[] = [];
  let timeout: string | number | NodeJS.Timeout;
  let loading = false;

  onMount(async () => {
    await load();
  });

  onDestroy(() => {
    stop();
  });

  async function load() {
    if (loading) return;
    loading = true;
    if ($current.length === 0 || timeout) {
      $current = await pending();
    }

    // track our initial set
    $current.forEach((d) => seen.add(d.doc_id));

    const ids = new Set($current.map((d) => d.doc_id));
    const to_fetch = $current
      .filter((d) => !documents.has(d.doc_id))
      .map((d) => d.doc_id);

    if (to_fetch.length > 0) {
      const { data, error } = await list({ id__in: to_fetch.join(",") });
      if (!error) {
        data.results.forEach((d) => documents.set(+d.id, d));
        documents = documents;
      }
    }

    // finished are seen IDs not in current
    seen.forEach((id) => {
      if (!ids.has(id)) {
        finished.push(id);
      }
    });

    // invalidate and empty our queue
    while (finished.length > 1) {
      const id = finished.pop();
      invalidate(`documents:${id}`);
    }

    // set the timer for next update if we still have pending
    loading = false;
    if ($current.length > 0) {
      timeout = setTimeout(load, POLL_INTERVAL);
    } else {
      stop();
    }
  }

  function stop() {
    clearTimeout(timeout);
    timeout = null;
  }
</script>

<SidebarGroup name="processing.documents">
  <SidebarItem slot="title">
    {$_("processing.documents")}
  </SidebarItem>
  {#each $current as status}
    <PendingDocument {status} document={documents.get(status.doc_id)} />
  {/each}
</SidebarGroup>
