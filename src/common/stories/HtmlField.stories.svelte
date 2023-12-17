<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import HtmlField from "../HtmlField.svelte";

  export const meta = {
    title: "Common / HTML Field",
    component: HtmlField,
  };
</script>

<!-- this will not render without mocking the router -->
<Story name="default">
  <HtmlField />
</Story>
