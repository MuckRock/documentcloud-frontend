<script lang="ts">
  import type { AddOnListItem } from "../../../../addons/types";

  import Pin from "../../../../common/icons/Pin.svelte";
  import ListItem from "../ListItem.svelte";

  export let addon: AddOnListItem;

  $: href = `#add-ons/${addon.repository}`;
  $: label = addon.name;
</script>

<a {href}>
  <ListItem {label}>
    <div slot="icon" class="icon"><Pin title={label} /></div>
  </ListItem>
</a>

<style>
  .icon {
    fill: var(--highlight-orange);
  }
</style>
