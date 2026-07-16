<!-- @component
Test-only stand-in for <Viewer>: reports the shared viewer's `embed` flag so a
test can assert what DocumentEmbed declared on the state.
-->
<script lang="ts">
  import { getViewerState } from "$lib/state/viewer.svelte";

  const viewer = getViewerState();
</script>

<span data-testid="viewer-embed">{String(viewer.embed)}</span>
