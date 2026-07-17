<script lang="ts">
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import { document } from "@/test/fixtures/documents";
  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

<ViewerContext {document}>
  {@render children?.()}
</ViewerContext>
