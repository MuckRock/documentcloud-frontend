<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ThumbnailBody from "../ThumbnailBody.svelte";

  export const meta = {
    title: "Viewer / Thumbnail Body",
    component: ThumbnailBody,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <ThumbnailBody />
</Story>
