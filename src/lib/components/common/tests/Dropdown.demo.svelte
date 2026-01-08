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
  <div slot="anchor">{anchorText}</div>
  <div slot="inner" let:close>
    {#each items as item}
      <button class="item" on:click={close} type="button">
        {item}
      </button>
    {/each}
  </div>
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
