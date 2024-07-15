<script lang="ts">
  import "@/style/kit.css";

  import type { LayoutData } from "./$types";
  import type { Org, User } from "@/api/types/orgAndUser";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data: LayoutData;

  const me: Writable<User> = writable();
  const org: Writable<Org> = writable();

  // set the $me and $org store whenever we load user data
  $: me.set(data.me);
  $: org.set(data.org);

  // update context so other components can access and update
  setContext("me", me);
  setContext("org", org);
  setContext("embed", data.embed);
</script>

<slot />
