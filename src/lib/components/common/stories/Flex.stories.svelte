<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Flex from "../Flex.svelte";

  const { Story } = defineMeta({
    title: "Common / Flex",
    component: Flex,
    tags: ["autodocs"],
  });
</script>

<Story name="default" asChild>
  <Flex>
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
  </Flex>
</Story>

<Story name="column" asChild>
  <Flex direction="column">
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
  </Flex>
</Story>

<Story name="row reverse" asChild>
  <Flex reverse>
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
  </Flex>
</Story>

<Story name="justify between" asChild>
  <Flex justify="between">
    <div>Left</div>
    <div>Right</div>
  </Flex>
</Story>

<Story name="justify center" asChild>
  <Flex justify="center">
    <div>Centered</div>
  </Flex>
</Story>

<Story name="align center" asChild>
  <Flex align="center" style="height: 100px;">
    <div>Short</div>
    <div style="height: 80px;">Tall</div>
    <div>Short</div>
  </Flex>
</Story>

<Story name="wrap" asChild>
  <Flex wrap style="width: 200px;">
    <div>One</div>
    <div>Two</div>
    <div>Three</div>
    <div>Four</div>
    <div>Five</div>
    <div>Six</div>
  </Flex>
</Story>

<Story name="custom gap" asChild>
  <Flex gap={2}>
    <div>Wide</div>
    <div>Gap</div>
    <div>Items</div>
  </Flex>
</Story>
