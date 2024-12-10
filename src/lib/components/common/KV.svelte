<script lang="ts">
  export let key: string = "";
  export let value: string;
  export let href: null | string = null;
  export let inline: boolean = false;
  export let tag: boolean = false;

  let el = href ? "a" : "span";

  $: props = { ...$$restProps, href };
</script>

<svelte:element this={el} class="kv" class:link={href} class:inline {...props}>
  {#if !tag}
    <span class="key">{key}</span>
  {/if}

  <span class="value">
    {value}
  </span>
</svelte:element>

<style>
  .kv {
    display: flex;
    align-items: baseline;
    padding: 0.1875rem 0.375rem;
    gap: 0.375rem;

    border-radius: 0.25rem;
    border: 1px solid var(--gray-2, #b5ceed);

    color: var(--gray-5, #5c717c);
    font-size: var(--font-xs, 0.75rem);
    font-style: italic;
    font-weight: var(--font-regular, 400);
    line-height: normal;
  }

  .link.kv {
    color: var(--blue-5, #153359);
    border-color: var(--blue-2);
    background: var(--blue-1);
    text-decoration: none;
  }
  .link.kv:hover {
    cursor: pointer;
    filter: brightness(1.025);
  }

  .kv.inline {
    display: inline-flex;
  }

  .key {
    font-style: normal;
    font-size: var(--font-sm);
  }

  .value {
    font-style: normal;
    word-break: break-all;
  }
</style>
