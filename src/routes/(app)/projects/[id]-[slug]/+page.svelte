<script lang="ts">
  import { onDestroy } from "svelte";
  import { _ } from "svelte-i18n";

  import Project from "$lib/components/layouts/Project.svelte";

  import * as projects from "$lib/api/projects";
  import { embedUrl } from "$lib/api/embed";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";
  import { deleted, edited } from "$lib/api/documents";
  import {
    getPendingDocuments,
    getFinishedDocuments,
  } from "$lib/components/processing/ProcessContext.svelte";

  let { data } = $props();

  let project = $derived(data.project);
  let query = $derived(data.query);
  let users = $derived(data.users ?? []);

  let canonical_url = $derived(projects.canonicalUrl(project));
  let embed_url = $derived(embedUrl(canonical_url));

  const search = new SearchResultsState({ loading: true });
  setSearchResults(search);

  search.watch({
    deleted,
    edited,
    pending: getPendingDocuments(),
    finished: getFinishedDocuments(),
  });
  onDestroy(search.unwatch);

  $effect(() => {
    search.setResults(data.documents);
  });
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

<Project {project} {users} {query} />
