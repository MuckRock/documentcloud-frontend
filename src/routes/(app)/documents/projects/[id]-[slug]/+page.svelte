<script lang="ts">
  import { _ } from "svelte-i18n";

  import Project from "@/lib/components/layouts/Project.svelte";

  export let data;

  $: project = data.project;
  $: documents = data.documents;
  $: query = data.query;
  $: users = data.users ?? [];
</script>

<svelte:head>
  <title>{project.title} | DocumentCloud</title>
</svelte:head>

<Project {project} {users} {documents} {query} />
