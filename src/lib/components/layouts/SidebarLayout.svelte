<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
</script>

<main>
  {#if $$slots.navigation}
    <Sidebar>
      <slot name="navigation" />
    </Sidebar>
  {/if}

  <article class="content">
    <slot name="content" />
  </article>

  {#if $$slots.action}
    <Sidebar>
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
    overflow-y: auto;
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
</style>
