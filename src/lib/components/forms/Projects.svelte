<!-- @component
Add to and remove from projects.
This component can work entirely in the client,
because it needs to load all of a user's projects 
and we don't want to do that everywhere.
-->
<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24, FileDirectory24, PlusCircle16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import EditProject from "./EditProject.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config";
  import { getForUser, add, remove } from "$lib/api/projects";
  import { getCsrfToken } from "$lib/utils/api";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { intersection } from "$lib/utils/array";

  interface Props {
    documents?: Document[];
    projects?: Project[];
    onclose?: () => void;
  }

  let { documents = [], projects = $bindable([]), onclose }: Props = $props();

  let me = $derived(getCurrentUser());

  let createProjectOpen = $state(false);
  let common: Set<number> = $derived(
    new Set(
      intersection(
        documents.map((d) => d.projects ?? []),
        (a, b) => {
          // If a is a number, not a project
          if (typeof a === "number") {
            if (typeof b === "number") {
              return a === b;
            }
            return a === b.id;
          }
          // If b is a number, not a project
          if (typeof b === "number") {
            return a.id === b;
          }
          // a and b are both projects
          return a.id === b.id;
        },
      ).map((p: Project | number) => (typeof p === "number" ? p : p.id)),
    ),
  );

  onMount(async () => {
    if (me && projects.length === 0) {
      projects = await getForUser(me.id);
    }
  });

  function invalidateDocs(documents: Document[]) {
    return Promise.all(documents.map((d) => invalidate(`document:${d.id}`)));
  }

  async function toggle(
    project: Project,
    e: Event & { currentTarget: HTMLInputElement },
  ) {
    const { checked } = e.currentTarget;
    const ids = documents.map((d) => d.id);
    const csrf_token = getCsrfToken();
    if (!csrf_token) {
      console.error("No CSRF token found");
      return;
    }
    if (checked) {
      await add(project.id, ids, csrf_token);
    } else {
      await remove(project.id, ids, csrf_token);
    }
    await invalidateDocs(documents);
  }

  function onCreateSuccess(project: Project) {
    projects = [...projects, project];
  }

  function sort(projects: Project[]) {
    // copy first — sort() mutates in place, which is forbidden on reactive state inside a $derived
    return [...projects].sort(
      (a, b) =>
        +(b.pinned ?? false) - +(a.pinned ?? false) ||
        a.title.localeCompare(b.title),
    );
  }
  let disabled = $derived(
    documents.length < 1 || documents.length > MAX_EDIT_BATCH,
  );
  let sorted = $derived(sort(projects));
</script>

<div class="container">
  <ShowSize size={documents.length}>
    <p>{$_("edit.many", { values: { n: documents.length } })}</p>
    {#snippet empty()}
      <Tip mode="error">
        {#snippet icon()}<Alert24 />{/snippet}
        {$_("edit.nodocs")}
      </Tip>
    {/snippet}
    {#snippet oversize()}
      <Tip mode="danger">
        {#snippet icon()}<Alert24 />{/snippet}
        {$_("edit.toomany", { values: { n: MAX_EDIT_BATCH } })}
      </Tip>
    {/snippet}
  </ShowSize>

  <div class="projects">
    {#each sorted as project}
      <label class="project">
        <input
          type="checkbox"
          name="project"
          value={project.id}
          checked={common.has(project.id)}
          onchange={(e) => toggle(project, e)}
          {disabled}
        />
        {project.title}
      </label>
    {:else}
      <Empty icon={FileDirectory24}>{$_("projects.none")}</Empty>
    {/each}
  </div>
  <footer>
    <Button ghost mode="primary" onclick={() => (createProjectOpen = true)}>
      <PlusCircle16 />
      {$_("projects.create")}
    </Button>
    <input
      type="hidden"
      name="documents"
      value={documents.map((d) => d.id).join(",")}
    />
    <Button onclick={() => onclose?.()}>{$_("dialog.done")}</Button>
  </footer>
</div>

{#if createProjectOpen}
  <Portal>
    <Modal onclose={() => (createProjectOpen = false)}>
      {#snippet title()}
        <h1>{$_("projects.create")}</h1>
      {/snippet}
      <EditProject
        onclose={() => (createProjectOpen = false)}
        onsuccess={onCreateSuccess}
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

  .projects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid var(--gray-2);
    padding: 0.5rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
