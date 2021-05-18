<script>
  import Image from "@/common/Image";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
  import { modification } from "@/viewer/modification/modification";
  import { onMount } from "svelte";
  import { getDocument } from "@/api/document";

  export let id;
  export let page;
  export let descriptor;
  export let size;
  export let maxThumb;

  $: maxThumbWidth = maxThumb[0];
  $: maxThumbHeight = maxThumb[1];
  $: orientation = descriptor.toOrientation();
  $: document =
    id == null
      ? $viewer.document
      : $viewer.document != null && id == $viewer.document.id
      ? $viewer.document
      : $modification.documentCache[id];

  const DEFAULT_PAGE_SIZE = 1;
  $: pageSize =
    document == null
      ? DEFAULT_PAGE_SIZE
      : document.pageSizes == null
      ? DEFAULT_PAGE_SIZE
      : document.pageSizes[page] == null
      ? DEFAULT_PAGE_SIZE
      : document.pageSizes[page];

  $: {
    if ($viewer.document != null && id != $viewer.document.id) {
      if ($modification.documentCache[id] == null) {
        modification.documentCache[id] = {};
        // Update the document cache
        getDocument(id, null).then((doc) => {
          modification.documentCache[doc.id] = doc;
          modification.documentCache = modification.documentCache;
        });
      }
    }
  }
</script>

<Image
  blank={document == null || document.id == null}
  src={document == null || document.id == null
    ? null
    : pageImageUrl(document, parseInt(page), size)}
  delay={50}
  width={orientation % 2 == 0
    ? maxThumbWidth
    : Math.min(maxThumbWidth / pageSize, maxThumbHeight)}
  height={orientation % 2 == 0
    ? Math.min(maxThumbWidth * pageSize, maxThumbHeight)
    : maxThumbWidth}
/>
