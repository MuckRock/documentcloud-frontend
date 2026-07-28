<script lang="ts">
  import type { Access } from "$lib/api/types";
  import type { AccessKind } from "$lib/utils/access";

  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";
  import { getLevels, VALUES } from "$lib/utils/access";

  interface Props {
    name: string;
    selected?: Access | null;
    direction?: "column" | "row";
    required?: boolean;
    /** Notes label `organization` access as "Collaborators" */
    kind?: AccessKind;
  }

  let {
    name,
    selected = $bindable(VALUES[0]!),
    direction = "column",
    required = false,
    kind = "document",
  }: Props = $props();

  let levels = $derived(getLevels(kind));
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
            <level.icon />
            <Flex direction="column" gap={0.125}>
              <p class="title">{$_(level.title)}</p>
              <p class="description">{$_(level.description)}</p>
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
