<script lang="ts">
  // todo: find a better long-term home for styles
  import "../style/variables.css";
  import "../style/global.css";

  import type { LayoutData } from "./$types";
  import type { User } from "@/api/types/orgAndUser.d.ts";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data: LayoutData;

  const me: Writable<User> = writable(null);

  // set the $me store whenever we load user data
  $: me.set(data.me);

  // update context so other components can access and update
  setContext("me", me);
</script>

<slot />
