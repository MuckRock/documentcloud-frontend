<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchLink from "../SearchLink.svelte";

  export const meta = {
    title: "App / Search / Search Link",
    component: SearchLink,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="default">
  <SearchLink link="/" />
</Story>
