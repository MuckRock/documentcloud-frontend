<script lang="ts">
  export let disabled = false;
  export let small = false;
  export let href: string = undefined;
</script>

{#if href}
  <a {href} class="container" class:disabled class:small on:click on:keydown>
    <slot />
  </a>
{:else}
  <button
    {disabled}
    class="container"
    class:disabled
    class:small
    on:click
    on:keydown
  >
    <slot />
  </button>
{/if}

<style>
  .container {
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;
    border: none;

    color: var(--gray-5, #233944);
    fill: var(--gray-5, #233944);
    background: transparent;

    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-m, 1rem);
    font-weight: var(--font-semibold, 600);
    text-decoration: none;

    cursor: pointer;
  }

  /* Hover */
  .container:hover,
  .container:focus {
    background: var(--gray-2, #d8dee2);
  }
  @media (hover: none) {
    .container:hover {
      background: transparent;
    }
  }
  .container.disabled:hover,
  .container.disbaled:focus {
    background: transparent;
    cursor: default;
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
