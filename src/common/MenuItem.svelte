<script>
  export let danger = false;
  export let selectable = true;
  export let primary = false;
  export let disabled = false;
  export let indent = false;
  export let special = false;
  export let href = null;
  export let target = null;
  export let selected = false;

  let className = "";
  export { className as class };

  $: tag = href ? "a" : "button";
</script>

<style>
  button,
  a {
    background: none;
    border: none;
    display: block;
    margin: 0;
    text-align: left;
    width: 100%;
  }

  .item {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    padding: 6px 21px;
    font-size: 16px;
    font-family: "Source Sans Pro", sans-serif;
    user-select: none;
  }

  .item .label {
    flex: 1 1 auto;
  }

  .item.danger {
    color: var(--caution, #f04c42);
  }

  .item.special {
    color: var(--searchSpecial, #5a00ff);
  }

  .item.primary {
    color: var(--primary, #4294f0);
  }

  .item.indent {
    padding-left: 39px;
  }

  .item.selectable {
    cursor: pointer;
  }

  .item.selectable:hover {
    background: var(--primary, #4294f0);
    color: white;
  }

  .item.selectable:hover :global(.info),
  .item.selectable:hover :global(.scope) {
    color: white;
  }

  .item.disabled {
    color: var(--gray), rgba(0, 0, 0, 0.53);
    pointer-events: none;
  }

  .item :global(.info) {
    font-size: 13px;
    color: var(--gray), rgba(0, 0, 0, 0.53);
  }

  .item.selected {
    background: var(--primary, #4294f0);
    color: var(--white, white);
  }
</style>

<svelte:element
  this={tag}
  {target}
  {href}
  class="item {className}"
  class:selectable
  class:selected
  class:danger
  class:primary
  class:disabled
  class:indent
  class:special
  on:click
>
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="label"><slot>Define an item</slot></span>
  {#if selected}<span class="scope">✓</span>{/if}
</svelte:element>
