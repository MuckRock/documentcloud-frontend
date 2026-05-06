<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Info24, Alert24 } from "svelte-octicons";

  import Tip from "../Tip.svelte";
  import Pin from "$lib/components/icons/Pin.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
  import Flex from "../Flex.svelte";

  const { Story } = defineMeta({
    title: "Common / Tip",
    component: Tip,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Basic" asChild>
  <Tip>All dogs go to heaven</Tip>
</Story>

<Story name="With Icon" asChild>
  <Tip>
    {#snippet icon()}
      <Pin size={1.5} />
    {/snippet}
    Pinned items will appear here.
  </Tip>
</Story>

<Story name="Modes" asChild>
  <Flex direction="column" gap={2}>
    <Tip mode="normal">This is a helpful tip.</Tip>
    <Tip mode="primary">
      {#snippet icon()}<Info24 />{/snippet}
      I am important!
    </Tip>
    <Tip mode="premium">
      {#snippet icon()}<Premium />{/snippet}
      This feature is for premium users.
    </Tip>
    <Tip mode="danger">
      {#snippet icon()}<Alert24 />{/snippet}
      Watch out ahead!
    </Tip>
    <Tip mode="error">
      {#snippet icon()}<Alert24 />{/snippet}
      Something went wrong!
    </Tip>
  </Flex>
</Story>

<Story name="Custom Styles" asChild>
  <Tip
    --color="var(--blue-5)"
    --fill="var(--blue-4)"
    --background-color="var(--blue-1)"
    --border-color="var(--blue-3)"
  >
    {#snippet icon()}<Info24 />{/snippet}
    Learn about all the interesting facts
  </Tip>
</Story>
