<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import KV from "../KV.svelte";

  export const meta = {
    title: "Components / Common / KV",
    component: KV,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <KV
    key="Project"
    value="Old Computer Project"
    href="/projects/old-computer-project/"
  />
</Story>

<Story name="tag">
  <KV
    key="Project"
    value="Old Computer Project"
    href="/projects/old-computer-project/"
    tag
  />
</Story>

<Story name="no link">
  <KV key="Project" value="Old Computer Project" />
</Story>
