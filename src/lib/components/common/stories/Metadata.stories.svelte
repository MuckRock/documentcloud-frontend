<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Tag16 } from "svelte-octicons";

  import Metadata from "../Metadata.svelte";

  const { Story } = defineMeta({
    title: "Common / Metadata",
    component: Metadata,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" asChild>
  <Metadata key="Last Updated">March 21, 2024</Metadata>
</Story>

<Story name="icon" asChild>
  <Metadata key="Last Updated">
    March 21, 2024
    <Tag16 slot="icon" />
  </Metadata>
</Story>
