<script lang="ts">
  import Plausible from "plausible-tracker";

  import { getContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { afterNavigate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { getCurrentUser } from "@/lib/utils/permissions";

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
