<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { People16, Pencil16, Search16, Share16 } from "svelte-octicons";

  import Flex from "../common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { projectSearchUrl } from "$lib/utils/search";

  export let project: Project;

  let show: "edit" | "share" | "users" = null;
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
</Flex>

<hr class="divider" />

<SidebarItem href={projectSearchUrl(project)}>
  <Search16 />{$_("projects.viewInSearch")}
</SidebarItem>

{#if show}
  <Portal>
    <Modal on:close={() => (show = null)}>
      {#if show === "edit"}
        <p>Edit</p>
      {/if}

      {#if show === "share"}
        <p>Share</p>
      {/if}

      {#if show === "users"}
        <p>Manage users</p>
      {/if}
    </Modal>
  </Portal>
{/if}
