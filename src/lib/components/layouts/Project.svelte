<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { Project, ProjectUser, DocumentResults } from "$lib/api/types";
  import Collaborators from "../projects/Collaborators.svelte";
  import ProjectActions from "../projects/ProjectActions.svelte";
  import ProjectHeader from "../projects/ProjectHeader.svelte";
  import DocumentBrowser from "./DocumentBrowser.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import Flex from "../common/Flex.svelte";

  export let project: Project;
  export let users: ProjectUser[];
  export let documents: Promise<DocumentResults>;
  export let query: string = "";
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

  <ProjectActions slot="action" {project} {users} />
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
    max-height: 100%;
    overflow-y: auto;
    border-radius: 0.25rem;
    border: 1px solid var(--gray-2);
    box-shadow: inset var(--shadow-2);
  }
</style>
