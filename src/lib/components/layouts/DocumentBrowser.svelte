<script lang="ts">
  import type {
    Document,
    Nullable,
    Org,
    Project,
    User,
  } from "$lib/api/types";

  import { goto } from "$app/navigation";
  import type { Suggestion } from "$lib/components/documents/search/prosemirror/plugins/autocomplete-data";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Upload24, SidebarExpand16, ChevronUp12 } from "svelte-octicons";

  // Common components
  import Button from "$lib/components/common/Button.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  // Document components
  import ResultsList, {
    visibleFields,
  } from "$lib/components/documents/ResultsList.svelte";
  import { setVisibleFieldsContext } from "$lib/components/documents/VisibleFields.svelte";
  import {
    getSearchResults,
    SearchResultsState,
  } from "$lib/state/search.svelte";

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

  // Utilities
  import { isSupported } from "$lib/utils/files";
  import { canUploadFiles, getCurrentUser } from "$lib/utils/permissions";
  import { remToPx } from "$lib/utils/layout";

  setVisibleFieldsContext(visibleFields);

  const embed: boolean = getContext("embed");
  const me = getCurrentUser();

  interface Props {
    search?: SearchResultsState;
    query?: string;
    project?: Nullable<Project>;
  }

  let {
    search: searchProp,
    query = "",
    project = null,
  }: Props = $props();

  // this lets us pass in non-global search results, for testing
  // will error if neither is present
  const search = $derived(searchProp ?? getSearchResults());

  let footerToolbarWidth: number = $state(800);

  function selectAll(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      search.selectAll();
    } else {
      search.deselectAll();
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

  /**
   * Extract autocomplete suggestions from the current search results.
   * Uses expanded user/org objects on documents to provide contextually
   * relevant suggestions without an API call.
   */
  function extractSuggestions(docs: MapIterator<Document>): Record<string, Suggestion[]> {
    const users = new Map<string, Suggestion>();
    const orgs = new Map<string, Suggestion>();
    const documents = new Map<string, Suggestion>();
    // data_* and tag values: keyed by field name, deduped by value
    const dataFields = new Map<string, Map<string, Suggestion>>();

    for (const doc of docs) {
      // User (expanded object when DEFAULT_EXPAND includes "user")
      if (typeof doc.user === "object" && doc.user) {
        const u = doc.user as User;
        const key = String(u.id);
        if (!users.has(key)) {
          users.set(key, { label: u.name || u.username, value: key });
        }
      }

      // Organization (expanded object when DEFAULT_EXPAND includes "organization")
      if (typeof doc.organization === "object" && doc.organization) {
        const o = doc.organization as Org;
        const key = String(o.id);
        if (!orgs.has(key)) {
          orgs.set(key, { label: o.name, value: key });
        }
      }

      // Document itself
      const dKey = String(doc.id);
      if (!documents.has(dKey)) {
        documents.set(dKey, { label: doc.title, value: dKey });
      }

      // Extract tag and data_* values from doc.data
      if (doc.data) {
        for (const [rawKey, values] of Object.entries(doc.data)) {
          if (!Array.isArray(values)) continue;
          // "_tag" key maps to the "tag" search field;
          // other keys need the "data_" prefix for Lucene syntax
          const fieldName =
            rawKey === "_tag" ? "tag" : `data_${rawKey}`;
          if (!dataFields.has(fieldName)) {
            dataFields.set(fieldName, new Map());
          }
          const fieldMap = dataFields.get(fieldName)!;
          for (const v of values) {
            if (!fieldMap.has(v)) {
              fieldMap.set(v, { label: v, value: v });
            }
          }
        }
      }
    }

    const result: Record<string, Suggestion[]> = {};
    if (users.size) result.user = [...users.values()];
    if (orgs.size) result.organization = [...orgs.values()];
    if (documents.size) result.document = [...documents.values()];
    for (const [fieldName, valueMap] of dataFields) {
      if (valueMap.size) result[fieldName] = [...valueMap.values()];
    }
    return result;
  }

  // Update preloaded suggestions when search results change
  let preloadedSuggestions: Record<string, Suggestion[]> = $derived(extractSuggestions(search.results));
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
              <DocumentListToolbar {query} {project} {preloadedSuggestions} />
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
        <ResultsList {search} auto>
          {#snippet start()}
            {#if $me && !canUploadFiles($me)}
              <Unverified user={$me} />
            {/if}
          {/snippet}
        </ResultsList>
        {#snippet footer()}
          {#if !embed}
            <div class="toolbar" bind:clientWidth={footerToolbarWidth}>
              <Flex align="center">
                <NavItem>
                  <label class="select-all">
                    <input
                      type="checkbox"
                      name="select_all"
                      checked={search.selected.length > 0 &&
                        search.selected.length === search.visible.size}
                      indeterminate={search.selected.length > 0 &&
                        search.selected.length < search.visible.size}
                      onchange={selectAll}
                    />
                    {#if search.selected.length > 0}
                      {search.selected.length.toLocaleString()}
                      {$_("inputs.selected")}
                    {:else}
                      {$_("inputs.selectAll")}
                    {/if}
                  </label>
                </NavItem>
                <Dropdown position="top-start">
                  <NavItem
                    slot="anchor"
                    disabled={!$me ||
                      search.selected.length < 1 ||
                      !search.editable}
                  >
                    {$_("bulk.title")}
                    <ChevronUp12 slot="end" />
                  </NavItem>

                  <Menu slot="inner" let:close>
                    <DocumentActions afterClick={() => close()} />
                  </Menu>
                </Dropdown>
              </Flex>
              {#if !BREAKPOINTS.HIDE_COUNT && search.visible && search.total}
                <p class="resultsCount">
                  {$_("inputs.resultsCount", {
                    values: { n: search.visible.size, total: search.total },
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
