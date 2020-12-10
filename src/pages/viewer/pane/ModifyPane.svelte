<script>
  import Button from "@/common/Button";
  import { layout } from "@/viewer/layout";
  import { handlePlural } from "@/util/string";
  import { modifyUnselect } from "@/viewer/layout";
</script>

{#if $layout.modifyHasSelection}
  <h3>{handlePlural($layout.modifyNumSelected, 'Page')} Selected</h3>
  <div class="buttonpadded">
    <Button>Copy</Button>
    <Button>Cut</Button>
    <Button>Rotate</Button>
    <Button secondary={true} on:click={modifyUnselect}>Unselect</Button>
    <Button danger={true}>Remove</Button>
  </div>
{:else}
  <h3>Modify Pages</h3>
  <p>
    Select pages below to apply modifications (page rotation, rearranging, and
    deletion). Click in-between pages to insert.
  </p>
{/if}
