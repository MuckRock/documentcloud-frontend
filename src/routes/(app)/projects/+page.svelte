<script lang="ts">
  import type { Nullable } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { FileDirectory24, SidebarExpand16 } from "svelte-octicons";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import Button from "$lib/components/common/Button.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/toolbars/PageToolbar.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import EditProject from "$lib/components/forms/EditProject.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";
  import ProjectListItem from "$lib/components/projects/ProjectListItem.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import { sidebars } from "$lib/components/layouts/Sidebar.svelte";

  import { getCurrentUser } from "$lib/utils/permissions";

  const me = getCurrentUser();

  export let data;

  let create = false;

  $: query = data.query;
  $: projects = data.projects.results;
  $: next = data.projects.next; // this will be an API url with a cursor
  $: previous = data.projects.previous; // this will be an API url with a cursor

  function paginate(u: Nullable<URL | string>) {
    if (!u) return;
    const pageUrl = new URL(u);
    const gotoUrl = new URL($page.url);
    // get the cursor out of the pageUrl, pass it to the gotoUrl
    const cursor = pageUrl.searchParams.get("cursor");
    if (cursor) gotoUrl.searchParams.set("cursor", cursor);
    goto(gotoUrl);
  }
</script>

<svelte:head>
  <title>{$_("projects.header")} | DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>

  <ContentLayout slot="content">
    <svelte:fragment slot="header">
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
        <PageToolbar>
          <Search
            slot="center"
            name="query"
            placeholder={$_("projects.placeholder.projects")}
            {query}
          />
        </PageToolbar>
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
    </svelte:fragment>

    {#each projects as project}
      <ProjectListItem {project} />
    {:else}
      <Empty icon={FileDirectory24}>{$_("projects.none")}</Empty>
    {/each}

    <PageToolbar slot="footer">
      <Paginator
        slot="center"
        has_next={Boolean(next)}
        has_previous={Boolean(previous)}
        on:next={() => paginate(next)}
        on:previous={() => paginate(previous)}
      />
    </PageToolbar>
  </ContentLayout>

  <svelte:fragment slot="action">
    {#if $me}
      <Button mode="primary" on:click={() => (create = true)}>
        {$_("projects.create")}
      </Button>
    {/if}
  </svelte:fragment>
</SidebarLayout>

{#if create}
  <Portal>
    <Modal on:close={() => (create = false)}>
      <h1 slot="title">{$_("projects.create")}</h1>
      <EditProject on:close={() => (create = false)} />
    </Modal>
  </Portal>
{/if}

<style>
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
</style>
