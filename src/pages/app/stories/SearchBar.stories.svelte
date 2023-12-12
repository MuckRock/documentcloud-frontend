<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SearchBar from "../SearchBar.svelte";

  export const meta = {
    title: "App / Search / Search Bar",
    component: SearchBar,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template let:args>
  <div class="container">
    <SearchBar {...args} />
  </div>
</Template>

<Story name="default" args={{ search: "project:example-project-123" }} />

<Story
  name="compact"
  args={{ compact: true, search: "project:example-project-123" }}
/>

<Story
  name="example"
  args={{ example: true, search: "project:example-project-123" }}
/>

<Story
  name="dialog"
  args={{ dialog: true, search: "project:example-project-123" }}
/>

<style>
  .container {
    padding: 2em;
  }
</style>
