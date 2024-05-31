<script lang="ts">
  export let key: string = "";
  export let value: string;
  export let href: string = null;
  export let inline: boolean = false;
  export let tag: boolean = false;
</script>

<div class="kv" class:inline>
  {#if !tag}
    <span class="key">{key}</span>
  {/if}

  <span class="value">
    {#if href}
      <a {href}>{value}</a>
    {:else}
      {value}
    {/if}
  </span>
</div>

<style>
  .kv {
    display: flex;
    padding: 0.1875rem 0.375rem;
    align-items: flex-start;
    gap: 0.625rem;

    border-radius: 0.25rem;
    border: 1px solid var(--blue-2, #b5ceed);
    background: var(--blue-1, #eef3f9);
  }

  .kv.inline {
    display: inline-flex;
  }

  .key,
  .value {
    color: var(--gray-4, #5c717c);
    font-size: var(--font-xs, 0.75rem);
    font-style: italic;
    font-weight: var(--font-regular, 400);
    line-height: normal;
  }

  .value {
    color: var(--blue-5, #153359);
    font-style: normal;
  }
</style>
