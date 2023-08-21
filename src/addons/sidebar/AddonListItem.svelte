<script lang="ts">
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import Pin from "../../common/icons/Pin.svelte";
  import ListItem from "./ListItem.svelte";

  export let addon: AddOnListItem;

  $: href = `#add-ons/${addon.repository}`;
  $: label = addon.name;
</script>

<style>
  .icon {
    fill: var(--highlight-orange);
  }
</style>

<ListItem {href} {label}>
  <div slot="icon" class="icon"><Pin title={label} /></div>
</ListItem>
