<script lang="ts">
  import type { Nullable } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    FileDirectory24,
    People16,
    Person16,
    Globe16,
  } from "svelte-octicons";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import Button from "$lib/components/common/Button.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import ProjectListItem from "$lib/components/projects/ProjectListItem.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import SidebarLayout from "@/lib/components/layouts/SidebarLayout.svelte";

  import EditProject from "@/lib/components/forms/EditProject.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";

  import { getCurrentUser } from "$lib/utils/permissions";
  import Documents from "@/lib/components/sidebar/Documents.svelte";
  import Projects from "@/lib/components/sidebar/Projects.svelte";
  import AddOns from "@/lib/components/sidebar/AddOns.svelte";

  const me = getCurrentUser();

  export let data;

  let create = false;

  $: query = data.query;
  $: projects = data.projects.results;
  $: next = data.projects.next;
  $: previous = data.projects.previous;

  function paginate(u: Nullable<URL | string>) {
    if (!u) return;
    u = new URL(u);
    const target = new URL($page.url);

    const cursor = u.searchParams.get("cursor");
    if (cursor) target.searchParams.set("cursor", cursor);
    goto(target);
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
    <PageToolbar slot="header">
      <Search
        slot="center"
        name="query"
        placeholder={$_("projects.placeholder.projects")}
        {query}
      />
    </PageToolbar>

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
        on:next={(e) => paginate(next)}
        on:previous={(e) => paginate(previous)}
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
