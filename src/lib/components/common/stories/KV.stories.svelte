<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import KV from "../KV.svelte";

  export const meta = {
    title: "Common / KV",
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

<Story name="Long Value">
  <div class="constrain-width">
    <KV
      key="id"
      value="f2a6eaad9a6ebf4753bacd1e9731f29d67c2b84b7098165d2ae9cb83797c52452d66f8d6c342fd29a4229c31b7cd55ad91324be9f897fe5a4b858055d2f0ec65"
    />
  </div>
</Story>

<style>
  .constrain-width {
    max-width: 20rem;
  }
</style>
