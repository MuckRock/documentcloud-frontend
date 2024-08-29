<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    FileDirectory24,
    Hourglass24,
    Pencil16,
    People16,
    Search16,
    Share16,
  } from "svelte-octicons";

  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";

  import Action from "@/lib/components/common/Action.svelte";
  import Collaborators from "@/lib/components/projects/Collaborators.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import { projectSearchUrl } from "$lib/utils/search";

  export let data;

  $: project = data.project;
  $: documentSearch = data.documents;
  $: query = data.query;
  $: me = data.me;
  $: users = data.users.filter((u) => u.user.id !== me.id);

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Flex direction="column">
      <h1>{project.title}</h1>
      <p>{project.description}</p>
    </Flex>

    <Collaborators {users} {project} />
  </svelte:fragment>

  <ContentLayout slot="content">
    <PageToolbar slot="header">
      <Search name="q" {query} slot="center" />
    </PageToolbar>
    {#await documentSearch}
      <Empty icon={Hourglass24}>{$_("projects.loading")}</Empty>
    {:then documentSearchResults}
      {#if !query && !documentSearchResults.results.length}
        <Empty icon={FileDirectory24}>{$_("projects.empty")}</Empty>
      {:else}
        <ResultsList
          results={documentSearchResults.results}
          next={documentSearchResults.next}
          count={documentSearchResults.count}
          auto
        />
      {/if}
    {:catch}
      <Error>{$_("projects.error")}</Error>
    {/await}
    <PageToolbar slot="footer">
      <label slot="left" class="select-all">
        <input
          type="checkbox"
          name="select_all"
          checked={$selected.length > 0 && $selected.length === $visible.size}
          indeterminate={$selected.length > 0 &&
            $selected.length < $visible.size}
          on:change={selectAll}
        />
        {#if $selected.length > 0}
          {$selected.length.toLocaleString()} {$_("inputs.selected")}
        {:else}
          {$_("inputs.selectAll")}
        {/if}
      </label>

      <svelte:fragment slot="right">
        {#if $visible && $total}
          {$_("inputs.resultsCount", {
            values: { n: $visible.size, total: $total },
          })}
        {/if}
      </svelte:fragment>
    </PageToolbar>
  </ContentLayout>

  <svelte:fragment slot="action">
    <Flex direction="column">
      <SidebarItem href="#edit"><Pencil16 />{$_("sidebar.edit")}</SidebarItem>
      <SidebarItem href="#collaborate"
        ><People16 />{$_("sidebar.collaborate")}</SidebarItem
      >
      <SidebarItem href="#share"
        ><Share16 />{$_("sidebar.shareEmbed")}</SidebarItem
      >
    </Flex>
    <hr class="divider" />
    <SidebarItem href={projectSearchUrl(project)}>
      <Search16 />{$_("projects.viewInSearch")}
    </SidebarItem>
  </svelte:fragment>
</MainLayout>
