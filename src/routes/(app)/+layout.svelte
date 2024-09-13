<script lang="ts">
  import type { LayoutData } from "./$types";
  import type { Org, User } from "@/api/types/orgAndUser";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import AppLayout from "@/lib/components/layouts/AppLayout.svelte";

  export let data: LayoutData;

  const me: Writable<User> = writable(data.me);
  const org: Writable<Org> = writable(data.org);
  const user_orgs: Writable<Promise<Org[]>> = writable(data.user_orgs);
  const org_users: Writable<Promise<User[]>> = writable(data.org_users);

  // set the $me and $org store whenever we load user data
  $: me.set(data.me);
  $: org.set(data.org);

  $: user_orgs.set(data.user_orgs);
  $: org_users.set(data.org_users);

  // update context so other components can access and update
  setContext("me", me);
  setContext("org", org);
  setContext("user_orgs", user_orgs);
  setContext("org_users", org_users);
  setContext("tipOfDay", data.tipOfDay);
</script>

<AppLayout>
  <slot />
</AppLayout>
