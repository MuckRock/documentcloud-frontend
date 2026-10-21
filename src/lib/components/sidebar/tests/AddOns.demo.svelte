<script lang="ts">
  import { untrack } from "svelte";

  import AddOns from "../AddOns.svelte";
  import { initDocumentQueryState } from "$lib/state/query.svelte";

  interface Props {
    documentQuery?: string;
  }

  let { documentQuery = "" }: Props = $props();

  const documentQueryState = initDocumentQueryState();
  documentQueryState.query = untrack(() => documentQuery);
</script>

<AddOns />
