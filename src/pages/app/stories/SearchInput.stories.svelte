<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SearchInput from "../SearchInput.svelte";

  export const meta = {
    title: "App / Search / Search Input",
    component: SearchInput,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="default">
  <div class="container">
    <SearchInput value="project:example-project-123" />
  </div>
</Story>

<style>
  .container {
    padding: 2em;
  }
</style>
