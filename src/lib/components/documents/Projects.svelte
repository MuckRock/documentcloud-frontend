<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { FileDirectory16, FileDirectory24 } from "svelte-octicons";

  import Action from "@/lib/components/common/Action.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import Modal from "@/lib/components/layouts/Modal.svelte";
  import Portal from "@/lib/components/layouts/Portal.svelte";
  import Projects from "@/lib/components/forms/Projects.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  export let document: Document;
  export let projects: Project[];

  let show = false;

  function hide() {
    show = false;
  }
</script>

<SidebarGroup name="projects:viewer">
  <SidebarItem slot="title">
    <FileDirectory16 />
    {$_("projects.header")}
  </SidebarItem>

  {#each projects as project}
    <SidebarItem small href={canonicalUrl(project).href}>
      {project.title}
    </SidebarItem>
  {:else}
    <Empty icon={FileDirectory24}>
      <Action on:click={() => (show = true)}>
        {$_("projects.add", { values: { n: 1 } })}
      </Action>
    </Empty>
  {/each}
  {#if projects.length}
    <SidebarItem>
      <Action on:click={() => (show = true)}>
        {$_("projects.add", { values: { n: 1 } })}
      </Action>
    </SidebarItem>
  {/if}
</SidebarGroup>

{#if show}
  <Portal>
    <Modal on:close={hide}>
      <Projects documents={[document]} on:close={hide} />
    </Modal>
  </Portal>
{/if}
