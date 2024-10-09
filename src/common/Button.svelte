<script lang="ts">
  import Tooltip from "../lib/components/common/Tooltip.svelte";

  export let href: string | null = null;
  export let external = false;
  export let download = false;
  export let title = "";

  export let small = false;
  export let secondary = false;
  export let tertiary = false;
  export let premium = false;
  export let nondescript = false;
  export let action = false;
  export let caution = false;
  export let danger = false;
  export let disabled = false;
  export let plain = false;
  export let ghost = false;
  export let square = false;
  export let nomargin = false;
  export let fullWidth = false;
  export let type: "submit" | "reset" | "button" = "submit";
  export let label = "Submit";

  export let disabledReason = null;
</script>

<Tooltip caption={disabledReason}>
  {#if href}
    <a
      {href}
      {title}
      on:click
      class:secondary
      class:tertiary
      class:premium
      class:danger
      class:small
      class:caution
      class:nondescript
      class:action
      class:plain
      class:ghost
      class:square
      class:nomargin
      class:fullWidth
      class:disabled={disabled || disabledReason != null}
      rel={external ? "noopener noreferrer" : null}
      target={external ? "_blank" : download ? "download" : null}
    >
      <slot>{label}</slot>
    </a>
  {:else}
    <button
      {title}
      on:click
      class:secondary
      class:tertiary
      class:premium
      class:danger
      class:small
      class:caution
      class:nondescript
      class:action
      class:plain
      class:ghost
      class:square
      class:nomargin
      class:fullWidth
      disabled={disabled || disabledReason != null}
      {type}
    >
      <slot>{label}</slot>
    </button>
  {/if}
</Tooltip>

<style>
  button,
  a {
    display: inline-flex;
    gap: 0.25em;
    align-items: center;
    padding: 6px 15px;
    margin: 6px 0;
    border-radius: var(--radius, 3px);
    outline: none;
    border: none;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    vertical-align: middle;
    background: var(--primary, #4294f0);
    color: white;
    font-family: inherit;
  }

  button.nomargin,
  a.nomargin {
    margin: 0;
  }

  a:disabled,
  button:disabled {
    opacity: 0.7;
    background: var(--gray, rgba(0, 0, 0, 0.53));
    cursor: initial;
    pointer-events: none;
  }

  a:disabled:hover,
  button:disabled:hover {
    opacity: 0.7;
  }

  a:hover,
  button:hover {
    opacity: var(--hover-opacity, 0.8);
  }

  .secondary {
    background: var(--secondary, #626262);
  }

  .tertiary {
    background: var(--tertiary, #0c8a01);
  }

  .premium {
    background: var(--premium, #24cc99);
  }

  .danger {
    background: var(--caution, #f04c42);
  }

  .small {
    padding: 4px 17px;
    font-size: 12px;
  }

  .nondescript,
  .action {
    background: none;
    border-radius: none;
    font-size: 14px;
    padding: 0;
    font-weight: normal;
  }

  .nondescript {
    border-bottom: dashed 1px var(--gray, rgba(0, 0, 0, 0.53));
    color: black;
  }

  .action {
    color: var(--primary, #4294f0);
    fill: var(--primary, #4294f0);
  }

  .action.secondary,
  .action.disabled,
  .action:disabled {
    color: var(--gray, rgba(0, 0, 0, 0.53));
    fill: var(--gray, rgba(0, 0, 0, 0.53));
  }

  .action.small {
    font-size: 12px;
  }

  .caution {
    color: var(--caution, #f04c42);
  }

  .caution.nondescript {
    border-bottom: dashed 1px rgba(var(--caution, #f04c42), 0.5);
  }

  .plain {
    background: rgb(242, 242, 242);
    font-size: 12px;
    border: solid 1px gainsboro;
    padding: 2px 7px;
    color: black;
    font-weight: normal;
    margin: 0 5px;
  }

  .ghost {
    background: transparent;
    color: var(--primary);
    fill: var(--primary);
  }
  .ghost:disabled {
    opacity: 0.5;
    background: transparent;
    color: var(--gray);
    fill: var(--gray);
  }
  .ghost:hover,
  .ghost:focus {
    background: var(--primary-faded);
  }

  .square {
    margin: 0;
    padding: 0.5rem;
  }

  .fullWidth {
    display: flex;
    width: 100%;
    justify-content: center;
  }
</style>
