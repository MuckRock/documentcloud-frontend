<script lang="ts">
  import { _ } from "svelte-i18n";
  import Toaster from "./Toaster.svelte";
  import Navigation from "./Navigation.svelte";
</script>

<div class="container">
  <Navigation />
  <div class="inner">
    <slot />
  </div>
  <Toaster />
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    gap: 0;
    flex-shrink: 0;
    background: var(--white);
  }
  .inner {
    flex: 1 1 0;
    overflow: auto;
  }
</style>
