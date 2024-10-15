<!-- @component
Update permissions for a single collaborator on a project
-->
<script context="module" lang="ts">
  import type { Project, ProjectAccess, ProjectUser } from "$lib/api/types";

  interface Level {
    value: ProjectAccess;
    title: string;
    description: string;
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import { getUserName } from "$lib/api/accounts";

  const dispatch = createEventDispatcher();
  const levels: Level[] = [
    {
      value: "view",
      title: $_("collaborators.access.view.title"),
      description: $_("collaborators.access.view.description"),
    },
    {
      value: "edit",
      title: $_("collaborators.access.edit.title"),
      description: $_("collaborators.access.edit.description"),
    },
    {
      value: "admin",
      title: $_("collaborators.access.admin.title"),
      description: $_("collaborators.access.admin.description"),
    },
  ];

  export let project: Project;
  export let user: ProjectUser;
  export let selected = levels[0].value;

  $: action = new URL("?/update", canonicalUrl(project)).href;
  $: name = getUserName(user.user);
  $: title = project.title;
</script>

<form {action} method="post">
  <p>{$_("collaborators.update.message", { values: { name, title } })}</p>

  <Flex direction="column" gap={0.5}>
    {#each levels as level}
      {@const id = `project-access-${level.value}`}
      <div class="option" class:selected={selected === level.value}>
        <input
          class="sr-only"
          type="radio"
          {name}
          {id}
          bind:group={selected}
          value={level.value}
        />
        <label for={id} class="detail">
          <Flex gap={0.5}>
            <Flex direction="column" gap={0.125}>
              <p class="title">{level.title}</p>
              <p class="description">{level.description}</p>
            </Flex>
          </Flex>
        </label>
      </div>
    {/each}
  </Flex>

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("dialog.update")}</Button>
    <Button on:click={() => dispatch("close")}>{$_("dialog.cancel")}</Button>
  </Flex>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .option {
    flex: 1 1 0;
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--white);
    color: var(--gray-5);
    fill: var(--gray-5);
    cursor: pointer;
  }

  .option.selected {
    border: 1px solid var(--blue-2, #b5ceed);
    background: var(--blue-1, #eef3f9);
    color: var(--blue-5);
    fill: var(--blue-5);
  }

  .detail {
    cursor: pointer;
  }

  .title {
    font-weight: var(--font-semibold);
  }

  .description {
    font-size: var(--font-xs);
    opacity: 0.7;
  }

  .sr-only {
    position: absolute;
    clip: rect(1px, 1px, 1px, 1px);
    padding: 0;
    border: 0;
    height: 1px;
    width: 1px;
    overflow: hidden;
  }
</style>
