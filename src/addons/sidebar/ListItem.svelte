<script lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import Pin from "../../common/Pin.svelte";

  export let addon: AddOnListItem;

  $: url = `#add-ons/${addon.repository}`;
</script>

<style>
  .addon {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }

  h4 {
    margin: 0em auto 1em 0.5em;
  }
</style>

<div class="addon">
  <a href={url}><Pin active={addon.active} /></a>
  <h4>
    <a href={url}>{addon.name}</a>
  </h4>
</div>
