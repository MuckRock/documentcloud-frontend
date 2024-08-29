<script lang="ts">
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
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import ProjectListItem from "$lib/components/projects/ProjectListItem.svelte";
  import Paginator from "@/common/Paginator.svelte";

  export let data;

  $: query = data.query;
  $: projects = data.projects.results;
  $: next = data.projects.next;
  $: previous = data.projects.previous;

  function paginate(u: URL | string) {
    u = new URL(u);
    const target = new URL($page.url);

    target.searchParams.set("cursor", u.searchParams.get("cursor"));
    goto(target);
  }
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Flex direction="column">
      <SidebarItem active={data.list === "owned"} href="?list=owned">
        <Person16 />
        {$_("projects.yours")}
      </SidebarItem>
      <SidebarItem active={data.list === "shared"} href="?list=shared">
        <People16 />
        {$_("projects.shared")}
      </SidebarItem>
      <SidebarItem active={data.list === "public"} href="?list=public">
        <Globe16 />
        {$_("projects.public")}
      </SidebarItem>
    </Flex>
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
    <Button mode="primary" href="#create">{$_("projects.create")}</Button>
  </svelte:fragment>
</MainLayout>
