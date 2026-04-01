<script lang="ts">
  import type { Nullable, Project } from "$lib/api/types";

  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "./PageToolbar.svelte";
  import NavItem from "../common/NavItem.svelte";
  import SearchEditor from "../documents/search/SearchEditor.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";
  import { remToPx } from "$lib/utils/layout";

  interface Props {
    query?: string;
    project?: Nullable<Project>;
  }

  let { query = "", project = null }: Props = $props();

  let headerToolbarWidth: number = $state(800);

  let contextAtoms = $derived(
    project ? [{ field: "project", label: project.title }] : [],
  );

  function handleSearchChange(detail: { q: string; structural: boolean }) {
    // Only reload for structural changes (atom insert/remove).
    // Plain text typing waits for explicit Enter/submit.
    if (detail.structural) {
      handleSearchSubmit(detail);
    }
  }

  function handleSearchSubmit(detail: { q: string }) {
    const url = new URL(page.url);
    url.searchParams.set("q", detail.q);
    goto(url, { noScroll: true, keepFocus: true });
  }
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  {#snippet left()}
    <div class="items">
      <SearchEditor
        {query}
        {contextAtoms}
        onchange={handleSearchChange}
        onsubmit={handleSearchSubmit}
      />
      <div class="margin-xs" class:hide={headerToolbarWidth < remToPx(38)}>
        <Dropdown>
          {#snippet anchor()}
            <NavItem>
              <Eye16 slot="start" />
              {$_("documentBrowser.fieldsAnchor")}
              <ChevronDown12 slot="end" />
            </NavItem>
          {/snippet}
          {#snippet inner()}
            <Menu>
              <VisibleFields />
            </Menu>
          {/snippet}
        </Dropdown>
      </div>
    </div>
  {/snippet}
</PageToolbar>

<style>
  .items {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  .margin-xs {
    margin: 0.25rem;
  }
</style>
