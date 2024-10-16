<!-- @component
Project access input
-->
<script context="module" lang="ts">
  import type { ProjectAccess } from "$lib/api/types";

  export interface Level {
    value: ProjectAccess;
    title: string;
    description: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";

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

  export let name: string = "access";
  export let selected = levels[0].value;
</script>

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

<style>
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
