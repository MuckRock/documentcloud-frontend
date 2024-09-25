<script lang="ts">
  import { _ } from "svelte-i18n";

  import type {
    Page,
    Project,
    ProjectUser,
    DocumentResults,
    AddOnListItem,
    APIResponse,
  } from "$lib/api/types";
  import AddOns from "$lib/components/common/AddOns.svelte";
  import Collaborators from "$lib/components/projects/Collaborators.svelte";
  import ProjectActions from "$lib/components/projects/ProjectActions.svelte";
  import ProjectHeader from "$lib/components/projects/ProjectHeader.svelte";
  import DocumentBrowser from "./DocumentBrowser.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";

  export let project: Project;
  export let users: ProjectUser[];
  export let documents: Promise<APIResponse<DocumentResults>>;
  export let query: string = "";
  export let addons: Promise<APIResponse<Page<AddOnListItem>>>;

  $: projectQuery = `+project:${project.id}`;
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Collaborators {users} {project} />
  </svelte:fragment>

  <article slot="content">
    <header><ProjectHeader {project} /></header>
    <main>
      <DocumentBrowser
        {documents}
        {project}
        {query}
        uiText={{
          empty: $_("projects.empty"),
          loading: $_("projects.loading"),
          error: $_("projects.error"),
          search: $_("projects.placeholder.documents"),
        }}
      />
    </main>
  </article>

  <svelte:fragment slot="action">
    <ProjectActions {project} {users} />
    <AddOns pinnedAddOns={addons} query={projectQuery} />
  </svelte:fragment>
</SidebarLayout>

<style>
  article {
    flex: 1 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }
  header {
    padding: 1rem;
  }
  main {
    flex: 1 0 0;
    max-height: 100%;
    overflow-y: auto;
    border-radius: 0.25rem;
    border: 1px solid var(--gray-2);
    box-shadow: inset var(--shadow-2);
  }
</style>
