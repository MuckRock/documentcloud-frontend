<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { Search24 } from "svelte-octicons";
  import Empty from "../Empty.svelte";

  export const meta = {
    title: "Components / Common / Empty",
    component: Empty,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Text Only">
  <Empty>Nothing to see here!</Empty>
</Story>

<Story name="Text and Icon">
  <Empty icon={Search24}>No results found for search "FYSA"</Empty>
</Story>
