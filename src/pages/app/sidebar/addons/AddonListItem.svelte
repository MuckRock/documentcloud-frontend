<script lang="ts">
  import type { AddOnListItem } from "../../../../addons/types.ts";

  import Pin from "../../../../common/icons/Pin.svelte";
  import ListItem from "../ListItem.svelte";

  export let addon: AddOnListItem;

  $: href = `#add-ons/${addon.repository}`;
  $: label = addon.name;
</script>

<ListItem {href} {label}>
  <div slot="icon" class="icon"><Pin title={label} /></div>
</ListItem>

<style>
  .icon {
    fill: var(--highlight-orange);
  }
</style>
