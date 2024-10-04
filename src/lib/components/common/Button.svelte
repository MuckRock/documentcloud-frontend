<script lang="ts">
  export let mode:
    | "standard"
    | "success"
    | "failure"
    | "primary"
    | "danger"
    | "premium" = "standard";
  export let ghost = false;
  export let full = false;
  export let size: "small" | "normal" = "normal";
  export let minW = true;

  export let disabled = false;

  export let title: string = "";
  export let type: "submit" | "reset" | "button" = "button";
  export let label = "Submit";
  // anchor-specific properties
  export let href: string = undefined;
  export let target: string = undefined;
  export let download: boolean | string = undefined;
  export let rel: string =
    target === "_blank" ? "noopener noreferrer" : undefined;
  // button-specific properties
  export let name: string = undefined;
  export let value: any = undefined;
  export let formaction: string = undefined;
</script>

{#if href}
  <a
    {href}
    {title}
    {target}
    {rel}
    {download}
    on:click
    class="{mode} {size}"
    class:ghost
    class:full
    class:minW
    {...$$restProps}
  >
    <slot>{label}</slot>
  </a>
{:else}
  <button
    {title}
    on:click
    class="{mode} {size}"
    {disabled}
    {type}
    {name}
    {value}
    {formaction}
    class:ghost
    class:full
    class:minW
    {...$$restProps}
  >
    <slot>{label}</slot>
  </button>
{/if}

<style>
  a,
  button {
    cursor: pointer;
    display: inline-flex;
    padding: 0.375rem 0.75rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-4, #5c717c);
    background: var(--gray-3, #99a8b3);
    box-shadow: 0px 2px 0px 0px var(--gray-4, #5c717c);

    color: var(--white, #ffffff);
    fill: var(--white, #ffffff);
    text-align: center;
    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-md, 1rem);
    font-weight: var(--font-semibold, 600);
  }

  a {
    text-decoration: none;
  }

  .primary {
    border-color: var(--blue-4, #1367d0);
    background: var(--primary, #4294f0);
    box-shadow: 0px 2px 0px 0px var(--blue-4, #1367d0);
  }

  .danger {
    background: var(--orange-3, #ec7b6b);
    border: 1px solid var(--orange-4, #69515c);
    box-shadow: 0px 2px 0px 0px var(--orange-4, #69515c);
  }

  .premium,
  .success {
    background: var(--green-3, #27c6a2);
    box-shadow: 0px 2px 0px 0px var(--green-4, #117383);
    border-color: var(--green-4, #117383);
  }

  .failure {
    background: var(--red-3, #27c6a2);
    box-shadow: 0px 2px 0px 0px var(--red-4, #117383);
    border-color: var(--red-4, #117383);
  }

  .ghost {
    background: none;
    border: none;
    box-shadow: none;
    color: var(--color, var(--gray-4, #5c717c));
    fill: var(--fill, var(--gray-4, #5c717c));
  }

  .ghost:hover {
    background: var(--background, var(--gray-1, #eef3f9));
  }

  .ghost.primary {
    color: var(--blue-3, #1367d0);
    fill: var(--blue-3, #1367d0);
  }

  .ghost.primary:hover {
    background: var(--blue-1, #eef3f9);
  }

  .ghost.danger {
    color: var(--orange-3, #ec7b6b);
    fill: var(--orange-3, #ec7b6b);
  }

  .ghost.danger:hover {
    background: var(--orange-1, #fff0ee);
  }

  .ghost.premium,
  .ghost.success {
    color: var(--green-3, #27c6a2);
    fill: var(--green-3, #27c6a2);
  }

  .ghost.premium:hover,
  .ghost.success:hover {
    background: var(--green-1, #ebf9f6);
  }

  .ghost.failure {
    color: var(--red-3);
    fill: var(--red-3);
  }

  .ghost.failure:hover {
    background: var(--red-1);
  }

  .ghost.small {
    box-shadow: none;
  }

  .ghost:hover {
    background: var(--background, var(--blue-1, #eef3f9));
  }

  .small {
    font-size: var(--font-sm, 0.875rem);
    padding: 0.25rem 0.5rem;
    box-shadow: inset var(--shadow-3);
  }

  .small:hover {
    box-shadow: none;
  }

  .small.danger {
    border-color: var(--orange-3);
  }

  @media (hover: none) {
    .ghost:hover {
      background: transparent;
    }
  }

  button:disabled,
  .disabled {
    opacity: 0.5;
    cursor: initial;
  }

  .ghost:disabled {
    color: var(--gray-4, #5c717c);
    fill: var(--gray-4, #5c717c);
  }
  .ghost:disabled:hover {
    background: transparent;
  }

  .full {
    display: flex;
    width: 100%;
  }

  .minW {
    min-width: 6rem;
  }
</style>
