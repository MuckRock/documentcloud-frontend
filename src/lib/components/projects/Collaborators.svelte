<script lang="ts">
  import type { Project, ProjectUser } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import Empty from "../common/Empty.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let project: Project;
  export let users: ProjectUser[];

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
  </SidebarItem>

  {#each sort(users) as user}
    <SidebarItem small>
      {user.user.name} ({user.access})

      {#if project.add_remove_access}
        <Action icon={Pencil16} title={$_("projects.manage")}>
          <span class="sr-only">{$_("projects.manage")}</span>
        </Action>
      {/if}
    </SidebarItem>
  {:else}
    <Empty>
      {$_("projects.collaborators.empty")}
      <Action>
        {$_("projects.collaborators.add")}
      </Action>
    </Empty>
  {/each}
</SidebarGroup>
