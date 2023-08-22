<script>
  export let danger = false;
  export let selectable = true;
  export let primary = false;
  export let disabled = false;
  export let indent = false;
  export let special = false;
  export let href = null;
  export let target = null;

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
    padding: 6px 21px;
    font-size: 16px;
    user-select: none;
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
</style>

<svelte:element
  this={tag}
  {target}
  {href}
  class="item {className}"
  class:selectable
  class:danger
  class:primary
  class:disabled
  class:indent
  class:special
  on:click
>
  <slot>Define an item</slot>
</svelte:element>
