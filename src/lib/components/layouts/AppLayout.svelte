<script lang="ts">
  import Toaster from "./Toaster.svelte";
  import Navigation from "./Navigation.svelte";
  import PlausibleTracker from "../common/PlausibleTracker.svelte";
</script>

<PlausibleTracker>
  <div class="container">
    <Navigation>
      <div class="inner">
        <slot />
      </div>
    </Navigation>
    <Toaster />
  </div>
</PlausibleTracker>

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
    display: flex;
  }
</style>
