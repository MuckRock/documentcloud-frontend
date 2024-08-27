<script lang="ts">
  import type { Access } from "$lib/api/types";
  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";

  import { levels } from "$lib/utils/access";

  export let name: string;
  export let selected: Access = levels[0].value;
  export let direction: "column" | "row" = "column";
</script>

<Flex {direction} gap={0.5}>
  {#each levels as level}
    <div class="option" class:selected={level.value === selected}>
      <input
        class="sr-only"
        type="radio"
        {name}
        id={level.value}
        bind:group={selected}
        value={level.value}
      />
      <label for={level.value} class="detail">
        <Flex gap={0.5}>
          <svelte:component this={level.icon} />
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
