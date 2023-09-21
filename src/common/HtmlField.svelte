<script>
  import { domPurify, loadDompurify } from "@/util/domPurify.js";
  import { router } from "@/router/router.js";
  import { showAnnotation } from "@/viewer/document.js";
  import { viewer } from "@/viewer/viewer.js";
  loadDompurify();

  import { onMount } from "svelte";

  let elem = null;
  export let content = "";

  onMount(() => {
    window.domPurify = $domPurify;
  });

  $: {
    // Add onclick listeners to navigate to each same-document note link
    if (
      elem != null &&
      $domPurify.domPurify != null &&
      $viewer.document != null &&
      $viewer.notes != null &&
      $viewer.notes.length > 0
    ) {
      const route = router.resolvedRoute;
      if (route != null && route.name == "viewer") {
        // Only inject on viewer routes
        const links = elem.querySelectorAll("a");
        for (let i = 0; i < links.length; i++) {
          // Iterate all links
          const link = links[i];
          if (link.href != null) {
            for (let j = 0; j < viewer.notes.length; j++) {
              // Iterate all document notes
              const note = viewer.notes[j];
              if (link.href == viewer.document.noteUrl(note)) {
                // If the note URL and href align, wire the event listener
                link.onclick = () => showAnnotation(note, true);
              }
            }
          }
        }
      }
    }
  }
</script>

<style lang="scss">
  $subpadding: 8px;

  .preview {
    margin: 4px 0;

    .content {
      margin: 4px $subpadding;
      font: 13px/18px Georgia, Times, serif;
      cursor: text;
      color: #3c3c3c;
      max-height: 300px;
      word-wrap: break-word;
      overflow-y: auto;

      :global(a) {
        color: $primary;
      }
    }

    &.static .content {
      margin: 0 0 $subpadding 0;
    }
  }
</style>

<div class="preview static">
  <div class="content" bind:this={elem}>
    {#if $domPurify.domPurify !== null && typeof $domPurify.domPurify.sanitize === "function"}
      {@html $domPurify.domPurify.sanitize(content)}
    {/if}
  </div>
</div>
