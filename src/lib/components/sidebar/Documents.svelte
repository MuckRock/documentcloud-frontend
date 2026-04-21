<script lang="ts">
  import type { Org, SavedSearch } from "$lib/api/types";
  import type { Writable } from "svelte/store";

  import { getContext, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Bookmark16,
    File16,
    Globe16,
    Lock16,
    Organization16,
    Pencil16,
    Person16,
    Plus16,
    Search16,
  } from "svelte-octicons";
  import { page } from "$app/state";

  import Button from "$lib/components/common/Button.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import SavedSearchForm from "$lib/components/sidebar/SavedSearchForm.svelte";

  import { userDocs, searchUrl } from "$lib/utils/search";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { listAll } from "$lib/api/saved-searches";

  const me = getCurrentUser();
  const org: Writable<Org> = getContext("org");

  // Normalize: the search editor's trailing join operator encodes as "+"
  // in the URL, which URLSearchParams decodes as a space. Trim both.
  let normalizeQuery = (q: string) => q.replace(/[\s+]+$/, "");
  let query = $derived(normalizeQuery(page.url.searchParams?.get("q") || ""));

  let mine = $derived($me ? userDocs($me) : "");
  let minePublic = $derived($me ? userDocs($me, "public") : "");
  let minePrivate = $derived($me ? userDocs($me, "private") : "");

  let orgDocs = $derived($org ? `organization:${$org.id}` : "");

  // Saved searches state
  let savedSearches: SavedSearch[] = $state([]);
  let loadingSavedSearches = $state(true);

  let editing: SavedSearch | "create" | null = $state(null);

  // All queries that are already represented in the sidebar
  let builtInQueries = $derived(
    [mine, minePublic, minePrivate, orgDocs].filter(Boolean),
  );

  let isCurrentSearchSaved = $derived(
    !query ||
      builtInQueries.includes(query) ||
      savedSearches.some((s) => normalizeQuery(s.query) === query),
  );

  let saveSearchTooltip = $derived(
    !query
      ? $_("documents.savedSearches.noSearch")
      : isCurrentSearchSaved
        ? $_("documents.savedSearches.alreadySaved")
        : $_("documents.savedSearches.saveTitle"),
  );

  onMount(async () => {
    try {
      savedSearches = await listAll();
    } finally {
      loadingSavedSearches = false;
    }
  });

  function handleSave(saved: SavedSearch) {
    const idx = savedSearches.findIndex((s) => s.uuid === saved.uuid);
    if (idx >= 0) {
      savedSearches[idx] = saved;
    } else {
      savedSearches = [...savedSearches, saved];
    }
  }

  function handleDelete(uuid: string) {
    savedSearches = savedSearches.filter((s) => s.uuid !== uuid);
  }
</script>

<SignedIn>
  <SidebarGroup name="documents">
    {#snippet title()}
      <NavItem>
        {#snippet start()}
          <File16 />
        {/snippet}
        {$_("documents.documents")}
      </NavItem>
    {/snippet}

    {#snippet action()}
      <Button ghost minW={false} mode="primary" size="small" href="/documents">
        <Search16 height="14" width="14" />
        {$_("common.explore")}
      </Button>
    {/snippet}

    <NavItem small hover href={searchUrl(mine).href} active={query === mine}>
      {#snippet start()}
        <Person16 height={14} width={14} />
      {/snippet}
      {$_("documents.yourDocuments")}
    </NavItem>
    <NavItem
      small
      hover
      href={searchUrl(minePrivate).href}
      active={query === minePrivate}
    >
      {#snippet start()}
        <Lock16 height={14} width={14} />
      {/snippet}
      {$_("documents.accessDocuments", {
        values: { access: "Private " },
      })}
    </NavItem>
    <NavItem
      small
      hover
      href={searchUrl(minePublic).href}
      active={query === minePublic}
    >
      {#snippet start()}
        <Globe16 height={14} width={14} />
      {/snippet}
      {$_("documents.accessDocuments", {
        values: { access: "Public " },
      })}
    </NavItem>
    {#if $org && !$org.individual}
      <NavItem
        small
        hover
        href={searchUrl(orgDocs).href}
        active={query === orgDocs}
      >
        {#snippet start()}
          <Organization16 height={14} width={14} />
        {/snippet}
        {$_("documents.nameDocuments", {
          values: { name: $org.name, access: "" },
        })}
      </NavItem>
    {/if}

    <div class="saved-searches">
      {#if loadingSavedSearches}
        <p class="help">
          {$_("documents.savedSearches.loading")}
        </p>
      {:else}
        {#each savedSearches as savedSearch (savedSearch.uuid)}
          <NavItem
            small
            hover
            href={searchUrl(savedSearch.query).href}
            active={query === savedSearch.query}
          >
            {#snippet start()}
              <Bookmark16 height={14} width={14} />
            {/snippet}
            {savedSearch.name}
            {#snippet end()}
              <span>
                <Button
                  ghost
                  minW={false}
                  size="small"
                  title={$_("documents.savedSearches.edit")}
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editing = savedSearch;
                  }}
                >
                  <Pencil16 height={12} width={12} />
                </Button>
              </span>
            {/snippet}
          </NavItem>
        {:else}
          <p class="help">
            {$_("documents.savedSearches.empty")}
          </p>
        {/each}
      {/if}

      <Tooltip caption={saveSearchTooltip}>
        <Button
          ghost
          mode="primary"
          minW={false}
          size="small"
          disabled={isCurrentSearchSaved}
          title={$_("documents.savedSearches.saveTitle")}
          onclick={() => (editing = "create")}
        >
          <Plus16 height={14} width={14} />
          {$_("documents.savedSearches.save")}
        </Button>
      </Tooltip>
    </div>
  </SidebarGroup>
  {#snippet signedOut()}
    <NavItem href={searchUrl("").href}>
      {#snippet start()}
        <File16 />
      {/snippet}
      {$_("documents.publicDocuments")}
    </NavItem>
  {/snippet}
</SignedIn>

{#if editing}
  <Portal>
    <Modal on:close={() => (editing = null)}>
      <h1 slot="title">
        {editing === "create"
          ? $_("documents.savedSearches.createTitle")
          : $_("documents.savedSearches.editTitle")}
      </h1>
      <SavedSearchForm
        savedSearch={editing === "create" ? undefined : editing}
        initialQuery={editing === "create" ? query : undefined}
        onclose={() => (editing = null)}
        onsave={handleSave}
        ondelete={handleDelete}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .saved-searches {
    margin-top: 0.25em;
    padding-top: 0.25em;
    border-top: 1px solid var(--gray-2);
  }
  p.help {
    font-size: var(--font-sm, 0.875em);
    color: var(--gray-4);
    padding: 0.25em 0.5em;
  }
</style>
