<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";
  import Upload from "$lib/components/forms/Upload.svelte";

  export let data;

  $: projects = data.projects?.results ?? [];
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>

  <div slot="content" class="form-container">
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
