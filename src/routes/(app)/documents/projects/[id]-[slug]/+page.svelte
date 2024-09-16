<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Globe16, Lock16 } from "svelte-octicons";

  import Collaborators from "$lib/components/projects/Collaborators.svelte";
  import ProjectActions from "$lib/components/projects/ProjectActions.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import ProjectPin from "$lib/components/projects/ProjectPin.svelte";
  import SidebarLayout from "@/lib/components/layouts/SidebarLayout.svelte";
  import DocumentBrowser from "@/lib/components/layouts/DocumentBrowser.svelte";

  export let data;

  $: project = data.project;
  $: documentSearch = data.documents;
  $: query = data.query;
  $: users = data.users;
</script>

<svelte:head>
  <title>{project.title} | DocumentCloud</title>
</svelte:head>

<SidebarLayout>
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

  <DocumentBrowser
    slot="content"
    documents={documentSearch}
    {project}
    {query}
    uiText={{
      empty: $_("projects.empty"),
      loading: $_("projects.loading"),
      error: $_("projects.error"),
      search: $_("projects.placeholder.documents"),
    }}
  />

  <ProjectActions slot="action" {project} {users} />
</SidebarLayout>

<style>
  h1 {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
