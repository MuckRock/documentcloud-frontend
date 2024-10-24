<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Org } from "@/api/types";
  import { organization } from "@/test/fixtures/accounts";
  const orgStore: Writable<Org> = writable(null);
  $: orgStore.set(organization as Org);
  setContext("org", orgStore);
</script>

<slot />
