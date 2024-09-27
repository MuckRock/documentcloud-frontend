<script lang="ts">
  import ViewerContext from "../../src/lib/components/viewer/ViewerContext.svelte";
  import { document } from "../../src/test/fixtures/documents";
</script>

<ViewerContext {document}>
  <slot />
</ViewerContext>
