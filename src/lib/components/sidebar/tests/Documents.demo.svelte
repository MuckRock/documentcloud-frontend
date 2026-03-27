<script lang="ts">
  import type { Org, User } from "$lib/api/types";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import Documents from "../Documents.svelte";

  interface Props {
    user?: User | null;
    org?: Org | null;
  }

  const props: Props = $props();

  setContext("me", writable(props.user));
  setContext("org", writable(props.org));
</script>

<Documents />
