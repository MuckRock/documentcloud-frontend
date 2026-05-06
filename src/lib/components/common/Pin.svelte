<script lang="ts">
  import Pin from "../icons/Pin.svelte";

  interface Props {
    size?: number;
    active?: boolean;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
  }

  let { size = 1, active = false, disabled = false, onclick }: Props = $props();

  let title = $derived(
    disabled
      ? "Pinning is disabled"
      : active
        ? "Click to Unpin"
        : "Click to Pin",
  );

  let cssVarStyles = $derived(
    `--padding:${size * 0.25}em; --border-radius:${size * 4}px;`,
  );
</script>

<button
  {disabled}
  class="pin"
  class:active
  class:disabled
  style={cssVarStyles}
  onclick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    onclick?.(e);
  }}
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
