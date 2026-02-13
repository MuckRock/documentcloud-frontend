<script lang="ts">
  import type {
    APIResponse,
    Document,
    DocumentResults,
    Maybe,
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
  import NavItem from "$lib/components/common/NavItem.svelte";

  // Document comopnents
  import ResultsList, {
    editable,
    selected,
    selectedIds,
    total,
    visible,
    visibleFields,
  } from "$lib/components/documents/ResultsList.svelte";
  import { setVisibleFieldsContext } from "$lib/components/documents/VisibleFields.svelte";

  // Form components
  import Dropzone from "$lib/components/inputs/Dropzone.svelte";
  import DocumentActions from "$lib/components/sidebar/DocumentActions.svelte";
  import {
    filesToUpload,
    uploadToProject,
  } from "$lib/components/forms/Upload.svelte";

  // Layout comopnents
  import ContentLayout from "./ContentLayout.svelte";
  import DocumentListToolbar from "../toolbars/DocumentListToolbar.svelte";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import Unverified from "../accounts/Unverified.svelte";

  import { sidebars } from "$lib/components/layouts/Sidebar.svelte";
  import {
    getPendingDocuments,
    getFinishedDocuments,
  } from "$lib/components/processing/ProcessContext.svelte";

  // Utilities
  import { deleted, edited, DEFAULT_EXPAND } from "$lib/api/documents";
  import { isSupported } from "$lib/utils/files";
  import { canUploadFiles, getCurrentUser } from "$lib/utils/permissions";
  import { remToPx } from "$lib/utils/layout";

  interface UITextProps {
    loading: string;
    error: string;
    empty: string;
    search: string;
  }

  // these just pass through
  setContext("editable", editable);
  setContext("selected", selected);
  setVisibleFieldsContext(visibleFields);

  const embed: boolean = getContext("embed");
  const me = getCurrentUser();
  const pending = getPendingDocuments();
  const finished = getFinishedDocuments();

  interface Props {
    documents: Promise<APIResponse<DocumentResults, any>>;
    query?: string;
    project?: Nullable<Project>;
    uiText?: UITextProps;
  }

  let {
    documents,
    query = "",
    project = null,
    uiText = {
      loading: "common.loading",
      error: "common.error",
      empty: "common.empty",
      search: "common.search",
    },
  }: Props = $props();

  let footerToolbarWidth: number = $state(800);

  function fixResults(
    documents: Promise<APIResponse<DocumentResults, any>>,
    deleted: Set<string>,
    edited: Map<string, Document>,
    pending_ids: Set<string>,
    finished: Maybe<Set<number>>,
  ): Promise<DocumentResults> {
    return documents
      .then((r) => excludeDeleted(deleted, r.data))
      .then((r) => patchEdited(edited, r))
      .then((r) => setPendingStatus(r, pending_ids, finished));
  }

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

  function patchEdited(
    edited: Map<string, Document>,
    searchResults?: DocumentResults,
  ): DocumentResults {
    if (!searchResults)
      return { count: 0, results: [], next: null, previous: null };

    if (edited.size === 0) return searchResults;

    console.debug(`Patching ${edited.size} documents`);
    const updated = searchResults.results.map((d) => {
      const edit = edited.get(String(d.id));

      if (edit && edit.updated_at > d.updated_at) {
        console.debug(`Patching: ${edit.title}`);
        for (const [k, v] of Object.entries(edit)) {
          // ignore expandable fields and id
          if (![...DEFAULT_EXPAND, "id"].includes(k)) {
            d[k] = v;
          }
        }
      }

      return d;
    });

    return {
      ...searchResults,
      results: updated,
    };
  }

  function setPendingStatus(
    documents: DocumentResults,
    pending_ids: Set<string>,
    finished: Maybe<Set<number>>,
  ): DocumentResults {
    if (pending_ids.size === 0 && finished?.size === 0) return documents;

    const updated = documents.results.map((d) => {
      if (pending_ids.has(String(d.id))) {
        d.status = "pending";
      }

      if (finished?.has(+d.id)) {
        d.status = "success";
      }
      return d;
    });

    return {
      ...documents,
      results: updated,
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
  let BREAKPOINTS = $derived({
    HIDE_COUNT: footerToolbarWidth < remToPx(26),
  });
  let pending_ids = $derived(new Set($pending?.map((d) => String(d.doc_id))));
  let searchResults = $derived(
    fixResults(documents, $deleted, $edited, pending_ids, $finished),
  );
</script>

<div class="container">
  <Dropzone {onDrop} disabled={!canUploadFiles($me)}>
    {#snippet children({ active, disabled })}
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
        {#snippet header()}
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
        {/snippet}
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
              {#snippet start()}
                {#if $me && !canUploadFiles($me)}
                  <Unverified user={$me} />
                {/if}
              {/snippet}
            </ResultsList>
          {/if}
        {:catch}
          <Error>{$_(uiText.error)}</Error>
        {/await}
        {#snippet footer()}
          {#if !embed}
            <div class="toolbar" bind:clientWidth={footerToolbarWidth}>
              <Flex align="center">
                <NavItem>
                  <label class="select-all">
                    <input
                      type="checkbox"
                      name="select_all"
                      checked={$selected.length > 0 &&
                        $selected.length === $visible.size}
                      indeterminate={$selected.length > 0 &&
                        $selected.length < $visible.size}
                      onchange={selectAll}
                    />
                    {#if $selected.length > 0}
                      {$selected.length.toLocaleString()}
                      {$_("inputs.selected")}
                    {:else}
                      {$_("inputs.selectAll")}
                    {/if}
                  </label>
                </NavItem>
                <Dropdown position="top-start">
                  <NavItem
                    slot="anchor"
                    disabled={!$me || $selected?.length < 1 || !$editable}
                  >
                    {$_("bulk.title")}
                    <ChevronUp12 slot="end" />
                  </NavItem>

                  <Menu slot="inner" let:close>
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
        {/snippet}
      </ContentLayout>
    {/snippet}
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
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
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
