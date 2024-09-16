<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { FileDirectory24, Hourglass24 } from "svelte-octicons";

  import BulkActions from "$lib/components/forms/BulkActions.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import PendingDocs from "$lib/components/documents/Pending.svelte";
  import ContentLayout from "@/lib/components/layouts/ContentLayout.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import type { DocumentResults, Pending, Project } from "@/lib/api/types";

  setContext("selected", selected);

  interface UITextProps {
    loading: string;
    error: string;
    empty: string;
    search: string;
  }

  export let documents: Promise<DocumentResults>;
  export let query: string = "";
  export let project: Project = null;
  export let pending: Promise<Pending[]> = Promise.resolve([]);
  export let uiText: UITextProps = {
    loading: $_("common.loading"),
    error: $_("common.error"),
    empty: $_("common.empty"),
    search: $_("common.search"),
  };

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <BulkActions slot="left" />
    <Search slot="right" name="q" {query} placeholder={uiText.search} />
  </PageToolbar>
  {#await documents}
    <Empty icon={Hourglass24}>{uiText.loading}</Empty>
  {:then documentsResults}
    {#if !query && !documentsResults.results?.length}
      <Empty icon={FileDirectory24}>{uiText.empty}</Empty>
    {:else}
      <ResultsList
        results={documentsResults.results}
        next={documentsResults.next}
        count={documentsResults.count}
        auto
      >
        <svelte:fragment slot="start">
          {#await pending then p}
            <PendingDocs pending={p} />
          {/await}
        </svelte:fragment>
      </ResultsList>
    {/if}
  {:catch}
    <Error>{uiText.error}</Error>
  {/await}
  <PageToolbar slot="footer">
    <label slot="left" class="select-all">
      <input
        type="checkbox"
        name="select_all"
        checked={$selected.length > 0 && $selected.length === $visible.size}
        indeterminate={$selected.length > 0 && $selected.length < $visible.size}
        on:change={selectAll}
      />
      {#if $selected.length > 0}
        {$selected.length.toLocaleString()} {$_("inputs.selected")}
      {:else}
        {$_("inputs.selectAll")}
      {/if}
    </label>

    <svelte:fragment slot="right">
      {#if $visible && $total}
        {$_("inputs.resultsCount", {
          values: { n: $visible.size, total: $total },
        })}
      {/if}
    </svelte:fragment>
  </PageToolbar>
</ContentLayout>

<style>
  label.select-all {
    align-items: center;
    align-self: stretch;
    display: flex;
    gap: 0.5rem;
  }

  input[type="checkbox"] {
    height: 1.25rem;
    width: 1.25rem;
  }
</style>
