<script lang="ts">
  import type { Writable } from "svelte/store";

  import { browser } from "$app/environment";
  import { afterNavigate } from "$app/navigation";

  import Plausible from "plausible-tracker";
  import { getContext, onMount } from "svelte";

  import { getCurrentUser } from "$lib/utils/permissions";

  let plausible;
  const user = getCurrentUser();
  const embed: Writable<boolean> = getContext("embed");

  onMount(() => {
    plausible = Plausible();
  });

  afterNavigate(() => {
    if (!embed && user && browser) {
      plausible.trackPageview();
    }
  });
</script>

<slot />
