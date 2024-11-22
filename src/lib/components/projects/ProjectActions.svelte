<script context="module" lang="ts">
  type Action = "edit" | "share" | "delete";
</script>

<script lang="ts">
  import type { Nullable, Project, ProjectUser } from "$lib/api/types";

  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    Pencil16,
    Search16,
    Share16,
    Trash16,
    PlusCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import EditProject from "../forms/EditProject.svelte";
  import DeleteProject from "../forms/DeleteProject.svelte";

  import { projectSearchUrl } from "$lib/utils/search";
  import { uploadToProject } from "../forms/DocumentUpload.svelte";
  import {
    canUploadFiles,
    getCurrentUser,
    isSignedIn,
  } from "$lib/utils/permissions";
  import ProjectShare from "./ProjectShare.svelte";

  export let project: Project;

  const me = getCurrentUser();

  let show: Nullable<Action> = null;

  const actions: Record<Action, string> = {
    edit: $_("projects.edit"),
    share: $_("projects.share"),
    delete: $_("projects.delete.confirm"),
  };

  function hide() {
    show = null;
  }
</script>

<div class="actions wideGap">
  {#if project.edit_access || project.add_remove_access}
    <!-- Admin & Editor Actions -->
    <div class="actions">
      {#if project.edit_access}
        <Button ghost mode="primary" on:click={() => (show = "edit")}>
          <Pencil16 />
          {$_("sidebar.edit")}
        </Button>
      {/if}

      {#if project.edit_access}
        <Button ghost mode="danger" on:click={() => (show = "delete")}>
          <Trash16 />
          {$_("projects.delete.action")}
        </Button>
      {/if}
    </div>
  {/if}

  <!-- Viewer Actions -->
  <div class="actions">
    <Button ghost on:click={() => (show = "share")}>
      <Share16 />{$_("sidebar.shareEmbed")}
    </Button>
  </div>
</div>

{#if show}
  <Portal>
    <Modal on:close={hide}>
      <h1 slot="title">
        {actions[show]}
      </h1>
      {#if show === "edit"}
        <EditProject {project} on:close={hide} />
      {/if}

      {#if show === "share"}
        <ProjectShare {project} on:close={hide} />
      {/if}

      {#if show === "delete"}
        <DeleteProject {project} on:close={hide} />
      {/if}
    </Modal>
  </Portal>
{/if}

<style>
  .actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .wideGap {
    gap: 1rem;
  }
</style>
