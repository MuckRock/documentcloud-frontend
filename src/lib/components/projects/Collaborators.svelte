<script lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import Empty from "../common/Empty.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  export let project: Project;
  export let users: ProjectUser[];

  let edit = false;

  function sort(users: ProjectUser[]) {
    return users.sort(
      (a, b) =>
        a.access.localeCompare(b.access) ||
        a.user.name.localeCompare(b.user.name),
    );
  }
</script>

<SidebarGroup name="collaborators">
  <SidebarItem slot="title">
    {$_("projects.collaborators.title")}
    {#if project.add_remove_access}
      <Action
        icon={Pencil16}
        title={$_("projects.manage")}
        on:click={() => (edit = true)}
      >
        <span class="sr-only">{$_("projects.manage")}</span>
      </Action>
    {/if}
  </SidebarItem>

  {#each sort(users) as user}
    <SidebarItem small>
      {user.user.name} ({user.access})
    </SidebarItem>
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
      <p>edit</p>
    </Modal>
  </Portal>
{/if}
