<!-- @component
Add to and remove from projects.
This component can work entirely in the client,
because it needs to load all of a user's projects 
and we don't want to do that everywhere.
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, Project, User } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";

  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { getForUser, add, remove } from "$lib/api/projects";
  import { getCsrfToken } from "$lib/utils/api";
  import { intersection } from "@/util/array.js";

  export let documents: Document[] = [];
  export let projects: Project[] = [];

  const dispatch = createEventDispatcher();
  const me: Writable<User> = getContext("me");

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

  function onSubmit({ submitter }) {
    submitter.disabled = true;
    return async ({ result, update }) => {
      if (result.type === "success") {
        projects = [...projects, result.data.project];
        update(result);
      }
      submitter.disabled = false;
    };
  }

  function sort(projects: Project[]) {
    return projects.sort(
      (a, b) => +b.pinned - +a.pinned || a.title.localeCompare(b.title),
    );
  }
</script>

<div class="container">
  <form method="post" action="/documents/projects/" use:enhance={onSubmit}>
    <h2>{$_("projects.create")}</h2>
    <Field title={$_("projects.fields.title")} required inline>
      <Text name="title" placeholder={$_("projects.fields.title")} />
    </Field>

    <details>
      <summary>{$_("common.more")} &hellip;</summary>
      <Flex direction="column">
        <Field title={$_("projects.fields.description")}>
          <TextArea name="description" />
        </Field>
        <Field title={$_("projects.fields.private")} inline>
          <Switch name="private" />
        </Field>
        <Field title={$_("projects.fields.pinned")} inline>
          <Switch name="pinned" />
        </Field>
      </Flex>
    </details>
    <Flex>
      <Button mode="primary" type="submit">
        {$_("common.add")} +
      </Button>
    </Flex>
  </form>

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

<style>
  form,
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
