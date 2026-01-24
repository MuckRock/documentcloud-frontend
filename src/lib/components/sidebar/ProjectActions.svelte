<script context="module" lang="ts">
  type Action = "edit" | "share" | "delete";
</script>

<script lang="ts">
  import type { Nullable, Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, Share16, Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import EditProject from "../forms/EditProject.svelte";
  import DeleteProject from "../forms/DeleteProject.svelte";
  import ProjectShare from "../projects/ProjectShare.svelte";
  import Flex from "../common/Flex.svelte";

  export let project: Project;

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

<Flex direction="column" align="start">
  <!-- Viewer Actions -->
  <Button ghost on:click={() => (show = "share")}>
    <Share16 />{$_("sidebar.shareEmbedProject")}
  </Button>
  {#if project.edit_access || project.add_remove_access}
    <!-- Admin & Editor Actions -->
    {#if project.edit_access}
      <Button ghost mode="primary" on:click={() => (show = "edit")}>
        <Pencil16 />
        {$_("sidebar.editProject")}
      </Button>
    {/if}

    {#if project.edit_access}
      <Button ghost mode="danger" on:click={() => (show = "delete")}>
        <Trash16 />
        {$_("sidebar.deleteProject")}
      </Button>
    {/if}
  {/if}
</Flex>

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
        <ProjectShare {project} />
      {/if}

      {#if show === "delete"}
        <DeleteProject {project} on:close={hide} />
      {/if}
    </Modal>
  </Portal>
{/if}
