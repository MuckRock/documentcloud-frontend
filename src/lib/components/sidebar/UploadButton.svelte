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
    compact?: boolean;
  }

  let { project = undefined, compact = false }: Props = $props();
  let me = $derived(getCurrentUser());

  function onUploadClick() {
    if (project) {
      $uploadToProject = project;
    }
    goto("/upload/");
  }
</script>

{#if isSignedIn(me) && canUploadFiles(me)}
  {#if project}
    <Button
      full={!compact}
      minW={!compact}
      ghost={compact}
      title={compact ? $_("sidebar.uploadToProject") : ""}
      mode="primary"
      onclick={onUploadClick}
      disabled={!project.edit_access}
    >
      <PlusCircle16 />
      <span class:sr-only={compact}>{$_("sidebar.uploadToProject")}</span>
    </Button>
  {:else}
    <Button
      mode="primary"
      href="/upload/"
      minW={!compact}
      ghost={compact}
      title={compact ? $_("sidebar.upload") : ""}
    >
      <PlusCircle16 />
      <span class:sr-only={compact}>{$_("sidebar.upload")}</span>
    </Button>
  {/if}
{/if}
