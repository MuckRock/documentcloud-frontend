<script lang="ts">
  export let key: string;
  export let value: string;
  export let href: string = null;
  export let tag: boolean = false;
</script>

<div class="kv">
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
    border: 1px solid var(--color-blue-gray, #b5ceed);
    background: var(--color-gray-light, #eef3f9);
  }

  .key,
  .value {
    color: var(--color-blue-dark, rgba(21, 51, 89, 0.6));
    font-size: var(--font-size-tiny, 0.625rem);
    font-style: italic;
    font-weight: 400;
    line-height: normal;
  }

  .value {
    color: var(--color-blue-dark, #153359);
    font-style: normal;
  }
</style>
