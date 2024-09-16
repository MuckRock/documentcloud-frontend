<script lang="ts">
  import Plausible from "plausible-tracker";

  import { getContext, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { afterNavigate } from "$app/navigation";
  import { browser } from "$app/environment";
  import type { User } from "@/lib/api/types";
  import type { Maybe } from "@/api/types/common";

  let plausible;
  const user: Writable<Maybe<User>> = getContext("me");
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
