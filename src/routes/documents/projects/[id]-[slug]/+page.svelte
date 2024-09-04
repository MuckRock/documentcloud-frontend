<script lang="ts">
  import type { ProjectUser, User } from "$lib/api/types";

  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    FileDirectory24,
    Hourglass24,
    Globe16,
    Lock16,
  } from "svelte-octicons";

  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";

  import BulkActions from "$lib/components/forms/BulkActions.svelte";
  import Collaborators from "$lib/components/projects/Collaborators.svelte";
  import ProjectActions from "$lib/components/projects/ProjectActions.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import ProjectPin from "$lib/components/projects/ProjectPin.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "$lib/components/forms/Search.svelte";

  export let data;

  setContext("selected", selected);

  $: project = data.project;
  $: documentSearch = data.documents;
  $: query = data.query;
  $: users = data.users;

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
      <h1>
        {project.title}
        {#if project.private}
          <Lock16 />
        {:else}
          <Globe16 />
        {/if}
        <ProjectPin {project} />
      </h1>
      <p>{project.description}</p>
    </Flex>

    <Collaborators {users} {project} />
  </svelte:fragment>

  <ContentLayout slot="content">
    <PageToolbar slot="header">
      <BulkActions slot="left" />

      <Search
        slot="right"
        name="q"
        {query}
        placeholder={$_("projects.placeholder.documents")}
      />
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

  <ProjectActions slot="action" {project} {users} />
</MainLayout>

<style>
  h1 {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
