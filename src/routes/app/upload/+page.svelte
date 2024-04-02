<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";
  import type { User } from "@/api/types/orgAndUser";

  import { getContext } from "svelte";

  import DocumentUpload from "$lib/components/forms/DocumentUpload.svelte";
  import { create, upload, process } from "$lib/api/documents";

  const me: Writable<User> = getContext("me");

  let files: FileList;
  let documents: Document[] = [];

  $: documents = Array.from(files || []).map((file) => {
    return {
      title: file.name,
      description: "",
      access: "private",
    } as Document;
  });
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<DocumentUpload />
