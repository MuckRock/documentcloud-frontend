<script lang="ts">
  import type { Maybe, Project } from "$lib/api/types";

  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { PlusCircle16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";

  import {
    canUploadFiles,
    getCurrentUser,
    isSignedIn,
  } from "$lib/utils/permissions";
  import { uploadToProject } from "$lib/components/forms/Upload.svelte";

  interface Props {
    project?: Maybe<Project>;
  }

  let { project = undefined }: Props = $props();
  const me = getCurrentUser();

  function onUploadClick() {
    if (project) {
      $uploadToProject = project;
    }
    goto("/upload/");
  }
</script>

{#if isSignedIn($me) && canUploadFiles($me)}
  {#if project}
    <Button
      full
      mode="primary"
      on:click={onUploadClick}
      disabled={!project.edit_access}
    >
      <PlusCircle16 />
      {$_("sidebar.uploadToProject")}
    </Button>
  {:else}
    <Button mode="primary" href="/upload/">
      <PlusCircle16 />
      {$_("sidebar.upload")}
    </Button>
  {/if}
{/if}
