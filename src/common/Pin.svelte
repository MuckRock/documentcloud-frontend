<script lang="ts">
  import Pin from "./icons/Pin.svelte";

  export let size: number = 1;
  export let active: boolean = false;
  export let disabled: boolean = false;

  $: title = disabled
    ? "Pinning is disabled"
    : active
      ? "Click to Unpin"
      : "Click to Pin";

  $: cssVarStyles = `--padding:${size * 0.25}em; --border-radius:${
    size * 4
  }px;`;
</script>

<button
  class="pin"
  class:active
  class:disabled
  on:click|stopPropagation|preventDefault
  style={cssVarStyles}
>
  <Pin {title} {size} />
</button>

<style>
  .pin {
    appearance: none;
    background-color: transparent;
    border: none;
    border-radius: var(--border-radius, 4px);
    padding: var(--padding, 0.25em);
    display: flex;
    align-items: center;
    justify-content: center;
    fill: #ccc;
    cursor: pointer;
    transition:
      background-color 0.1s linear,
      fill 0.1s linear;
  }

  .pin:hover {
    background: #eee;
  }

  .pin.active {
    fill: var(--highlight-orange, #ff785c);
  }

  .pin.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .pin.disabled:hover {
    background: transparent;
  }
</style>
