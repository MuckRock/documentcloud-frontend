<script lang="ts">
  import { setContext } from "svelte";

  import DocumentBrowser from "$lib/components/layouts/DocumentBrowser.svelte";
  import ProjectHeader from "$lib/components/projects/ProjectHeader.svelte";
  import EmbedLayout from "$lib/components/layouts/EmbedLayout.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  setContext("embed", true);

  let { data } = $props();

  let documents = $derived(data.documents);
  let project = $derived(data.project);
</script>

<svelte:head>
  <title>{project.title}</title>
</svelte:head>

<EmbedLayout canonicalUrl={canonicalUrl(project).href}>
  <article>
    <header>
      <ProjectHeader {project} show={{ pin: false, access: false }} />
    </header>
    <main>
      <DocumentBrowser {documents} />
    </main>
  </article>
</EmbedLayout>

<style>
  article {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
  }
  header {
    flex: 0 0 0;
    padding: 0.5rem;
    background: var(--white);
    font-size: var(--font-sm);
    border-bottom: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
    z-index: 1;
  }
  main {
    flex: 1 1 auto;
    overflow-y: auto;
  }
</style>
