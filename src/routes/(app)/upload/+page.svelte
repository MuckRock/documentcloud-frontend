<script lang="ts">
  import { page } from "$app/stores";
  import { _ } from "svelte-i18n";

  import SidebarLayout from "@/lib/components/layouts/SidebarLayout.svelte";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";

  import Documents from "../documents/sidebar/Documents.svelte";
  import Projects from "../documents/sidebar/Projects.svelte";

  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  export let data;

  $: projects = data.projects?.results ?? [];
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <div slot="content" class="form-container">
    <DocumentUpload {projects} />
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
