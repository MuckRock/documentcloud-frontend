<!-- @component
Hands the surrounding ViewerState to `onViewer` once, so a test or story can
seed or inspect state the provider owns. Renders `component` (for tests, where
`render` can't pass snippets) or `children`. Must be inside a ViewerContext.
-->
<script lang="ts">
  import type { Component, Snippet } from "svelte";

  import { getViewerState, type ViewerState } from "$lib/state/viewer.svelte";

  interface Props {
    onViewer?: (viewer: ViewerState) => void;
    component?: Component<any>;
    componentProps?: Record<string, unknown>;
    children?: Snippet;
  }

  const {
    onViewer,
    component: Child,
    componentProps = {},
    children,
  }: Props = $props();

  // Once, on init, so re-renders don't repeat a story's seeded edits.
  function report() {
    onViewer?.(getViewerState());
  }
  report();
</script>

{#if Child}
  <Child {...componentProps} />
{:else}
  {@render children?.()}
{/if}
