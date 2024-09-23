<script lang="ts">
  export let active = false;
  export let disabled = false;
  export let small = false;
  export let hover = false;
  export let title = "";
  export let inline = false;
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
    {title}
    class="sidebarItem container"
    class:active
    class:disabled
    class:small
    class:inline
    on:click
    on:keydown
  >
    <slot name="start" />
    <span class="label"><slot /></span>
    <slot name="end" />
  </a>
{:else}
  <span
    {title}
    class="sidebarItem container"
    class:active
    class:hover
    class:disabled
    class:small
    class:inline
    on:click
    on:keydown
    role="button"
    tabindex={0}
  >
    <slot name="start" />
    <span class="label"><slot /></span>
    <slot name="end" />
  </span>
{/if}

<style>
  .container {
    min-width: 0;
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;
    border: none;

    color: var(--color, inherit);
    fill: var(--fill, inherit);
    background: var(--background, transparent);

    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-size, var(--font-md, 1rem));
    font-weight: var(--font-semibold, 600);
    text-decoration: none;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .container.inline {
    display: inline-flex;
    width: auto;
  }

  /* Hover */
  a.container.active,
  .container.active,
  a.container:hover,
  a.container:focus,
  .container.hover:hover,
  .container.hover:focus {
    cursor: pointer;
    background: var(--hover-background, var(--gray-2, #d8dee2));
    color: var(--hover-color, var(--color, inherit));
    fill: var(--hover-fill, var(--fill, inherit));
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

  /* Active */
  .container.active {
    background: var(--active-background, var(--blue-2, #b5ceed));
    color: var(--active-color, var(--color, inherit));
    fill: var(--active-fill, var(--fill, inherit));
  }

  /* Small */
  .container.small {
    font-size: var(--font-sm, 0.875rem);
  }

  /* Disabled */
  .container.disabled {
    pointer-events: none;
    cursor: default;
    opacity: 0.5;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label:empty {
    display: none;
  }

  :global(.sidebarItem svg) {
    flex: 0 0 auto;
  }
</style>
