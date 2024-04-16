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
    <Flex direction="column">
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
    </Flex>
  </DocumentUpload>
</div>

<style>
  .card {
    margin: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: var(--shadow);
  }
  .title {
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
  }
  .description {
    margin: 1rem 0;
    opacity: 0.7;
  }
</style>
