<script lang="ts">
  import type {
    Nullable,
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
  import { getCurrentUser } from "$lib/utils/permissions";
  import Tooltip from "../common/Tooltip.svelte";

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

  let show: Nullable<"invite" | "update" | "remove"> = null;
  let user_to_update: Nullable<ProjectUser> = null;

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

  function group(users: ProjectUser[]) {
    const groups: Record<ProjectAccess, ProjectUser[]> = {
      admin: [],
      edit: [],
      view: [],
    };

    users.forEach((user) => {
      groups[user.access].push(user);
    });

    return groups;
  }
</script>

{#if users.length > 0 || project.add_remove_access}
  <SidebarGroup name="collaborators">
    <SidebarItem slot="title">
      <People16 slot="start" />
      {$_("projects.collaborators.title")}
    </SidebarItem>

    <span slot="action">
      {#if project.add_remove_access}
        <Button
          ghost
          mode="primary"
          size="small"
          minW={false}
          on:click={() => (show = "invite")}
          slot="action"
        >
          <PlusCircle16 height={14} width={14} />
          {$_("projects.collaborators.add")}
        </Button>
      {/if}
    </span>

    {#each Object.entries(group(sort(users))) as [key, members]}
      {#if members.length}
        <header>
          <h4>{$_(accessLabels[key])}</h4>
        </header>
      {/if}
      {#each members as user}
        {#if isProjectUser || project.edit_access}
          <SidebarItem small>
            <Avatar user={user.user} slot="start" />
            {getUserName(user.user)}
            <Flex gap={0} slot="end">
              {#if project.add_remove_access && !isMe(user, $me)}
                <Tooltip caption={actions.update}>
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
                    <Pencil16 height={14} width={14} />
                  </Button>
                </Tooltip>
                <Tooltip caption={actions.remove}>
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
                    <XCircle16 height={14} width={14} />
                  </Button>
                </Tooltip>
              {/if}
            </Flex>
          </SidebarItem>
        {:else}
          <SidebarItem small>
            <Avatar user={user.user} slot="start" />
            {getUserName(user.user)}
          </SidebarItem>
        {/if}
      {/each}
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
{/if}

{#if show && project.add_remove_access}
  <Portal>
    <Modal on:close={hide}>
      <h1 slot="title">{actions[show]}</h1>

      {#if show === "invite"}
        <InviteCollaborator {project} on:close={hide} />
      {/if}

      {#if show === "update" && user_to_update}
        <UpdateCollaborator {project} user={user_to_update} on:close={hide} />
      {/if}

      {#if show === "remove" && user_to_update}
        <RemoveCollaborator {project} user={user_to_update} on:close={hide} />
      {/if}
    </Modal>
  </Portal>
{/if}

<style>
  header h4 {
    margin: 0;
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--gray-4);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.5rem;
  }
</style>
