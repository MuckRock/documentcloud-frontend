<script lang="ts">
  import { page } from "$app/stores";

  import Flex from "$lib/components/common/Flex.svelte";
  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  // using $page.form captures the correct type from applyAction
  $: form = $page.form;
  $: csrf_token = $page.data.csrf_token;
  $: projects = $page.data.projects.result;
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<div class="card">
  <DocumentUpload {csrf_token} {projects}>
    <header>
      <h1 class="title">Upload documents</h1>

      {#if form?.success}
        <p class="description">
          {form?.message}
        </p>
      {:else if form?.error}
        <p class="description error">
          {form?.error}
        </p>
      {:else}
        <p class="description">
          Select or drag a document to begin the document upload process. You
          will then be able to edit document information.
        </p>
      {/if}
    </header>
  </DocumentUpload>
</div>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .card {
    margin: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: var(--shadow);
    background: var(--white);
  }
  .title {
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
  }
  .description {
    opacity: 0.7;
  }
</style>
