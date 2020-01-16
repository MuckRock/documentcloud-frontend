<script>
  // Components
  import Page from "./Page";
  import VirtualList from "@/common/VirtualList";

  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl, textUrl } from "@/api/viewer";
  import { onMount } from "svelte";

  let start;
  let end;
  let jumpTo;
</script>

{#if $viewer.loaded}
  <p>Viewer {$viewer.id}</p>
  <p>Loaded {$viewer.loaded}</p>
  <p>Loaded {$viewer.pageAspects}</p>
  <div>Page {start}</div>
  <button on:click={() => jumpTo(start + 1)}>Next page</button>
  <VirtualList
    items={[...Array($viewer.document.pageCount).keys()]}
    let:item
    bind:start
    bind:end
    bind:jumpTo>
    <Page
      document={$viewer.document}
      pageNumber={item}
      aspect={$viewer.pageAspects[item]} />
  </VirtualList>
{/if}
