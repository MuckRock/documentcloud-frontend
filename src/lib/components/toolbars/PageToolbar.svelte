<!--
  @component
  PageToolbar floats at the bottom of the page, holding controls like pagination.
  It's slotted for composition based on the page it's on.
-->
<script lang="ts">
  interface Props {
    width?: undefined | number;
    left?: import("svelte").Snippet;
    center?: import("svelte").Snippet;
    right?: import("svelte").Snippet;
  }

  let { width = $bindable(undefined), left, center, right }: Props = $props();
</script>

<div class="toolbar" bind:clientWidth={width}>
  {#if left}
    <div class="left">
      {@render left?.()}
    </div>
  {/if}
  {#if center}
    <div class="center">
      {@render center?.()}
    </div>
  {/if}
  {#if right}
    <div class="right">
      {@render right?.()}
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
  }

  .left,
  .center,
  .right {
    flex: 1 0 0;
    min-width: 0;
  }

  .left {
    text-align: left;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }
</style>
