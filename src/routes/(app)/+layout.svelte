<script lang="ts">
  import type { Maybe, Org, User } from "$lib/api/types";

  import { setContext, onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  import AppLayout from "$lib/components/layouts/AppLayout.svelte";

  // don't destructure props to preserve reactivity
  let props = $props();

  const me: Writable<Maybe<User>> = writable(props.data.me);
  const org: Writable<Maybe<Org>> = writable(props.data.org);
  const user_orgs: Writable<Promise<Org[]>> = writable(props.data.user_orgs);
  const org_users: Writable<Promise<User[]>> = writable(props.data.org_users);

  // update context so other components can access and update
  setContext("me", me);
  setContext("org", org);
  setContext("user_orgs", user_orgs);
  setContext("org_users", org_users);
  setContext("tipOfDay", props.data.tipOfDay);

  // set the $me and $org store whenever we load user data
  $effect(() => {
    me.set(props.data.me);
    org.set(props.data.org);
    user_orgs.set(props.data.user_orgs);
    org_users.set(props.data.org_users);
  });

  onMount(async () => {
    if (props.data.me) {
      const { init } = await import("@plausible-analytics/tracker");
      init({
        domain: "documentcloud.org",
        autoCapturePageviews: true,
      });
    }
  });
</script>

<AppLayout>
  {@render props.children?.()}
</AppLayout>
