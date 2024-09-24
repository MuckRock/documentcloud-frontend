<script context="module" lang="ts">
  type Action = "edit" | "share" | "users" | "delete";
</script>

<script lang="ts">
  import type { Nullable, Project, ProjectUser } from "$lib/api/types";

  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    Alert16,
    People16,
    Pencil16,
    Search16,
    Share16,
    Share24,
    Trash16,
    PlusCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import EditProject from "../forms/EditProject.svelte";
  import ManageCollaborators from "../forms/ManageCollaborators.svelte";
  import DeleteProject from "../forms/DeleteProject.svelte";

  import { projectSearchUrl } from "$lib/utils/search";
  import { uploadToProject } from "../forms/DocumentUpload.svelte";
  import {
    canUploadFiles,
    getCurrentUser,
    isSignedIn,
  } from "$lib/utils/permissions";

  export let project: Project;
  export let users: ProjectUser[];

  const me = getCurrentUser();

  let show: Nullable<Action> = null;

  const actions: Record<Action, string> = {
    edit: $_("projects.edit"),
    share: $_("projects.share"),
    users: $_("projects.users"),
    delete: $_("projects.delete.confirm"),
  };

  function hide() {
    show = null;
  }

  function onUploadClick() {
    $uploadToProject = project;
    goto("/upload/");
  }
</script>

<div class="actions wideGap">
  {#if isSignedIn($me) && canUploadFiles($me) && project.edit_access}
    <Button full mode="primary" on:click={onUploadClick}>
      <PlusCircle16 />{$_("sidebar.uploadToProject")}
    </Button>
  {/if}

  {#if project.edit_access || project.add_remove_access}
    <!-- Admin & Editor Actions -->
    <div class="actions">
      {#if project.edit_access}
        <Button ghost mode="primary" on:click={() => (show = "edit")}>
          <Pencil16 />
          {$_("sidebar.edit")}
        </Button>
      {/if}

      {#if project.add_remove_access}
        <Button ghost on:click={() => (show = "users")}>
          <People16 />{$_("sidebar.collaborate")}
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

    <Button ghost href={projectSearchUrl(project)}>
      <Search16 />{$_("projects.viewInSearch")}
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
        <Empty icon={Share24}
          >Project sharing coming soon. Use our Feedback form to let us know how
          you use project sharing.</Empty
        >
      {/if}

      {#if show === "users"}
        <ManageCollaborators {project} {users} on:close={hide} />
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
