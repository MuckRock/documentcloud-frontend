<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Tip from "../Tip.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Premium from "@/common/icons/Premium.svelte";
  import { Info24, Alert24 } from "svelte-octicons";
  import Flex from "../Flex.svelte";

  export const meta = {
    title: "Components / Common / Tip",
    component: Tip,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    mode: "normal",
  };
</script>

<Story name="Basic" let:args>
  <Tip {...args}>All dogs go to heaven</Tip>
</Story>

<Story name="With Icon" let:args>
  <Tip {...args}>
    <Pin slot="icon" />
    Pinned items will appear here.
  </Tip>
</Story>

<Story name="Modes" let:args>
  <Flex direction="column" gap={2}>
    <Tip {...args} mode="normal">This is a helpful tip.</Tip>
    <Tip {...args} mode="primary">
      <Info24 slot="icon" />
      I am important!
    </Tip>
    <Tip {...args} mode="premium">
      <Premium size={1.75} slot="icon" />
      This feature is for premium users.
    </Tip>
    <Tip {...args} mode="danger">
      <Alert24 slot="icon" />
      Watch out ahead!
    </Tip>
  </Flex>
</Story>

<Story name="With Large Icon" let:args>
  <Tip
    {...args}
    --color="var(--blue-5)"
    --fill="var(--blue-4)"
    --background-color="var(--blue-1)"
    --border-color="var(--blue-3)"
  >
    <Info16 height="32" width="32" slot="icon" />
    Learn about all the interesting facts
  </Tip>
</Story>
