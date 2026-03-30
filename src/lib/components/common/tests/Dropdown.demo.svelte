<script lang="ts">
  import type { Placement } from "@floating-ui/dom";
  import Dropdown from "../Dropdown.svelte";

  interface Props {
    anchorText: string;
    items: string[];
    position?: Placement;
    border?: boolean;
    overlay?: boolean;
  }

  let {
    anchorText,
    items,
    position = "bottom-start",
    border = false,
    overlay = false,
  }: Props = $props();
</script>

<Dropdown {position} {border} {overlay}>
  {#snippet anchor()}
    <div>{anchorText}</div>
  {/snippet}
  {#snippet inner({ close })}
    <div>
      {#each items as item}
        <button class="item" onclick={close} type="button">
          {item}
        </button>
      {/each}
    </div>
  {/snippet}
</Dropdown>

<style>
  .item {
    padding: 0.5rem;
    cursor: pointer;
  }
  .item:hover {
    background: lightgray;
  }
</style>
