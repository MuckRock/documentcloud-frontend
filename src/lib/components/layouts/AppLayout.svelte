<script lang="ts">
  import Navigation from "./Navigation.svelte";
  import PlausibleTracker from "../common/PlausibleTracker.svelte";
  import ProcessDrawer from "../processing/ProcessDrawer.svelte";
  import Toaster from "./Toaster.svelte";
  import ProcessContext from "../processing/ProcessContext.svelte";
</script>

<PlausibleTracker>
  <ProcessContext>
    <div class="app">
      <Navigation>
        <div class="inner">
          <slot />
        </div>
      </Navigation>
      <Toaster />
      <ProcessDrawer />
    </div>
  </ProcessContext>
</PlausibleTracker>

<style>
  .app {
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

  @supports (height: 100dvh) {
    .app {
      height: 100dvh;
    }
  }

  @supports (width: 100dvw) {
    .app {
      width: 100dvw;
    }
  }
</style>
