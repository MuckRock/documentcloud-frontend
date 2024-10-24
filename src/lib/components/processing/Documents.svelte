<!-- @component
Fetch and display the status of all pending documents.
This component should update on a timer.

This component keeps track of pending items it has seen,
so we can invalidate documents as they finish processing.
-->
<script context="module" lang="ts">
  import type { Document, Nullable, Pending } from "$lib/api/types";

  export function getProgress(process: Pending): number {
    const { texts, images, text_positions, pages } = process;
    if (pages === null) return 0;

    const remaining = (texts + images + text_positions) / 3;

    return (pages - remaining) / pages;
  }

  export function getStatus(process: Pending): Status {
    switch (getProgress(process)) {
      case 1:
        return "success";
      default:
        return "in_progress";
    }
  }
</script>

<script lang="ts">
  import type { Status } from "@/addons/types";

  import { invalidate } from "$app/navigation";

  import { onMount, onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { File16, IssueReopened16 } from "svelte-octicons";

  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Process from "./Process.svelte";
  import Reprocess from "../forms/Reprocess.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  import { POLL_INTERVAL } from "@/config/config";
  import { canonicalUrl, list, pending } from "$lib/api/documents";
  import { getPendingDocuments } from "./ProcessContext.svelte";

  let documents: Map<number, Document> = new Map();
  let seen: Set<number> = new Set();
  let finished: number[] = [];
  let timeout: string | number | NodeJS.Timeout;
  let loading = false;
  let reprocess: Nullable<Document> = null;

  const current = getPendingDocuments();

  onMount(() => {
    // await load();
  });

  onDestroy(() => {
    stop();
  });

  // update whenever $current changes
  $: update($current);

  async function update(current: Pending[]) {
    // track our initial set
    current.forEach((d) => seen.add(d.doc_id));

    const ids = new Set(current.map((d) => d.doc_id));
    const to_fetch = current
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
  }

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

{#if $current.length}
  <SidebarGroup name="processing.documents">
    <SidebarItem slot="title">
      <File16 slot="start" />
      {$_("processing.documents")}
    </SidebarItem>
    {#each $current as process (process.doc_id)}
      {@const document = documents.get(process.doc_id)}
      <div role="menuitem" animate:flip>
        <Process
          name={document?.title}
          href={document ? canonicalUrl(document).href : undefined}
          status={getStatus(process)}
          progress={getProgress(process)}
        >
          <Flex slot="actions">
            <Tooltip caption={$_("bulk.actions.reprocess")}>
              <Button
                ghost
                minW={false}
                mode="danger"
                on:click={() => (reprocess = document)}
              >
                <IssueReopened16 />
              </Button>
            </Tooltip>
          </Flex>
        </Process>
      </div>
    {/each}
  </SidebarGroup>
{/if}
{#if reprocess}
  <Portal>
    <Modal on:close={() => (reprocess = null)}>
      <h1 slot="title">{$_("dialogReprocessDialog.title")}</h1>
      <Reprocess documents={[reprocess]} on:close={() => (reprocess = null)} />
    </Modal>
  </Portal>
{/if}
