<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { selected } from "$lib/components/documents/ResultsList.svelte";
  import Project from "$lib/components/layouts/Project.svelte";

  import * as projects from "$lib/api/projects";
  import { embedUrl } from "$lib/api/embed";

  export let data;

  $: project = data.project;
  $: documents = data.documents;
  $: query = data.query;
  $: users = data.users ?? [];

  $: canonical_url = projects.canonicalUrl(project);
  $: embed_url = embedUrl(canonical_url);

  setContext("selected", selected);
</script>

<svelte:head>
  <title>{project.title} | DocumentCloud</title>

  <meta property="og:url" content={canonical_url} />
  <meta property="og:title" content={project.title} />

  <link
    rel="alternate"
    type="application/json+oembed"
    href={embed_url.href}
    title={project.title}
  />
  {#if project.description?.trim().length > 0}
    <meta name="description" content={project.description} />
    <meta property="og:description" content={project.description} />
  {/if}
</svelte:head>

<Project {project} {users} {documents} {query} />
