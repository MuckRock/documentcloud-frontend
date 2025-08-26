<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";

  import type {
    APIResponse,
    DocumentResults,
    Project,
    ProjectUser,
  } from "$lib/api/types";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import ProjectActions from "$lib/components/sidebar/ProjectActions.svelte";
  import ProjectHeader from "$lib/components/projects/ProjectHeader.svelte";
  import DocumentBrowser from "./DocumentBrowser.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import Collaborators from "$lib/components/projects/Collaborators.svelte";
  import Documents from "../sidebar/Documents.svelte";
  import Projects from "../sidebar/Projects.svelte";
  import DocumentActions from "../sidebar/DocumentActions.svelte";
  import UploadButton from "../sidebar/UploadButton.svelte";

  import {
    editable,
    selected,
  } from "$lib/components/documents/ResultsList.svelte";

  setContext("editable", editable);
  setContext("selected", selected);

  export let project: Project;
  export let users: ProjectUser[];
  export let documents: Promise<APIResponse<DocumentResults>>;
  export let query: string = "";

  $: combinedQuery = `+project:${project.slug}-${project.id} ${query}`.trim();
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns query={combinedQuery} />
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
    <UploadButton {project} />
    <h4>Document Actions</h4>
    <DocumentActions />
    <h4>Project Actions</h4>
    <ProjectActions {project} />
    <Collaborators {users} {project} />
  </svelte:fragment>
</SidebarLayout>

<style>
  article {
    flex: 1 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  header {
    padding: 1rem;
  }
  main {
    flex: 1 0 0;
    box-shadow: inset var(--shadow-2);
  }
  h4 {
    margin: 0;
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--gray-4);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.5rem;
  }
</style>
