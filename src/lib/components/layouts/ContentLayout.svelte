<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    noBgColor?: boolean;
    clientWidth?: number | undefined;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    noBgColor = false,
    clientWidth = $bindable(undefined),
    header,
    children,
    footer,
  }: Props = $props();
</script>

<div class="container" class:noBgColor bind:clientWidth>
  {#if header}
    <header>
      {@render header()}
    </header>
  {/if}
  <main>
    {@render children?.()}
  </main>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</div>

<style>
  .container {
    display: flex;
    padding: 0;
    flex-direction: column;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
    width: 100%;
    height: min-content;
    min-height: 100%;
    background: var(--gray-1);
    box-shadow: inset var(--shadow-2);
  }

  .container.noBgColor {
    background: unset;
    box-shadow: unset;
  }

  header {
    flex: 0 0 0;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: var(--z-toolbar);
    background: var(--white, white);
    box-shadow: var(--shadow-2);
    border-bottom: 1px solid var(--gray-2);
  }

  main {
    flex: 1 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  footer {
    flex: 0 0 0;
    width: 100%;
    position: sticky;
    bottom: 0;
    z-index: var(--z-toolbar);
    border-top: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }

  header:empty,
  footer:empty {
    display: none;
  }
</style>
