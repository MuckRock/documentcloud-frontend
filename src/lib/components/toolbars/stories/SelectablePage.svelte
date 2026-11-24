<!-- @component
Stands in for a PDF page's text layer in SelectionToolbar stories.

Must be a child of a ViewerContext.
-->
<script lang="ts">
  import SelectionToolbar from "../SelectionToolbar.svelte";
  import { selection } from "$lib/utils/selection";

  interface Props {
    text: string;
    /** Text to select on load, so the toolbar shows without interaction. */
    preselect?: string;
    /** Distance from the top of the page to the text, in px. */
    offsetTop?: number;
  }

  let { text, preselect, offsetTop = 160 }: Props = $props();

  let page = $state<HTMLElement>();
  let range = $state<Range | null>(null);

  function selectInitial(el: HTMLElement) {
    const node = el.firstChild;
    const start = preselect ? text.indexOf(preselect) : -1;
    if (!node || start < 0) return;

    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, start + preselect!.length);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(r);
    range = r;
  }
</script>

<div class="page" bind:this={page} style:padding-top="{offsetTop}px">
  <p {@attach selection((r) => (range = r))} {@attach selectInitial}>{text}</p>

  {#if range && page}
    <SelectionToolbar selection={range} page_number={0} pageRef={page} />
  {/if}
</div>

<style>
  .page {
    position: relative;
    width: 612px;
    min-height: 792px;
    margin: 1rem auto;
    padding-inline: 3rem;
    box-sizing: border-box;
    background: var(--white);
    box-shadow: var(--shadow-1);
    line-height: 1.5;
  }
</style>
