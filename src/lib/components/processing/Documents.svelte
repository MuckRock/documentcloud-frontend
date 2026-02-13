<!-- @component
Fetch and display the status of all pending documents.
Invalidation of finished documents is handled by ProcessContext.
-->
<script module lang="ts">
  import type { Document, Nullable, Pending, RunStatus } from "$lib/api/types";

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
  let reprocess: Nullable<Document> = $state(null);

  const current = getPendingDocuments();

  // fetch document details for display whenever pending list changes
  $effect(() => {
    const to_fetch = $current
      ?.filter((d) => !documents.has(d.doc_id))
      .map((d) => d.doc_id);

    if (to_fetch?.length) {
      list({ id__in: to_fetch.join(",") }).then(({ data, error }) => {
        if (data) {
          data.results.forEach((d) => documents.set(+d.id, d));
          documents = documents;
        }

        if (error) {
          console.warn(error);
        }
      });
    }
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
