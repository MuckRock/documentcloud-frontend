<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pageImageUrl, canonicalUrl } from "$lib/api/documents.js";
  import { pageSizesFromSpec } from "@/api/pageSize";

  export let document: Document;

  const width = IMAGE_WIDTHS_MAP.get("thumbnail");

  $: sizes = pageSizesFromSpec(document.page_spec);
  $: aspect = sizes[0];
  $: height = width * aspect;
</script>

<!--
@component
This is a list item showing one document. 
It's deliberately minimal and can be wrapped in other components to add additional functionality.
-->
<div class="document-list-item">
  <div class="thumbnail">
    <a href={canonicalUrl(document).toString()}>
      <img
        src={pageImageUrl(document, 1, "thumbnail").toString()}
        alt="Page 1, {document.title}"
        width="{width}px"
        height="{height}px"
      />
    </a>
  </div>
  <div class="info">
    <h4>{document.title}</h4>
    {#if document.description}
      <p class="description">
        {document.description}
      </p>
    {/if}
    <a href={canonicalUrl(document).toString()} class="open">Open</a>
  </div>
</div>

<style>
  .document-list-item {
    display: flex;
    width: 23.9375rem;
    padding: 0rem 1.25rem;
    align-items: center;
    gap: 0.625rem;
  }

  .thumbnail {
    border-radius: 0.125rem;
    border: 1px solid #cbcbcb;
    background: #fff;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .info {
    display: flex;
    padding: 1.25rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  h4 {
    color: #000;
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  .description {
    overflow: hidden;
    color: #000;
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  .open {
    overflow: hidden;
    color: var(--primary, #4294f0);
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
</style>
