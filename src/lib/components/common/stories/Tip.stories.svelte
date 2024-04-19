<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Tip from "../Tip.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Premium from "@/common/icons/Premium.svelte";
  import { Info16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Common / Tip",
    component: Tip,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="Basic">
  <Tip>All dogs go to heaven</Tip>
</Story>

<Story name="With Icon">
  <Tip>
    <Pin slot="icon" />
    Pinned items will appear here.
  </Tip>
</Story>

<Story name="With Colors">
  <Tip
    --fill="var(--green-dark)"
    --background-color="var(--green-light)"
    --border-color="var(--green)"
  >
    <Premium slot="icon" />
    This feature is for premium users.
  </Tip>
</Story>

<Story name="With Large Icon">
  <Tip
    --color="var(--blue-5)"
    --fill="var(--blue-4)"
    --background-color="var(--blue-1)"
    --border-color="var(--blue-3)"
  >
    <Info16 height="32" width="32" slot="icon" />
    Learn about all the interesting facts
  </Tip>
</Story>
