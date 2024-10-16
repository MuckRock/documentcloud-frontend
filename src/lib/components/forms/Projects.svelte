<!-- @component
Add to and remove from projects.
This component can work entirely in the client,
because it needs to load all of a user's projects 
and we don't want to do that everywhere.
-->
<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { createEventDispatcher, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { getForUser, add, remove } from "$lib/api/projects";
  import { getCsrfToken } from "$lib/utils/api";
  import { intersection } from "@/util/array.js";
  import { getCurrentUser } from "@/lib/utils/permissions";
  import { PlusCircle16 } from "svelte-octicons";
  import EditProject from "./EditProject.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";

  export let documents: Document[] = [];
  export let projects: Project[] = [];

  const dispatch = createEventDispatcher();
  const me = getCurrentUser();

  let createProjectOpen = false;
  let common: Set<number>;

  $: common = new Set(
    intersection(
      documents.map((d) => d.projects ?? []),
      (a, b) => {
        return a.id === b?.id;
      },
    ).map((p: Project | number) => (typeof p === "number" ? p : p.id)),
  );

  onMount(async () => {
    if ($me && projects.length === 0) {
      projects = await getForUser($me.id);
    }
  });

  function invalidateDocs(documents: Document[]) {
    return Promise.all(documents.map((d) => invalidate(`document:${d.id}`)));
  }

  // typescript doesn't know what to do with svelte's events
  async function toggle(project: Project, e) {
    const { checked } = e.target;
    const ids = documents.map((d) => d.id);
    const csrf_token = getCsrfToken();
    if (checked) {
      await add(project.id, ids, csrf_token);
    } else {
      await remove(project.id, ids, csrf_token);
    }
    await invalidateDocs(documents);
  }

  function onCreateSuccess(event: CustomEvent<{ data: { project: Project } }>) {
    projects = [...projects, event.detail.data.project];
  }

  function sort(projects: Project[]) {
    return projects.sort(
      (a, b) => +b.pinned - +a.pinned || a.title.localeCompare(b.title),
    );
  }
</script>

<div class="container">
  <Button ghost mode="primary" on:click={() => (createProjectOpen = true)}>
    <PlusCircle16 /> Create Project
  </Button>
  {#if projects.length}
    <hr class="divider" />
    <Flex direction="column" class="projects">
      {#each sort(projects) as project}
        <label class="project">
          <input
            type="checkbox"
            name="project"
            value={project.id}
            checked={common.has(project.id)}
            on:change={(e) => toggle(project, e)}
          />
          {project.title}
        </label>
      {/each}
    </Flex>
    <hr class="divider" />
  {/if}
  <Flex class="buttons">
    <input
      type="hidden"
      name="documents"
      value={documents.map((d) => d.id).join(",")}
    />
    <Button on:click={() => dispatch("close")}>{$_("dialog.done")}</Button>
  </Flex>
</div>
{#if createProjectOpen}
  <Portal>
    <Modal on:close={() => (createProjectOpen = false)}>
      <h1 slot="title">Create Project</h1>
      <EditProject
        on:close={() => (createProjectOpen = false)}
        on:success={onCreateSuccess}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  details {
    cursor: pointer;
  }

  summary {
    cursor: pointer;
    margin-bottom: 0.5rem;
  }
</style>
