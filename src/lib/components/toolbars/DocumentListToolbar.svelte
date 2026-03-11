<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "./PageToolbar.svelte";
  import NavItem from "../common/NavItem.svelte";
  import SearchEditor from "../documents/search/SearchEditor.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";
  import type { Nullable, Project } from "$lib/api/types";
  import type { Suggestion } from "../documents/search/prosemirror/plugins/autocomplete-data";
  import { remToPx } from "$lib/utils/layout";

  interface Props {
    query?: string;
    project?: Nullable<Project>;
    preloadedSuggestions?: Record<string, Suggestion[]>;
  }

  let {
    query = "",
    project = null,
    preloadedSuggestions = {}
  }: Props = $props();

  let headerToolbarWidth: number = $state(800);

  let contextChips = $derived(project
    ? [{ field: "project", label: project.title }]
    : []
  )

  function handleSearchChange(
    e: CustomEvent<{ q: string; structural: boolean }>,
  ) {
    // Only reload for structural changes (chip insert/remove).
    // Plain text typing waits for explicit Enter/submit.
    if (e.detail.structural) {
      const url = new URL($page.url);
      url.searchParams.set("q", e.detail.q);
      goto(url, { replaceState: true, noScroll: true, keepFocus: true });
    }
  }

  function handleSearchSubmit(e: CustomEvent<{ q: string }>) {
    const url = new URL($page.url);
    url.searchParams.set("q", e.detail.q);
    goto(url, { noScroll: true, keepFocus: true });
  }
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  {#snippet left()}
    <div class="items">
      <SearchEditor
        initialQuery={query}
        {contextChips}
        {preloadedSuggestions}
        on:change={handleSearchChange}
        on:submit={handleSearchSubmit}
      />
      <div class="margin-xs" class:hide={headerToolbarWidth < remToPx(38)}>
        <Dropdown>
          <NavItem slot="anchor">
            <Eye16 slot="start" />
            {$_("documentBrowser.fieldsAnchor")}
            <ChevronDown12 slot="end" />
          </NavItem>
          <Menu slot="inner">
            <VisibleFields />
          </Menu>
        </Dropdown>
      </div>
    </div>
  {/snippet}
</PageToolbar>

<style>
  .items {
    display: flex;
    gap: 0.25rem;
    align-items: start;
  }
  .margin-xs {
    margin: 0.25rem;
  }
</style>
