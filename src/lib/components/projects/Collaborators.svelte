<script lang="ts">
  import { getUserName } from "$lib/api/accounts";
  import type { Project, ProjectAccess, ProjectUser } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, People16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import Empty from "../common/Empty.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Avatar from "../accounts/Avatar.svelte";

  import ManageCollaborators from "../forms/ManageCollaborators.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import { getCurrentUser } from "@/lib/utils/permissions";

  export let project: Project;
  export let users: ProjectUser[];

  const me = getCurrentUser();
  // Do I belong to this project?
  $: isProjectUser = users.some((u) => u.user.id === $me?.id);

  let edit = false;

  const accessLabels: Record<ProjectAccess, string> = {
    admin: "projects.access.admin",
    edit: "projects.access.edit",
    view: "projects.access.view",
  };

  function sort(users: ProjectUser[]) {
    if (!users) return [];
    return users.sort(
      (a, b) =>
        a.access.localeCompare(b.access) ||
        getUserName(a.user).localeCompare(getUserName(b.user)),
    );
  }
</script>

<SidebarGroup name="collaborators">
  <SidebarItem slot="title">
    <People16 slot="start" />
    {$_("projects.collaborators.title")}
  </SidebarItem>
  <svelte:fragment slot="action"
    >{#if project.add_remove_access}
      <Action
        icon={Pencil16}
        title={$_("projects.collaborators.edit")}
        on:click={() => (edit = true)}
      >
        {$_("projects.collaborators.edit")}
      </Action>
    {/if}</svelte:fragment
  >

  {#each sort(users) as user}
    {#if isProjectUser || project.edit_access}
      <SidebarItem small>
        <Avatar user={user.user} slot="start" />
        {getUserName(user.user)}
        <span class="badge" slot="end">{$_(accessLabels[user.access])}</span>
      </SidebarItem>
    {:else}
      <SidebarItem small>
        <Avatar user={user.user} slot="start" />
        {getUserName(user.user)}
      </SidebarItem>
    {/if}
  {:else}
    <Empty>
      {$_("projects.collaborators.empty")}
      <Action on:click={() => (edit = true)}>
        {$_("projects.collaborators.add")}
      </Action>
    </Empty>
  {/each}
</SidebarGroup>

{#if edit}
  <Portal>
    <Modal on:close={() => (edit = false)}>
      <h1 slot="title">{$_("projects.users")}</h1>
      <ManageCollaborators {project} {users} on:close={() => (edit = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .badge {
    margin-left: 1em;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.1ch;
    color: var(--primary);
  }
</style>
