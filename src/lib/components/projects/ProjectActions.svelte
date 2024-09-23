<script context="module" lang="ts">
  type Action = "edit" | "share" | "users" | "delete";
</script>

<script lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";

  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    Alert16,
    People16,
    Pencil16,
    Search16,
    Share16,
    Share24,
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

  let show: Action = null;

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

<Flex direction="column">
  {#if isSignedIn($me) && canUploadFiles($me)}
    <Button mode="primary" on:click={onUploadClick}>
      <PlusCircle16 />{$_("sidebar.uploadToProject")}
    </Button>
  {/if}

  {#if project.edit_access}
    <SidebarItem hover on:click={() => (show = "edit")}>
      <Pencil16 slot="start" />{$_("sidebar.edit")}
    </SidebarItem>
  {/if}

  {#if project.add_remove_access}
    <SidebarItem hover on:click={() => (show = "users")}>
      <People16 slot="start" />{$_("sidebar.collaborate")}
    </SidebarItem>
  {/if}

  <SidebarItem hover on:click={() => (show = "share")}>
    <Share16 slot="start" />{$_("sidebar.shareEmbed")}
  </SidebarItem>

  {#if project.edit_access}
    <SidebarItem
      hover
      --color="var(--caution)"
      --fill="var(--caution)"
      on:click={() => (show = "delete")}
    >
      <Alert16 slot="start" />
      {$_("projects.delete.action")}
    </SidebarItem>
  {/if}
</Flex>

<hr class="divider" />

<SidebarItem href={projectSearchUrl(project)}>
  <Search16 slot="start" />{$_("projects.viewInSearch")}
</SidebarItem>

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
