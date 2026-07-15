<!-- @component
Generic test harness: renders any child component inside the real
ViewerContext provider, forwarding context props (document, mode, zoom, …).

Used via the `renderInViewer` helper. Because it delegates to ViewerContext
itself, tests go through the viewer's public prop API and don't reproduce its
internal context wiring — so they survive the stores -> ViewerState migration.
-->
<script lang="ts">
  import type { Component, ComponentProps } from "svelte";

  import ViewerContext from "../ViewerContext.svelte";

  interface Props {
    child: Component<any>;
    childProps?: Record<string, unknown>;
    // forwarded to ViewerContext (document, mode, zoom, …)
    context: ComponentProps<typeof ViewerContext>;
  }

  const { child: Child, childProps = {}, context }: Props = $props();
</script>

<ViewerContext {...context}>
  <Child {...childProps} />
</ViewerContext>
