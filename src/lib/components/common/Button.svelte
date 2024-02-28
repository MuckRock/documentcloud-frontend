<script lang="ts">
  export let href: string = null;
  export let mode: "standard" | "primary" | "ghost" = "standard";

  export let disabled = false;

  export let title: string = "";
  export let type: "submit" | "reset" | "button" = "button";
  export let label = "Submit";
</script>

{#if href}
  <a {href} {title} on:click class={mode}>
    <slot>{label}</slot>
  </a>
{:else}
  <button {title} on:click class={mode} {disabled} {type}>
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

    color: var(--gray-1, #f5f6f7);
    fill: var(--gray-1, #f5f6f7);
    text-align: center;
    font-family: var(--font-sans, "Source Sans Pro");
    font-size: var(--font-m, 1rem);
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

  .ghost {
    background: none;
    border: none;
    box-shadow: none;
    color: var(--primary, #4294f0);
    fill: var(--primary, #4294f0);
  }

  .ghost:hover {
    background: var(--blue-1, #eef3f9);
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
</style>
