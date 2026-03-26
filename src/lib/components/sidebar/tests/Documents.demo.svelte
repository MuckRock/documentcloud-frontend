<script lang="ts">
  import type { Org, User } from "$lib/api/types";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import Documents from "../Documents.svelte";

  interface Props {
    user?: User | null;
    org?: Org | null;
  }

  const { user = null, org = null }: Props = $props();

  setContext("me", writable(user));
  setContext("org", writable(org));
</script>

<Documents />
