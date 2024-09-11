<script context="module" lang="ts">
  type Action = "edit" | "share" | "users" | "delete";
</script>

<script lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    Alert16,
    People16,
    Pencil16,
    Search16,
    Share16,
    Share24,
  } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import EditProject from "../forms/EditProject.svelte";
  import ManageCollaborators from "../forms/ManageCollaborators.svelte";
  import DeleteProject from "../forms/DeleteProject.svelte";

  import { projectSearchUrl } from "$lib/utils/search";

  export let project: Project;
  export let users: ProjectUser[];

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
</script>

<Flex direction="column">
  <SidebarItem hover on:click={() => (show = "edit")}>
    <Pencil16 />{$_("sidebar.edit")}
  </SidebarItem>

  <SidebarItem hover on:click={() => (show = "users")}>
    <People16 />{$_("sidebar.collaborate")}
  </SidebarItem>

  <SidebarItem hover on:click={() => (show = "share")}>
    <Share16 />{$_("sidebar.shareEmbed")}
  </SidebarItem>
  <SidebarItem
    hover
    --color="var(--caution)"
    --fill="var(--caution)"
    on:click={() => (show = "delete")}
  >
    <Alert16 />
    {$_("projects.delete.action")}
  </SidebarItem>
</Flex>

<hr class="divider" />

<SidebarItem href={projectSearchUrl(project)}>
  <Search16 />{$_("projects.viewInSearch")}
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
