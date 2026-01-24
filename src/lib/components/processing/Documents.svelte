<!-- @component
Fetch and display the status of all pending documents.
This component should update on a timer.

This component keeps track of pending items it has seen,
so we can invalidate documents as they finish processing.
-->
<script module lang="ts">
  import type {
    Document,
    Maybe,
    Nullable,
    Pending,
    RunStatus,
  } from "$lib/api/types";

  export function getProgress(process: Pending): number {
    const { texts, images, text_positions, pages } = process;
    if (pages === null) return 0;

    const remaining = (texts + images + text_positions) / 3;

    return (pages - remaining) / pages;
  }

  export function getStatus(process: Pending): RunStatus {
    switch (getProgress(process)) {
      case 1:
        return "success";
      default:
        return "in_progress";
    }
  }
</script>

<script lang="ts">
  import { invalidate } from "$app/navigation";

  import { onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { File16, IssueReopened16 } from "svelte-octicons";

  import NavItem from "$lib/components/common/NavItem.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Process from "./Process.svelte";
  import Reprocess from "../forms/Reprocess.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  import { canonicalUrl, list } from "$lib/api/documents";
  import { getPendingDocuments } from "./ProcessContext.svelte";

  let documents: Map<number, Document> = $state(new Map());
  let seen: Set<number> = new Set();
  let finished: number[] = [];
  let timeout: Nullable<string | number | NodeJS.Timeout>;
  let reprocess: Nullable<Maybe<Document>> = $state(null);

  const current = getPendingDocuments();

  onDestroy(() => {
    stop();
  });

  async function update(current: Maybe<Pending[]>) {
    // track our initial set
    current?.forEach((d) => seen.add(d.doc_id));

    const ids = new Set(current?.map((d) => d.doc_id));
    const to_fetch = current
      ?.filter((d) => !documents.has(d.doc_id))
      .map((d) => d.doc_id);

    if (to_fetch?.length && to_fetch.length > 0) {
      const { data, error } = await list({ id__in: to_fetch.join(",") });
      if (!error) {
        data?.results.forEach((d) => documents.set(+d.id, d));
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

  function stop() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  // update whenever $current changes
  $effect(() => {
    update($current);
  });
</script>

{#if $current?.length}
  <SidebarGroup name="processing.documents">
    {#snippet title()}
      <NavItem>
        <File16 slot="start" />
        {$_("processing.documents")}
      </NavItem>
    {/snippet}
    {#each $current as process (process.doc_id)}
      {@const document = documents.get(process.doc_id)}
      <div role="menuitem" animate:flip>
        {#if document}
          <Process
            status={getStatus(process)}
            progress={getProgress(process)}
            spin
          >
            <a href={canonicalUrl(document).href} class="name">
              {document?.title}
            </a>
            {#snippet actions()}
              <Flex>
                <Tooltip caption={$_("bulk.actions.reprocess")}>
                  <Button
                    ghost
                    minW={false}
                    mode="danger"
                    onclick={() => (reprocess = document)}
                  >
                    <IssueReopened16 />
                  </Button>
                </Tooltip>
              </Flex>
            {/snippet}
          </Process>
        {/if}
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

<style>
  .name {
    flex: 1 1 auto;
    font-weight: var(--font-semibold);
    color: var(--gray-5);
  }
  a.name:hover {
    color: var(--blue-3);
  }
</style>
