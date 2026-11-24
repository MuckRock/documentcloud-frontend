<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
  } from "@floating-ui/dom";
  import { fade } from "svelte/transition";
  import { Comment16, EyeClosed16 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { redactions } from "$lib/components/viewer/RedactionLayer.svelte";
  import { getTextRects, type Rect } from "$lib/utils/selection";
  import { goto } from "$app/navigation";
  import { getViewerHref } from "$lib/utils/viewer";

  interface Props {
    selection: Range;
    page_number: number;
    pageRef: HTMLElement;
  }

  let { selection, page_number, pageRef }: Props = $props();

  const viewer = getViewerState();

  let toolbar = $state<HTMLDivElement>();
  let coords = $state<{ x: number; y: number }>();

  let document = $derived(viewer.document!);

  $effect(() => {
    if (!toolbar) return;

    return autoUpdate(selection, toolbar, async () => {
      if (!toolbar) return;
      const { x, y } = await computePosition(selection, toolbar, {
        placement: "top",
        middleware: [offset(8), shift({ padding: 8 }), flip({ padding: 40 })],
      });

      coords = { x, y };
    });
  });

  function clearSelection() {
    window.getSelection()?.removeAllRanges();
  }

  function getBounds({ left, right, top, bottom }: Rect) {
    const r = pageRef.getBoundingClientRect();

    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const x1 = clamp((left - r.left) / r.width);
    const x2 = clamp((right - r.left) / r.width);
    const y1 = clamp((top - r.top) / r.height);
    const y2 = clamp((bottom - r.top) / r.height);

    return { x1, x2, y1, y2 };
  }

  function addAnnotation() {
    goto(getViewerHref({ document, mode: "annotating" }));

    const rect = selection.getBoundingClientRect();
    viewer.newNote = {
      ...getBounds(rect),
      page_number,
      title: "",
      content: "",
      access: "private",
    };

    clearSelection();
  }

  function addRedactions() {
    goto(getViewerHref({ document, mode: "redacting" }));

    const rects = getTextRects(selection);
    const newRedactions = rects.map((r) => ({ ...getBounds(r), page_number }));

    $redactions = [...$redactions, ...newRedactions];

    clearSelection();
  }
</script>

<div
  class="toolbar"
  bind:this={toolbar}
  style:--left="{coords?.x}px"
  style:--top="{coords?.y}px"
  in:fade={{ delay: 200, duration: 100 }}
>
  <Action icon={Comment16} onclick={addAnnotation}>
    {$_("mode.annotating")}
  </Action>

  <Action icon={EyeClosed16} onclick={addRedactions}>
    {$_("mode.redacting")}
  </Action>
</div>

<style>
  .toolbar {
    position: absolute;
    left: var(--left);
    top: var(--top);
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
    background-color: var(--white);
    box-shadow: var(--shadow-1);
    border: 1px solid var(--gray-2);
    border-radius: 0.75rem;
    padding: 0.25rem;
  }
</style>
