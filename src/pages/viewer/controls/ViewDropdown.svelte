<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import { layout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { doc, changeMode } from "@/viewer/document";

  onMount(() => {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
  });

  async function handleInput(e) {
    const mode = e.target.value;
    await changeMode(mode);

    if (typeof window !== "undefined" && window.plausible) {
      plausible("viewer-view-switch", { props: { mode } });
    }
  }
</script>

<select on:input={handleInput} bind:value={$doc.mode}>
  <option value="image">{$_("viewDropdown.document")}</option>
  {#if !$layout.hideTextOption}<option value="text"
      >{$_("viewDropdown.plainText")}</option
    >{/if}
  <option value="thumbnail">{$_("viewDropdown.thumbnail")}</option>
  {#if $viewer.notes != null && $viewer.notes.length > 0}
    <option value="notes">{$_("viewDropdown.notes")}</option>
  {/if}
  <option value="search" hidden={$layout.searchPages == null}>
    {$_("viewDropdown.search")}
  </option>
</select>
