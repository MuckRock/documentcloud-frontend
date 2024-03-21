<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";
  import type { User } from "@/api/types/orgAndUser";

  import { getContext } from "svelte";

  import { DOCUMENT_TYPES } from "@/config/config.js";

  const me: Writable<User> = getContext("me");

  let files: FileList;
  let documents: Document[] = [];

  $: documents = Array.from(files || []).map((file) => {
    return {
      id: null,
      title: file.name,
      description: "",
      access: "private",
      asset_url: "",
      canonical_url: "",
      created_at: new Date(),
      edit_access: true,
      data: {},
      user: $me,
    } as Document;
  });
</script>

<svelte:head>
  <title>Upload | DocumentCloud</title>
</svelte:head>

<div class="upload">
  <h1>Upload</h1>

  <form method="post">
    <fieldset>
      <label>
        Files
        <input
          bind:files
          type="file"
          name="files"
          multiple
          accept={DOCUMENT_TYPES.join(",")}
        />
      </label>
    </fieldset>

    <fieldset class="documents">
      {#each documents || [] as doc, i}
        {@const file = files[i]}
        <h3>{file.name}</h3>
        <label>
          <span>Title</span>
          <input name="title" type="text" bind:value={documents[i].title} />
        </label>

        <label>
          <span>Description</span>
          <textarea name="description" bind:value={documents[i].description}
          ></textarea>
        </label>
      {/each}
    </fieldset>

    <fieldset>
      <input
        disabled={!files || files.length === 0}
        type="submit"
        value="Upload"
      />
    </fieldset>
  </form>
</div>

<style>
  .upload {
    padding: 1em;
  }

  label {
    display: flex;
    gap: 1.5em;
  }
</style>
