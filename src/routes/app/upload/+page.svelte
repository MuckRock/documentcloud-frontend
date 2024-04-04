<script lang="ts">
  import { onMount } from "svelte";

  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  // export let data: PageData;
  // export let form: ActionData;

  let uploader: DocumentUpload;

  onMount(() => {
    // @ts-ignore
    window.uploader = uploader;
  });
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<DocumentUpload bind:this={uploader} />
