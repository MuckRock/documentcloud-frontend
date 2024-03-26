<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { Tag16 } from "svelte-octicons";

  import Metadata from "../Metadata.svelte";

  export const meta = {
    title: "Components / Common / Metadata",
    component: Metadata,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <Metadata key="Last Updated" value="March 21, 2024" />
</Story>

<Story name="icon">
  <Metadata key="Last Updated" value="March 21, 2024">
    <Tag16 slot="icon" />
  </Metadata>
</Story>
