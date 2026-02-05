<script lang="ts">
  import Dropdown from "../Dropdown.svelte";
  import type { Placement } from "@floating-ui/dom";

  export let anchorText: string;
  export let items: string[];
  export let position: Placement = "bottom-start";
  export let border = false;
  export let overlay = false;
</script>

<Dropdown {position} {border} {overlay}>
  {#snippet anchor()}
    <div>{anchorText}</div>
  {/snippet}
  {#snippet inner({ close })}
    <div>
      {#each items as item}
        <button class="item" on:click={close} type="button">
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
