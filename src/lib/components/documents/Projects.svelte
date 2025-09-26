<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { FileDirectory16, FileDirectory24, Pencil16 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Projects from "$lib/components/forms/Projects.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let document: Document;
  export let projects: Project[];

  let edit = false;

  function hide() {
    edit = false;
  }
</script>

<SidebarGroup name="projects:viewer">
  <NavItem slot="title">
    <FileDirectory16 slot="start" />
    {$_("projects.header")}
  </NavItem>
  <div slot="action">
    {#if document.edit_access}
      <Action on:click={() => (edit = true)} icon={Pencil16}>
        {$_("common.edit", { values: { n: 1 } })}
      </Action>
    {/if}
  </div>

  {#each projects as project}
    <NavItem small href={canonicalUrl(project).href}>
      {project.title}
    </NavItem>
  {:else}
    <Empty icon={FileDirectory24}>
      {#if document.edit_access}
        <Action on:click={() => (edit = true)}>
          {$_("projects.add", { values: { n: 1 } })}
        </Action>
      {/if}
    </Empty>
  {/each}
</SidebarGroup>

{#if edit}
  <Portal>
    <Modal on:close={hide}>
      <h1 slot="title">{$_("projects.header")}</h1>
      <Projects documents={[document]} on:close={hide} />
    </Modal>
  </Portal>
{/if}
