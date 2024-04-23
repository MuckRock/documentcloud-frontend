<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import NoDocuments from "../NoDocuments.svelte";

  export const meta = {
    title: "App / Documents / No Documents",
    component: NoDocuments,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <NoDocuments />
</Story>
