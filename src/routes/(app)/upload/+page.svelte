<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";
  import Upload from "$lib/components/forms/Upload.svelte";

  let { data } = $props();

  let projects = $derived(data.projects?.results ?? []);
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<!-- todo: convert these to snippets once SidebarLayout has been migrated -->
<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>

  <div class="form-container" slot="content">
    <Upload {projects} />
  </div>
</SidebarLayout>

<style>
  .form-container {
    margin: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: var(--shadow-1);
    background: var(--white);
    overflow-y: auto;
    height: fit-content;
  }
</style>
