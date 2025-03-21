<script lang="ts">
  import type {
    APIResponse,
    DocumentResults,
    Nullable,
    Project,
  } from "$lib/api/types";

  import { goto } from "$app/navigation";

  import { getContext, setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    FileDirectory24,
    Hourglass24,
    Upload24,
    SidebarExpand16,
    ChevronUp12,
  } from "svelte-octicons";

  // Common components
  import Button from "$lib/components/common/Button.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  // Document comopnents
  import ResultsList, {
    selected,
    selectedIds,
    total,
    visible,
    visibleFields,
  } from "$lib/components/documents/ResultsList.svelte";

  // Form components
  import Dropzone from "$lib/components/inputs/Dropzone.svelte";
  import DocumentActions from "$lib/components/sidebar/DocumentActions.svelte";
  import {
    filesToUpload,
    uploadToProject,
  } from "$lib/components/forms/Upload.svelte";

  // Layout comopnents
  import ContentLayout from "./ContentLayout.svelte";
  import DocumentListToolbar from "./DocumentListToolbar.svelte";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import Unverified from "../accounts/Unverified.svelte";
  import { sidebars } from "$lib/components/layouts/Sidebar.svelte";

  // Utilities
  import { deleted } from "$lib/api/documents";
  import { isSupported } from "$lib/utils/files";
  import { canUploadFiles, getCurrentUser } from "$lib/utils/permissions";
  import { remToPx } from "$lib/utils/layout";

  setContext("selected", selected);
  setContext("visibleFields", visibleFields);

  const embed: boolean = getContext("embed");
  const me = getCurrentUser();

  interface UITextProps {
    loading: string;
    error: string;
    empty: string;
    search: string;
  }

  export let documents: Promise<APIResponse<DocumentResults, any>>;
  export let query: string = "";
  export let project: Nullable<Project> = null;
  export let uiText: UITextProps = {
    loading: "common.loading",
    error: "common.error",
    empty: "common.empty",
    search: "common.search",
  };

  let footerToolbarWidth: number;

  $: BREAKPOINTS = {
    HIDE_COUNT: footerToolbarWidth < remToPx(26),
  };

  $: searchResults = documents.then((r) => excludeDeleted($deleted, r.data));

  // filter out deleted documents that haven't been purged from search yet
  function excludeDeleted(
    deleted: Set<string>,
    searchResults?: DocumentResults, // optional params must come second
  ): DocumentResults {
    if (!searchResults)
      return { count: 0, results: [], next: null, previous: null };
    if (deleted.size === 0) return searchResults;

    const filtered =
      searchResults.results.filter((d) => !deleted.has(String(d.id))) ?? [];

    return {
      ...searchResults,
      results: filtered,
      count: (searchResults.count ?? filtered.length) - deleted.size,
    };
  }

  function selectAll(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      $selectedIds = [...$visible.keys()];
    } else {
      $selectedIds = [];
    }
  }

  function onDrop(files: FileList) {
    if (canUploadFiles($me)) {
      $filesToUpload = Array.from(files).filter(isSupported);
      $uploadToProject = project;
      goto("/upload/");
    }
  }
</script>

<div class="container">
  <Dropzone {onDrop} disabled={!canUploadFiles($me)} let:active let:disabled>
    <div class:active class:disabled class="dropOverlay">
      <Empty
        icon={Upload24}
        --color="var(--blue-5)"
        --fill="var(--blue-4)"
        --font-size="var(--font-md)"
        >{$_("documents.dropFile")}
      </Empty>
    </div>
    <ContentLayout>
      <svelte:fragment slot="header">
        {#if !embed}
          <Flex>
            {#if $sidebars["navigation"] === false}
              <div class="toolbar w-auto">
                <Button
                  ghost
                  minW={false}
                  on:click={() => ($sidebars["navigation"] = true)}
                >
                  <span class="flipV">
                    <SidebarExpand16 />
                  </span>
                </Button>
              </div>
            {/if}
            <DocumentListToolbar {query} />
            {#if $sidebars["action"] === false}
              <div class="toolbar w-auto">
                <Button
                  ghost
                  minW={false}
                  on:click={() => ($sidebars["action"] = true)}
                >
                  <SidebarExpand16 />
                </Button>
              </div>
            {/if}
          </Flex>
        {/if}
      </svelte:fragment>
      {#await searchResults}
        <Empty icon={Hourglass24}>{$_(uiText.loading)}</Empty>
      {:then documentsResults}
        {#if !query && !documentsResults.results?.length}
          <Empty icon={FileDirectory24}>{$_(uiText.empty)}</Empty>
        {:else}
          <ResultsList
            results={documentsResults.results}
            next={documentsResults.next}
            count={documentsResults.count}
            auto
          >
            <svelte:fragment slot="start">
              {#if $me && !canUploadFiles($me)}
                <Unverified user={$me} />
              {/if}
            </svelte:fragment>
          </ResultsList>
        {/if}
      {:catch}
        <Error>{$_(uiText.error)}</Error>
      {/await}
      <svelte:fragment slot="footer">
        {#if !embed}
          <div class="toolbar" bind:clientWidth={footerToolbarWidth}>
            <Flex align="center">
              <SidebarItem>
                <label class="select-all">
                  <input
                    type="checkbox"
                    name="select_all"
                    checked={$selected.length > 0 &&
                      $selected.length === $visible.size}
                    indeterminate={$selected.length > 0 &&
                      $selected.length < $visible.size}
                    on:change={selectAll}
                  />
                  {#if $selected.length > 0}
                    {$selected.length.toLocaleString()} {$_("inputs.selected")}
                  {:else}
                    {$_("inputs.selectAll")}
                  {/if}
                </label>
              </SidebarItem>
              <Dropdown position="top-start">
                <SidebarItem
                  slot="anchor"
                  disabled={!$me || $selected?.length < 1}
                >
                  {$_("bulk.title")}
                  <ChevronUp12 slot="end" />
                </SidebarItem>

                <Menu slot="default" let:close>
                  <DocumentActions afterClick={() => close()} />
                </Menu>
              </Dropdown>
            </Flex>
            {#if !BREAKPOINTS.HIDE_COUNT && $visible && $total}
              <p class="resultsCount">
                {$_("inputs.resultsCount", {
                  values: { n: $visible.size, total: $total },
                })}
              </p>
            {/if}
          </div>
        {/if}
      </svelte:fragment>
    </ContentLayout>
  </Dropzone>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
  }

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

  .dropOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: calc(var(--z-toolbar) - 1);
    background: var(--blue-2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.75;
    visibility: hidden;
  }
  .dropOverlay.active {
    visibility: visible;
  }

  .flipV {
    display: flex;
    transform: rotate(180deg);
  }

  .toolbar {
    width: 100%;
    flex-wrap: wrap;
  }
  .w-auto {
    width: auto;
  }
  .resultsCount {
    flex: 1 1 auto;
    text-align: right;
    font-size: var(--font-sm);
    margin: 0.25rem 0.5rem;
  }
  .select-all {
    min-width: 7rem;
    margin: 0.25rem 0;
  }
</style>
