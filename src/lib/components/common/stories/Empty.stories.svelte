<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Search24 } from "svelte-octicons";
  import Empty from "../Empty.svelte";

  const { Story } = defineMeta({
    title: "Common / Empty",
    component: Empty,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Text Only">
  <Empty>Nothing to see here!</Empty>
</Story>

<Story name="Text and Icon">
  <Empty icon={Search24}>No results found for search "FYSA"</Empty>
</Story>
