<script lang="ts">
  import type {
    Project,
    ProjectAccess,
    ProjectUser,
    User,
  } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, People16, PlusCircle16, XCircle16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import Flex from "../common/Flex.svelte";
  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Avatar from "../accounts/Avatar.svelte";

  import InviteCollaborator from "../forms/InviteCollaborator.svelte";
  import UpdateCollaborator from "../forms/UpdateCollaborator.svelte";
  import RemoveCollaborator from "../forms/RemoveCollaborator.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { getUserName } from "$lib/api/accounts";
  import { getCurrentUser } from "@/lib/utils/permissions";

  export let project: Project;
  export let users: ProjectUser[];

  const me = getCurrentUser();

  const accessLabels: Record<ProjectAccess, string> = {
    admin: "projects.access.admin",
    edit: "projects.access.edit",
    view: "projects.access.view",
  };

  const actions: Record<string, string> = {
    invite: $_("collaborators.invite.label"),
    update: $_("collaborators.update.label"),
    remove: $_("collaborators.remove.label"),
  };

  let show: "invite" | "update" | "remove" = null;
  let user_to_update: ProjectUser = null;

  // Do I belong to this project?
  $: isProjectUser = users.some((u) => u.user.id === $me?.id);

  function isMe(user: ProjectUser, me: User | null): boolean {
    const id = typeof user.user === "object" ? user.user.id : user.user;

    return id === me?.id;
  }

  function hide() {
    show = null;
    user_to_update = null;
  }

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

  {#if users.length > 0 && project.add_remove_access}
    <SidebarItem hover small on:click={() => (show = "invite")}>
      <PlusCircle16 slot="start" />
      {$_("projects.collaborators.add")}
    </SidebarItem>
  {/if}

  {#each sort(users) as user}
    {#if isProjectUser || project.edit_access}
      <SidebarItem small>
        <Avatar user={user.user} slot="start" />
        {getUserName(user.user)}
        <Flex slot="end">
          <span class="badge">{$_(accessLabels[user.access])}</span>
          {#if project.add_remove_access && !isMe(user, $me)}
            <Button
              ghost
              mode="primary"
              minW={false}
              size="small"
              title={actions.update}
              on:click={() => {
                user_to_update = user;
                show = "update";
              }}
            >
              <Pencil16 />
            </Button>
            <Button
              ghost
              mode="danger"
              minW={false}
              size="small"
              title={actions.remove}
              on:click={() => {
                user_to_update = user;
                show = "remove";
              }}
            >
              <XCircle16 />
            </Button>
          {/if}
        </Flex>
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
      {#if project.add_remove_access}
        <Action title={actions.invite} on:click={() => (show = "invite")}>
          {$_("projects.collaborators.add")}
        </Action>
      {/if}
    </Empty>
  {/each}
</SidebarGroup>

{#if show}
  <Portal>
    <Modal on:close={hide}>
      <h1 slot="title">{actions[show]}</h1>

      {#if show === "invite"}
        <InviteCollaborator {project} on:close={hide} />
      {/if}

      {#if show === "update"}
        <UpdateCollaborator {project} user={user_to_update} on:close={hide} />
      {/if}

      {#if show === "remove"}
        <RemoveCollaborator {project} user={user_to_update} on:close={hide} />
      {/if}
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

    display: flex;
    align-items: center;
  }
</style>
