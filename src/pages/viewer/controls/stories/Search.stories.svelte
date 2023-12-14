<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Viewer / Controls / Search",
    component: Search,
  };
</script>

<Story name="default">
  <div class="container">
    <Search />
  </div>
</Story>

<style>
  .container {
    height: 4em;
    position: relative;
  }
</style>
