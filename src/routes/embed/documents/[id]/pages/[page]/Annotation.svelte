<script lang="ts">
  import DomPurify from "dompurify";
  import { onMount } from "svelte";

  import { APP_URL } from "@/config/config.js";

  export let note;
  export let slugId;
  export let page;

  $: noteUrl = `${APP_URL}documents/${slugId}/#document/p${page}/a${note.id}`;
  $: leftRightStyle = rightMount
    ? `right:${(1 - note.x2) * 100}%`
    : `left:${note.x1 * 100}%`;
  $: topDownStyle = bottomMount
    ? `bottom:${(1 - note.y1) * 100}%`
    : `top:${note.y2 * 100}%`;

  function nearestParent(elem, className) {
    if (elem.className.indexOf(className) != -1) return elem;
    return nearestParent(elem.parentElement, className);
  }

  const PADDING = 10;

  let annotationElem;
  let rightMount = false;
  let bottomMount = false;

  onMount(() => {
    const container = nearestParent(annotationElem, "dc-embed-container");

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
    {@html DomPurify.sanitize(note.content)}
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
