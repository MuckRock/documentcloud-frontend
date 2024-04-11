<script lang="ts">
  import { page } from "$app/stores";

  import Flex from "$lib/components/common/Flex.svelte";
  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  // using $page.form captures the correct type from applyAction
  $: form = $page.form;
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<DocumentUpload>
  <Flex direction="column">
    <h1>Upload documents</h1>

    {#if form?.success}
      <p>
        {form?.message}
      </p>
    {:else if form?.error}
      <p class="error">
        {form?.error}
      </p>
    {:else}
      <p>
        Select or drag a document to begin the document upload process. You will
        then be able to edit document information.
      </p>
    {/if}
  </Flex>
</DocumentUpload>
