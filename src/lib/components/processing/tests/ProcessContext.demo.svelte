<script lang="ts">
  import type { User } from "$lib/api/types";
  import { setContext, untrack } from "svelte";
  import { writable } from "svelte/store";

  import ProcessContext from "../ProcessContext.svelte";

  interface Props {
    user?: User | null;
  }

  const props: Props = $props();

  untrack(() => {
    setContext("me", writable(props.user));
  });
</script>

<ProcessContext />
