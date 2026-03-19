<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Project from "../Project.svelte";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";

  import { project, projectUsers } from "@/test/fixtures/projects";
  import { documentsList } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Layout / Project",
    component: Project,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  const search = new SearchResultsState();
  search.setResults(Promise.resolve({ data: documentsList }));

  setSearchResults(search);
</script>

<Story
  name="Viewer"
  args={{
    project: project,
    users: projectUsers.results,
  }}
/>

<Story
  name="Editor"
  args={{
    project: { ...project, edit_access: true },
    users: projectUsers.results,
  }}
/>

<Story
  name="Admin"
  args={{
    project: { ...project, edit_access: true, add_remove_access: true },
    users: projectUsers.results,
  }}
/>
