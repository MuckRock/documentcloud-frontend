<!-- @component
 Must be a child of a ViewerContext
-->

<script lang="ts">
  import { replaceState } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import EditSections from "$lib/components/forms/EditSections.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Zoom from "../viewer/Zoom.svelte";

  import { pageHashUrl, shouldPaginate } from "$lib/api/documents";
  import { scrollToPage } from "$lib/utils/scroll";
  import { sortedSections } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";

  const viewer = getViewerState();

  let sectionsOpen = $state(false);
  let width: number = $state(800);

  let document = $derived(viewer.document!);
  let sections = $derived(sortedSections(document));
  let totalPages = $derived(document.page_count);
  let showPDF = $derived(
    ["document", "annotating", "redacting"].includes(viewer.mode),
  );
  let canEditSections = $derived(!viewer.embed && document.edit_access);

  // pagination
  function next() {
    viewer.page = Math.min(viewer.page + 1, totalPages);
    scrollToPage(viewer.page);
    replaceState(pageHashUrl(viewer.page), {});
  }

  function previous() {
    viewer.page = Math.max(viewer.page - 1, 1);
    scrollToPage(viewer.page);
    replaceState(pageHashUrl(viewer.page), {});
  }

  function gotoPage(n: number) {
    viewer.page = n;
    scrollToPage(viewer.page);
    replaceState(pageHashUrl(viewer.page), {});
  }
</script>

<div class="toolbar" bind:clientWidth={width}>
  <div class="sections">
    {#if showPDF && (sections.length > 0 || canEditSections)}
      <Dropdown position="top-start" --offset="5px">
        {#snippet anchor()}
          <div class="toolbarItem">
            <NavItem>
              {#snippet start()}
                <ListOrdered16 />
              {/snippet}
              <span class="sections-label"> Sections </span>
              {#snippet end()}
                <ChevronUp12 />
              {/snippet}
            </NavItem>
          </div>
        {/snippet}
        {#snippet inner({ close })}
          <Menu>
            {#each sections as section}
              <MenuItem
                href={pageHashUrl(section.page_number + 1)}
                onclick={close}
              >
                {section.title}
              </MenuItem>
            {:else}
              <Empty icon={ListOrdered24}>
                <p>{$_("sidebar.toc.empty")}</p>
              </Empty>
            {/each}
            {#if canEditSections}
              {#if sections.length === 0}
                <Button
                  ghost
                  mode="primary"
                  onclick={() => (sectionsOpen = true)}
                >
                  {$_("sidebar.toc.cta")}
                </Button>
              {:else}
                <Button
                  ghost
                  mode="primary"
                  onclick={() => (sectionsOpen = true)}
                >
                  {$_("sections.edit")}
                </Button>
              {/if}
            {/if}
          </Menu>
        {/snippet}
      </Dropdown>
    {/if}
  </div>

  {#if shouldPaginate(viewer.mode)}
    <div class="paginator">
      <Paginator
        goToNav
        ongoto={(n) => gotoPage(n)}
        onnext={next}
        onprevious={previous}
        bind:page={viewer.page}
        {totalPages}
        has_next={viewer.page < totalPages}
        has_previous={viewer.page > 1}
      />
    </div>
  {/if}

  <div class="zoom">
    <Zoom />
  </div>
</div>

{#if canEditSections && sectionsOpen}
  <Portal>
    <Modal onclose={() => (sectionsOpen = false)}>
      {#snippet title()}
        <h1>{$_("sections.edit")}</h1>
      {/snippet}
      <EditSections {document} onclose={() => (sectionsOpen = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: var(--white);
  }

  .paginator {
    flex: 1 1 auto;
  }
  .sections,
  .zoom {
    flex: 1 1 12em;
  }

  @media (max-width: 40rem) {
    .sections-label {
      position: absolute;
      clip: rect(1px, 1px, 1px, 1px);
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
    }
  }
</style>
