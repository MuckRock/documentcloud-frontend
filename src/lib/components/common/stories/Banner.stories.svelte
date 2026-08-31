<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "storybook/actions";
  import { ShieldLock24, Organization24, Info24 } from "svelte-octicons";

  import Banner from "../Banner.svelte";
  import Flex from "../Flex.svelte";
  import Button from "../Button.svelte";

  const { Story } = defineMeta({
    title: "Common / Banner",
    component: Banner,
    parameters: { layout: "padded" },
  });

  const fix = () => action("fix")();
</script>

<Story name="With action" asChild>
  <Banner mode="danger" message="This document is private.">
    {#snippet icon()}<ShieldLock24 />{/snippet}
    {#snippet action()}
      <Button onclick={fix}>Make public</Button>
    {/snippet}
  </Banner>
</Story>

<Story name="Without action" asChild>
  <Banner
    mode="premium"
    message="This note is only visible to people who can edit this document."
  >
    {#snippet icon()}<Organization24 />{/snippet}
  </Banner>
</Story>

<Story name="Modes" asChild>
  <Flex direction="column" gap={2}>
    <Banner mode="normal" message="A neutral, informational message.">
      {#snippet icon()}<Info24 />{/snippet}
    </Banner>
    <Banner
      mode="premium"
      message="This project is only visible within your organization."
    >
      {#snippet icon()}<Organization24 />{/snippet}
    </Banner>
    <Banner mode="danger" message="This project is private.">
      {#snippet icon()}<ShieldLock24 />{/snippet}
    </Banner>
  </Flex>
</Story>
