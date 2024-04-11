<script lang="ts">
  import Flex from "$lib/components/common/Flex.svelte";
  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  export let form;
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<DocumentUpload>
  <Flex direction="column">
    <h1>Upload documents</h1>

    {#if form?.success}
      <p>
        {form.message}
      </p>
    {:else}
      <p>
        Select or drag a document to begin the document upload process. You will
        then be able to edit document information.
      </p>
    {/if}
  </Flex>
</DocumentUpload>
