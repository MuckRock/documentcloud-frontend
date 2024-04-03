<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";
  import type { User } from "@/api/types/orgAndUser";

  import { getContext, onMount } from "svelte";

  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";

  const me: Writable<User> = getContext("me");

  // export let data: PageData;
  // export let form: ActionData;

  let uploader: DocumentUpload;

  let files: FileList;
  let documents: Document[] = [];

  $: documents = Array.from(files || []).map((file) => {
    return {
      title: file.name,
      description: "",
      access: "private",
    } as Document;
  });

  onMount(() => {
    // @ts-ignore
    window.uploader = uploader;
  });
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<DocumentUpload bind:this={uploader} />
