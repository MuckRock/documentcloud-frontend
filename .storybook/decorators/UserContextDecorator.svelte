<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { User } from "@/api/types";
  import { me } from "@/api/fixtures/orgAndUser.fixtures";
  const userStore: Writable<User> = writable(null);
  $: userStore.set(me as User);
  setContext("me", userStore);
</script>

<slot />
