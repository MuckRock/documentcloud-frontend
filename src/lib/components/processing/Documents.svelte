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

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import PendingDocument from "./PendingDocument.svelte";

  import { list, pending } from "$lib/api/documents";

  let documents: Map<number, Document> = new Map();
  let seen: Set<number> = new Set();
  let finished: number[] = [];

  onMount(async () => {
    await load();
  });

  async function load() {
    if ($current.length === 0) {
      $current = await pending();
    }

    // track our initial set
    $current.forEach((d) => seen.add(d.doc_id));

    const ids = new Set($current.map((d) => d.doc_id));

    const { data, error } = await list({ id__in: [...ids].join(",") });
    if (!error) {
      data.results.forEach((d) => documents.set(+d.id, d));
      documents = documents;
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
  }
</script>

<SidebarGroup>
  {#each $current as status}
    <PendingDocument {status} document={documents.get(status.doc_id)} />
  {/each}
</SidebarGroup>
