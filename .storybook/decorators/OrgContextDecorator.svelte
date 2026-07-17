<script lang="ts">
  import type { Maybe, Org } from "$lib/api/types";
  import { type Snippet, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";
  import { organization } from "@/test/fixtures/accounts";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
  const orgStore: Writable<Maybe<Org>> = writable(organization);
  setContext("org", orgStore);
</script>

{@render children?.()}
