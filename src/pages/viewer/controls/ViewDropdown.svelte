<script>
  import { layout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { doc, changeMode } from "@/viewer/document";

  async function handleInput(e) {
    const mode = e.target.value;
    await changeMode(mode);
  }
</script>

<select on:input={handleInput} bind:value={$doc.mode}>
  <option value="image">Document</option>
  {#if !$layout.hideTextOption}<option value="text">Plain Text</option>{/if}
  <option value="thumbnail">Thumbnail</option>
  {#if $viewer.notes != null && $viewer.notes.length > 0}
    <option value="notes">Notes</option>
  {/if}
  <option value="search" hidden={$layout.searchPages == null}>
    Search Results
  </option>
</select>
