<script lang="ts">
  export let active = false;
  export let disabled = false;
  export let small = false;
  export let hover = false;
  // handling link behavior
  export let href: string = undefined;
  export let target: string = undefined;
  export let rel: string = undefined;
  export let download: boolean | string = undefined;
</script>

{#if href}
  <a
    {href}
    {target}
    {rel}
    {download}
    class="container"
    class:active
    class:disabled
    class:small
    on:click
    on:keydown
  >
    <slot />
  </a>
{:else}
  <span class="container" class:active class:hover class:disabled class:small>
    <slot />
  </span>
{/if}

<style>
  .container {
    width: 100%;
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;
    border: none;

    color: inherit;
    fill: inherit;
    background: transparent;

    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-m, 1rem);
    font-weight: var(--font-semibold, 600);
    text-decoration: none;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* Hover */
  a.container:hover,
  a.container:focus,
  .container.hover:hover,
  .container.hover:focus {
    cursor: pointer;
    background: var(--gray-2, #d8dee2);
  }
  @media (hover: none) {
    a.container:hover,
    .container.hover:hover {
      cursor: default;
      background: transparent;
    }
  }
  a.container.disabled:hover,
  a.container.disabled:focus,
  .container.disabled.hover:hover,
  .container.disabled.hover:focus {
    cursor: default;
    background: transparent;
  }

  .container.active {
    background-color: var(--blue-2, #b5ceed);
  }

  /* Small */
  .container.small {
    font-size: var(--font-s, 0.875rem);
  }

  /* Disabled */
  .container.disabled {
    pointer-events: none;
    cursor: default;
    opacity: 0.5;
  }
</style>
