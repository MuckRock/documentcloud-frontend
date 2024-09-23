<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
</script>

<div class="container">
  {#if $$slots.navigation}
    <Sidebar position="left" id="navigation">
      <slot name="navigation" />
    </Sidebar>
  {/if}

  <div class="content" id="content">
    <slot name="content" />
  </div>

  {#if $$slots.action}
    <Sidebar position="right" id="action">
      <slot name="action" />
    </Sidebar>
  {/if}
</div>

<style>
  .container {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .content {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    max-height: 100%;
    max-width: 100%;
    overflow-y: auto;
  }

  .content {
    padding: 0;
  }
</style>
