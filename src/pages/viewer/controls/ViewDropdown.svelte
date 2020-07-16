<script>
  import { layout } from "@/viewer/layout";
  import { doc } from "@/viewer/document";
</script>

<select bind:value={$doc.mode}>
  <option value="image">Document</option>
  <option value="text">Plain Text</option>
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>
