<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Maybe } from "$lib/api/types";

  interface Props {
    active?: boolean;
    disabled?: boolean;
    small?: boolean;
    hover?: boolean;
    title?: string;
    inline?: boolean;
    // handling link behavior
    href?: Maybe<string>;
    target?: Maybe<string>;
    rel?: Maybe<string>;
    download?: Maybe<boolean | string>;
    start?: Snippet;
    children?: Snippet;
    end?: Snippet;
    onclick?: (e: MouseEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
  }

  let {
    active = false,
    disabled = false,
    small = false,
    hover = false,
    title = "",
    inline = false,
    href = undefined,
    target = undefined,
    rel = undefined,
    download = undefined,
    start,
    children,
    end,
    onclick,
    onkeydown,
  }: Props = $props();
</script>

{#if href}
  <a
    {href}
    {target}
    {rel}
    {download}
    {title}
    class="navItem container"
    class:active
    class:disabled
    class:small
    class:inline
    onclick={(e) => onclick?.(e)}
    onkeydown={(e) => onkeydown?.(e)}
  >
    {@render start?.()}
    <span class="label">{@render children?.()}</span>
    {@render end?.()}
  </a>
{:else}
  <span
    {title}
    class="navItem container"
    class:active
    class:hover
    class:disabled
    class:small
    class:inline
    onclick={(e) => onclick?.(e)}
    onkeydown={(e) => onkeydown?.(e)}
    role="button"
    tabindex={0}
  >
    {@render start?.()}
    <span class="label">{@render children?.()}</span>
    {@render end?.()}
  </span>
{/if}

<style>
  a.container,
  .container {
    min-width: 0;
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5em;
    border-radius: 0.25rem;
    border: none;

    color: var(--color, var(--gray-5, inherit));
    fill: var(--fill, var(--gray-4, inherit));
    background: var(--background, transparent);

    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-size, inherit);
    font-weight: var(--font-semibold, 600);
    text-decoration: none;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  a.container.inline,
  .container.inline {
    display: inline-flex;
    width: auto;
  }

  /* Hover */
  a.container:hover,
  a.container:focus,
  .container.hover:hover,
  .container.hover:focus {
    cursor: pointer;
    background: var(--hover-background, var(--blue-1, #d8dee2));
    color: var(--hover-color, var(--color, inherit));
    fill: var(--hover-fill, var(--fill, inherit));
  }

  a.container.disabled:hover,
  a.container.disabled:focus,
  .container.disabled.hover:hover,
  .container.disabled.hover:focus {
    cursor: default;
    background: transparent;
  }

  /* Active */
  a.container.active,
  .container.active {
    background: var(--active-background, var(--blue-1, #b5ceed));
    color: var(--active-color, var(--blue-5, inherit));
    fill: var(--active-fill, var(--blue-4, inherit));
  }

  @media (hover: none) {
    a.container:hover,
    .container.hover:hover {
      cursor: inherit;
      background: transparent;
    }
    a.container.active:hover,
    .container.active:hover {
      background: var(--active-background, var(--blue-1, #b5ceed));
      color: var(--active-color, var(--blue-5, inherit));
      fill: var(--active-fill, var(--blue-4, inherit));
    }
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
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label:empty {
    display: none;
  }

  :global(.navItem svg) {
    flex: 0 0 auto;
  }
</style>
