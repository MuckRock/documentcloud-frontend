<script>
  import { layout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { doc } from "@/viewer/document";
</script>

<select bind:value={$doc.mode}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  {#if $viewer.notes != null && $viewer.notes.length > 0}
    <option value="notes">Notes</option>
  {/if}
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>
