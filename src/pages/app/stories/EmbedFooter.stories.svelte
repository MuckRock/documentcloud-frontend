<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import EmbedFooter from "../EmbedFooter.svelte";

  export const meta = {
    title: "App / Documents / Embed Footer",
    component: EmbedFooter,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <EmbedFooter />
</Story>
