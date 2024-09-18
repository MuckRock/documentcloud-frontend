<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
</script>

<main>
  {#if $$slots.navigation}
    <Sidebar position="left" id="navigation">
      <h3 slot="title" class="sr-only">Navigation</h3>
      <slot name="navigation" />
    </Sidebar>
  {/if}

  <article class="content" id="content">
    <slot name="content" />
  </article>

  {#if $$slots.action}
    <Sidebar position="right" id="action">
      <h3 slot="title" class="sr-only">Actions</h3>
      <slot name="action" />
    </Sidebar>
  {/if}
</main>

<style>
  main {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  article {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    max-height: 100%;
    max-width: 100%;
    overflow-y: auto;

    background: var(--gray-1);
    /* margin: 0.875rem 0; */
    border: 1px solid var(--gray-2);
    /* border-radius: var(--radius, 0); */
    box-shadow: inset var(--shadow-2);
  }

  .content {
    padding: 0;
  }

  h3 {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
  }
</style>
