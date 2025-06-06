<script lang="ts">
  import { CheckCircleFill16 } from "svelte-octicons";
  import { qs } from "$lib/utils/navigation";

  export let danger = false;
  export let selectable = true;
  export let primary = false;
  export let disabled = false;
  export let indent = false;
  export let special = false;
  export let href: string | null | undefined = null;
  export let target: string | null | undefined = null;
  export let selected = false;

  let className = "";
  export { className as class };

  export let preserveQS = false;
</script>

{#if href}
  <a
    {target}
    {href}
    role="menuitem"
    tabindex="0"
    class="item {className}"
    class:selectable
    class:selected
    class:danger
    class:primary
    class:disabled
    class:indent
    class:special
    on:click
    use:qs={preserveQS}
  >
    <slot name="icon" />
    <span class="label"><slot>Define an item</slot></span>
    {#if selected}<CheckCircleFill16 />{/if}
  </a>
{:else}
  <button
    class="item {className}"
    class:selectable
    class:selected
    class:danger
    class:primary
    class:disabled
    class:indent
    class:special
    on:click
    role="menuitem"
    tabindex="0"
  >
    <slot name="icon" />
    <span class="label"><slot>Define an item</slot></span>
    {#if selected}<CheckCircleFill16 />{/if}
  </button>
{/if}

<style>
  button,
  a {
    background: none;
    border: none;
    display: block;
    margin: 0;
    text-align: left;
    width: 100%;
    text-decoration: none;
    color: inherit;
    font-weight: var(--font-semibold);
  }

  .item {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem 0.5rem 0.75rem;
    font-size: 1rem;
    font-family: "Source Sans Pro", sans-serif;
    user-select: none;
    white-space: nowrap;
    box-sizing: border-box;
    border-radius: 0.25rem;
  }

  .item .label {
    flex: 1 1 auto;
  }

  .item.danger {
    color: var(--caution, #f04c42);
    fill: var(--caution, #f04c42);
  }

  .item.special {
    color: var(--searchSpecial, #5a00ff);
    fill: var(--searchSpecial, #5a00ff);
  }

  .item.primary {
    color: var(--primary, #4294f0);
    fill: var(--primary, #4294f0);
  }

  .item.indent {
    padding-left: 39px;
  }

  .item.selectable {
    cursor: pointer;
  }

  .item.disabled {
    color: var(--gray), rgba(0, 0, 0, 0.53);
    fill: var(--gray), rgba(0, 0, 0, 0.53);
    pointer-events: none;
  }

  .item :global(.info) {
    font-size: 13px;
    color: var(--gray), rgba(0, 0, 0, 0.53);
    fill: var(--gray), rgba(0, 0, 0, 0.53);
  }

  .item.selectable:hover,
  .item.selected {
    background: var(--primary, #4294f0);
    color: var(--white, white);
    fill: var(--white, white);
  }

  .item.selectable:hover :global(.info),
  .item.selectable:hover :global(.scope) {
    color: white;
    fill: white;
  }
</style>
