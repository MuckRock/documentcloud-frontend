<!-- @component
  The GuidedTour will run on different routes, introducing that page's
  UI to new users. We keep track of which tours the user has already
  taken in a LocalStorage object. If a script exists for the current route,
  and if the user hasn't already taken it, we'll prompt them to take the guided tour.
 -->
<script lang="ts" context="module">
  import type { Maybe } from "$lib/api/types";

  import "driver.js/dist/driver.css";

  import { page } from "$app/stores";

  import { driver, type Driver, type DriveStep, type Config } from "driver.js";
  import { get } from "svelte/store";

  import { StorageManager } from "$lib/utils/storage";
  import { scripts } from "./scripts";

  const storage = new StorageManager("guided-tour");

  let driverObj: Driver;

  const driverConfig: Config = {
    showProgress: true,
    popoverClass: "dc-driver",
    overlayColor: "rgba(92, 113, 124, 0.5)",
  };

  type Tours = Record<string, boolean>;

  export function getRoute(): Maybe<string> {
    return get(page)?.route?.id;
  }

  export function getScript(route?: string): Maybe<DriveStep[]> {
    const currentRoute = route ?? getRoute();
    return scripts[currentRoute];
  }

  export function getTourHistory(): Tours {
    return storage.get<Tours, {}>("tours", {});
  }

  export function startTour(): void {
    driverObj?.drive();
  }

  export function endTour(): void {
    const route = getRoute();
    const history = getTourHistory();
    storage.set("tours", { ...history, [route]: false });
    driverObj.destroy();
  }

  export function isTourAvailable(route?: string): boolean {
    return Boolean(getScript(route));
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    // do we have a tour?
    const steps = getScript();
    if (steps) {
      driverObj = driver({
        ...driverConfig,
        steps,
        onDestroyStarted: endTour,
      });
      // should we start the tour?
      const currentRoute = getRoute();
      const history = getTourHistory();
      const offerTour = history[currentRoute] ?? true;
      if (offerTour) {
        startTour();
      }
    }
  });
</script>

<slot />

<style>
  :global(
      .driver-popover,
      .driver-popover-title,
      .driver-popover-description,
      .driver-popover-progress-text,
      .driver-popover-footer button
    ) {
    font-family: var(--font-sans);
  }
  :global(.driver-popover-title) {
    font-weight: var(--font-semibold);
    line-height: 1.2;
    font-size: var(--font-lg);
    color: var(--gray-5);
  }
  :global(.driver-popover-description) {
    font-size: var(--font-sm);
    line-height: 1.4;
    color: var(--gray-5);
  }
  :global(.driver-popover-progress-text) {
    color: var(--gray-4);
  }
  :global(.driver-popover-footer button) {
    font-weight: var(--font-semibold);
  }
  :global(button.driver-popover-next-btn) {
    border-color: var(--blue-4);
    background-color: var(--blue-3);
    color: var(--white);
    text-shadow: none;
  }
  :global(button.driver-popover-next-btn:hover) {
    background-color: var(--blue-4);
    color: var(--white);
    text-shadow: none;
  }
</style>
