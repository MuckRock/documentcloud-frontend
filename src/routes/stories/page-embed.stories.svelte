<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import PageEmbed from "../(embed)/documents/[id]/pages/[page]/+page.svelte";

  export const meta = {
    title: "Embed / Page",
    component: PageEmbed,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  };

  const data = {};
</script>

<Story>
  <PageEmbed {data} />
</Story>
