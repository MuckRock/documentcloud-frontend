<script context="module" lang="ts">
  export interface Level {
    value: Access;
    title: string;
    description: string;
    icon: typeof SvgComponent;
  }
</script>

<script lang="ts">
  import type { Access } from "$lib/api/types";
  import {
    Globe24,
    Lock24,
    Organization24,
    type SvgComponent,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";

  export const levels: Level[] = [
    {
      value: $_("access.private.value") as Access,
      title: $_("access.private.title"),
      description: $_("access.private.description"),
      icon: Lock24,
    },
    {
      value: $_("access.organization.value") as Access,
      title: $_("access.organization.title"),
      description: $_("access.organization.description"),
      icon: Organization24,
    },
    {
      value: $_("access.public.value") as Access,
      title: $_("access.public.title"),
      description: $_("access.public.description"),
      icon: Globe24,
    },
  ];

  export let name: string;
  export let selected: Access = levels[0]!.value;
  export let direction: "column" | "row" = "column";
  export let required = false;
</script>

<Flex direction="column">
  {#if required && !selected}
    <p class="error">
      {$_("dialog.required")}
    </p>
  {/if}
  <Flex {direction} gap={0.5}>
    {#each levels as level}
      <div class="option" class:selected={level.value === selected}>
        <label for={level.value} class="detail">
          <Flex gap={0.5}>
            <svelte:component this={level.icon} />
            <Flex direction="column" gap={0.125}>
              <p class="title">{level.title}</p>
              <p class="description">{level.description}</p>
            </Flex>
          </Flex>
          <input
            class="sr-only"
            type="radio"
            {name}
            id={level.value}
            bind:group={selected}
            value={level.value}
            {required}
          />
        </label>
      </div>
    {/each}
  </Flex>
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
  .error {
    color: var(--error);
  }
</style>
