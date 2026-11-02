<script lang="ts">
  import type { AddOn } from "$lib/api/types";

  import { untrack } from "svelte";

  import AddOnListItem from "../AddOnListItem.svelte";
  import { initDocumentQueryState } from "$lib/state/query.svelte";

  interface Props {
    addon: AddOn;
    documentQuery?: string;
  }

  let { addon, documentQuery = "" }: Props = $props();

  const documentQueryState = initDocumentQueryState();
  documentQueryState.query = untrack(() => documentQuery);
</script>

<AddOnListItem {addon} />
