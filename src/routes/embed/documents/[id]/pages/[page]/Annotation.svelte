<script lang="ts">
  import type { Note as NoteType } from "$lib/api/types";

  import { onMount } from "svelte";

  import { APP_URL } from "@/config/config.js";
  import { clean } from "$lib/utils/markup";

  interface Props {
    note: NoteType;
    slugId: string;
    page: number;
    onclose?: () => void;
  }

  let { note, slugId, page, onclose }: Props = $props();

  function nearestParent(
    elem: HTMLElement,
    className: string,
  ): HTMLElement | null {
    if (elem.className.indexOf(className) !== -1) return elem;
    if (!elem.parentElement) return null;
    return nearestParent(elem.parentElement, className);
  }

  const PADDING = 10;

  let annotationElem = $state<HTMLElement | undefined>();
  let rightMount = $state(false);
  let bottomMount = $state(false);

  onMount(() => {
    if (!annotationElem) return;

    const container = nearestParent(annotationElem, "dc-embed-container");
    if (!container) return;

    if (
      annotationElem.offsetWidth + annotationElem.offsetLeft >
      container.offsetWidth - PADDING
    ) {
      rightMount = true;
    }
    if (
      annotationElem.offsetHeight + annotationElem.offsetTop >
      container.offsetHeight - PADDING
    ) {
      bottomMount = true;
    }
  });
  let noteUrl = $derived(
    `${APP_URL}documents/${slugId}/#document/p${page}/a${note.id}`,
  );
  let leftRightStyle = $derived(
    rightMount ? `right:${(1 - note.x2) * 100}%` : `left:${note.x1 * 100}%`,
  );
  let topDownStyle = $derived(
    bottomMount ? `bottom:${(1 - note.y1) * 100}%` : `top:${note.y2 * 100}%`,
  );
</script>

<div
  class="dc-embed-annotation"
  bind:this={annotationElem}
  style="{leftRightStyle};{topDownStyle}"
>
  <h1>
    <a href={noteUrl} target="_blank">{note.title}</a>
  </h1>
  <div class="content">
    {@html clean(note.content ?? "")}
  </div>
</div>

<style>
  .dc-embed-annotation {
    max-height: 156px;
    position: absolute;
    background-color: #ebebeb;
    overflow-y: auto;
    padding: 8px 16px;
    box-sizing: border-box;
    min-width: 200px;
    max-width: 400px;
    line-height: 1.2;
    font-size: 14px;
  }

  .dc-embed-annotation h1 {
    font-weight: 700;
    margin: 10px 0;
    font-size: 14px;
  }

  .dc-embed-annotation .content {
    margin: 10px 0;
  }

  .dc-embed-annotation a {
    text-decoration: none;
  }

  .dc-embed-annotation a:hover {
    text-decoration: underline;
  }
</style>
