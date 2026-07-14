<script lang="ts">
  import type { Snippet } from "svelte";
  import Sidebar from "./Sidebar.svelte";

  interface Props {
    hideNavigation?: boolean;
    hideActions?: boolean;
    navigation?: Snippet;
    content?: Snippet;
    action?: Snippet;
  }

  let {
    hideNavigation = false,
    hideActions = false,
    navigation,
    content,
    action,
  }: Props = $props();
</script>

<div class="sidebarLayoutContainer">
  {#if navigation && !hideNavigation}
    <Sidebar position="left" id="navigation">
      {@render navigation?.()}
    </Sidebar>
  {/if}

  <div class="content" id="content">
    {@render content?.()}
  </div>

  {#if action && !hideActions}
    <Sidebar position="right" id="action">
      {@render action?.()}
    </Sidebar>
  {/if}
</div>

<style>
  .sidebarLayoutContainer {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    min-width: 0;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    height: 100%;
    max-height: 100%;
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
