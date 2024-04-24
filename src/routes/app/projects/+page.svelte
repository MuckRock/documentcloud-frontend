<script lang="ts">
  import { FileDirectory24, People16, Person16 } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import Button from "@/lib/components/common/Button.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";

  import PageToolbar from "@/lib/components/common/PageToolbar.svelte";
  import MainLayout from "@/lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "@/lib/components/layouts/ContentLayout.svelte";
  import Search from "@/lib/components/inputs/Search.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import ProjectListItem from "@/lib/components/projects/ProjectListItem.svelte";

  export let data;

  function search(event: SubmitEvent) {
    event.preventDefault();
    const url = new URL($page.url); // make a copy
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const query = formData.get("query") ?? "";
    url.searchParams.set("query", query as string);
    goto(url);
  }

  $: query = ($page.url as URL).searchParams.get("query") ?? "";
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
    </Flex>
  </svelte:fragment>

  <ContentLayout slot="content">
    <PageToolbar slot="header">
      <Search name="query" {query} on:submit={search} slot="center" />
    </PageToolbar>

    {#each data.projects as project}
      <ProjectListItem {project} />
    {:else}
      <Empty icon={FileDirectory24}>{$_("projects.none")}</Empty>
    {/each}

    <PageToolbar slot="footer"></PageToolbar>
  </ContentLayout>

  <svelte:fragment slot="action">
    <Button mode="primary" href="#create">{$_("projects.create")}</Button>
  </svelte:fragment>
</MainLayout>
