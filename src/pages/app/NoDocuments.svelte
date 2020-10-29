<script>
  import { search } from "@/search/search";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";

  // SVG assets
  import documentSilhouetteSvg from "@/assets/document_silhouette.svg";
  import emptyResultsSvg from "@/assets/empty_results.svg";
</script>

<style lang="scss">
  .container {
    margin: 1em 1.5em;
    background: $fyi;
    padding: 1em;
    border-radius: 10px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 1.5em 0;
    padding-left: 18px;
  }

  .img,
  .text {
    display: inline-block;
    vertical-align: top;
  }

  .text {
    max-width: 80ch;
    width: 30vw;
    margin: 0 2em 1em 2em;
  }

  p {
    font-size: 15px;
    line-height: 22px;
    margin: 1 1em;
  }
</style>

<div class="container">
  {#if $orgsAndUsers.me == null || $search.params.oneUserSearch != $orgsAndUsers.me.id}
    <h2>No search results</h2>
    <div class="img">
      {@html emptyResultsSvg}
    </div>
    <div class="text">
      <p>
        Your search query returned no results. Try again with a broader search
        query.
      </p>
    </div>
  {:else}
    <h2>Upload your first document</h2>
    <div class="img">
      {@html documentSilhouetteSvg}
    </div>
    <div class="text">
      <p>
        Upload a document file to get started using DocumentCloud. You can drag
        the file into this window, or click on the blue “Upload” button above.
      </p>
      <p>
        Once you upload a file, DocumentCloud will process the document and
        extract its contents. It may take a few minutes for this to complete,
        but once it’s done your document will be optimized for analysis and
        sharing on the web.
      </p>
    </div>
  {/if}
</div>
