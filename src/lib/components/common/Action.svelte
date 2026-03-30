<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import type { SvgComponent } from "svelte-octicons";

  interface Props extends HTMLButtonAttributes {
    icon?: null | typeof SvgComponent;
    children?: Snippet;
  }

  let {
    icon: Icon = null,
    disabled = false,
    title = undefined,
    children,
    ...rest
  }: Props = $props();
</script>

<button class="container" class:disabled {disabled} {title} {...rest}>
  {#if Icon}<Icon height="14" width="14" />{/if}
  {@render children?.()}
</button>

<style>
  .container {
    display: inline-flex;
    padding: 0.25rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.375rem;

    border-radius: 0.5rem;

    border: none;
    background: transparent;
    color: var(--color, var(--primary, --blue-3, #4294f0));
    fill: var(--fill, var(--primary, --blue-3, #4294f0));
    font-family: inherit;

    font-size: var(--font-xs, 0.75rem);
    font-weight: var(--font-semibold, 700);
    line-height: normal;
    text-transform: uppercase;

    cursor: pointer;
  }

  .container:hover {
    background: var(--blue-1, #eef3f9);
  }

  .disabled {
    pointer-events: none;
  }

  @media (hover: none) {
    .container:hover {
      background: transparent;
    }
  }
</style>
