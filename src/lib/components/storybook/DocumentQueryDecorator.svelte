<!-- @component
Provides the document query context that the app layout sets for every page.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { initDocumentQueryState } from "$lib/state/query.svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  initDocumentQueryState();
</script>

{@render children()}
