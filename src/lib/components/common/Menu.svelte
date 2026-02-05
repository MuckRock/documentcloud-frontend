<script lang="ts">
  interface Props {
    small?: boolean;
    children?: import("svelte").Snippet;
  }

  let { small = false, children }: Props = $props();
</script>

<div class="menu" class:small role="menu">
  {#if children}{@render children()}{:else}Define some menu items{/if}
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    background: var(--white, #ffffff);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-1);
    box-shadow: var(--shadow-1);
    padding: 0.25rem;
    gap: 0.25rem;
    min-width: 16rem;
    max-height: var(--max-height, auto);
    overflow-y: auto;
  }
  :global(.menu.small) {
    color: var(--gray-3);
    font-size: var(--font-sm);
    text-transform: uppercase;
    margin: 3px 0 0 0;
  }
</style>
